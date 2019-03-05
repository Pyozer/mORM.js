import Core from "./core"
import { Pool } from 'pg'
import Type from "./type"

export default class PostgreSQL extends Core {

    constructor(config) {
        super(config)
    }

    async initialize() {
        const { host, port, user, password, database } = this
        let config = {
            user,
            database,
            password,
            host,
            port,
            max: 10, // max number of clients in the pool
            idleTimeoutMillis: 30000
        }

        this.pool = new Pool(config)
        this.pool.on('error', (err, client) => {
            console.error('Idle client error', err.message, err.stack)
        })

        await this.initTables()
    }

    async initTables() {
        for (const entity of this.entities) {
            let { name, columns } = entity.meta()
            if (this.synchronize)
                await this.pool.query(`DROP TABLE IF EXISTS ${name.toLowerCase()}`)

            let fields = []
            for (const key in columns) {
                if (columns.hasOwnProperty(key)) {
                    const field = columns[key]
                    let type = this.getType(field.type)
                    if (!type) continue

                    let primaryKey = field.primary ? ' PRIMARY KEY' : ''
                    if (field.generated) type = 'SERIAL'

                    fields.push(`${key} ${type}${primaryKey}`)
                }
            }
            await this.pool.query(`CREATE TABLE IF NOT EXISTS ${name.toLowerCase()} ( ${fields.join(',')} )`)
        }
    }

    getType(source) {
        if (source == Type.INTEGER) return "INT"
        if (source == Type.BOOLEAN) return "BOOLEAN"
        if (source == Type.DATE) return "DATE"
        if (source == Type.TIME) return "TIME"
        if (source == Type.STRING) return "TEXT"
        return undefined
    }

    async save(entity, data) {
        let fields = Object.keys(data).join(', ')
        let values = Object.values(data)
        let params = values.map((_, i) => `$${i + 1}`).join(', ')

        return this.pool.query(
            `INSERT INTO ${entity.name.toLowerCase()} (${fields}) VALUES(${params}) RETURNING *`,
            values
        )
    }
    async count(entity) {
        return this.pool.query(`SELECT COUNT(*) FROM ${entity.name.toLowerCase()}`)
    }
    async findByPk(entity, id, { attributes = [] }) {
        return this.findOne(entity, { [entity.getPK()]: id }, attributes)
    }
    async findAll(entity, { attributes = [] }) {
        return this.pool.query(`SELECT ${this.getFields(attributes)} FROM ${entity.name.toLowerCase()}`)
    }
    async findOne(entity, where = {}, attributes = []) {
        let conditions = Object.keys(where).map((key, i) => `${key} = $${i + 1}`).join(' && ')
        let values = Object.values(where)

        return this.pool.query(
            `SELECT ${this.getFields(attributes)} FROM ${entity.name.toLowerCase()} WHERE ${conditions}`,
            values
        )
    }
    async update(entity, data) {
        let fields = Object.keys(data).map((k, i) => `${k} = $${i + 1}`).join(', ')
        let values = Object.values(data)
        values.push(data[entity.getPK()])

        return this.pool.query(
            `UPDATE ${entity.name.toLowerCase()} SET ${fields} WHERE ${entity.getPK()} = $${values.length} RETURNING *`,
            values
        )
    }
    async remove(entity, data) {
        return this.pool.query(
            `DELETE FROM ${entity.name.toLowerCase()} WHERE ${entity.getPK()} = $1 RETURNING *`,
            [data[entity.getPK()]]
        )
    }
}