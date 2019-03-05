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

    async save(tableName, data) {
        //this.dbInstance.save(this.name, data)
    }
    async count(tableName) {
        return this.pool.query(`SELECT COUNT(*) FROM ${tableName.toLowerCase()}`)
    }
    async findByPk(tableName, id, { attributes }) {
        //this.dbInstance.findByPk(this.name, id, attributes)
    }
    async findAll(tableName, { attributes }) {
        //this.dbInstance.findAll(this.name, attributes)
    }
    async findOne(tableName, { where, attributes }) {
        //this.dbInstance.findOne(this.name, where, attributes)
    }
    async update(tableName, data) {
        //this.dbInstance.update(this.name, data)
    }
    async remove(tableName, data) {
        //this.dbInstance.remove(this.name, data)
    }
}