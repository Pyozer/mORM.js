import Core from "./core"
import { Pool } from 'pg'
import Type from "./type"
import OrmLog from "../libs/mLogs";
import Entity from "../entities/entity";

export default class PostgreSQL extends Core {

    async initialize() {
        const { host, port, user, password, database, synchronize } = this
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
            OrmLog.print('Idle client error', err.message, err.stack)
        })

        if (synchronize)
            await this.dropTables()

        await this.initTables()
    }

    async initTables() {
        try {
            const entities = Object.values(this.entities);
            for (const entity of entities) {
                const { name, columns } = entity.meta()

                let fields = []
                for (const key in columns) {
                    const field = columns[key]
                    let type = this.getType(field.type)
                    if (!type) continue

                    const primaryKey = field.primary ? ' PRIMARY KEY' : ''
                    if (field.generated) type = 'SERIAL'
                    const optional = field.optional === true ? 'NULL' : 'NOT NULL';

                    fields.push(`${key} ${type}${primaryKey} ${optional}`)
                }

                await this.query(`CREATE TABLE IF NOT EXISTS ${name.toLowerCase()} ( ${fields.join(',')} )`)
                OrmLog.print(`Table ${name} has been created`);
            }
        } catch (e) {
            throw new Error(e.message);
        }
    }

    async dropTables() {
        await this.query(`DROP TABLE IF EXISTS ${Object.keys(this.entities).join(',')} CASCADE`)
    }

    getType(source) {
        if (source == Type.INTEGER) return "INT"
        if (source == Type.BOOLEAN) return "BOOLEAN"
        if (source == Type.DATE) return "DATE"
        if (source == Type.TIME) return "TIME"
        if (source == Type.STRING) return "TEXT"
        return undefined
    }

    async query(query, params) {
        const client = await this.pool.connect()
        try {
            const res = await client.query(query, params)
            return res
        } finally {
            client.release()
        }
    }

    async save(entity, data) {
        let fields = Object.keys(data).join(', ')
        let values = Object.values(data)
        let params = values.map((_, i) => `$${i + 1}`).join(', ')

        const res = await this.query(
            `INSERT INTO ${entity.name.toLowerCase()} (${fields}) VALUES(${params}) RETURNING *`,
            values
        )
        return res.rows[0]
    }

    async count(entity) {
        const res = await this.query(`SELECT COUNT(*) FROM ${entity.name.toLowerCase()}`)
        return res.rows[0].count
    }

    async findByPk(entity, id, { attributes = [] }) {
        return await this.findOne(entity, { [entity.getPK()]: id }, attributes)
    }

    async findAll(entity, { attributes = [] }) {
        const res = await this.query(`SELECT ${this.getFields(attributes)} FROM ${entity.name.toLowerCase()}`)
        return res.rows
    }

    async findOne(entity, where = {}, attributes = []) {
        let conditions = Object.keys(where).map((key, i) => `${key} = $${i + 1}`).join(' AND ')
        let values = Object.values(where)

        const res = await this.query(
            `SELECT ${this.getFields(attributes)} FROM ${entity.name.toLowerCase()} WHERE ${conditions} LIMIT 1`,
            values
        )
        return res.rows[0]
    }

    async update(entity, data) {
        let fields = Object.keys(data).map((k, i) => `${k} = $${i + 1}`).join(', ')
        let values = Object.values(data)
        values.push(data[entity.getPK()])

        const res = await this.query(
            `UPDATE ${entity.name.toLowerCase()} SET ${fields} WHERE ${entity.getPK()} = $${values.length} RETURNING *`,
            values
        )
        return res.rows[0]
    }

    async remove(entity, data) {
        const res = await this.query(
            `DELETE FROM ${entity.name.toLowerCase()} WHERE ${entity.getPK()} = $1 RETURNING *`,
            [data[entity.getPK()]]
        )
        return res.rows[0]
    }

    async hasOne(entity, foreignEntity) {
        const foreignPK = Entity.findPk(foreignEntity.meta())
        const foreignField = foreignEntity.name.toLowerCase() + foreignPK

        await this.query(`
            ALTER TABLE ${entity.name} ADD COLUMN ${foreignField} INT REFERENCES ${foreignEntity.name}(${foreignPK})
        `)

        OrmLog.print(`Table ${entity.name} has been altered to add ForeignKey`);
    }

    async manyToMany(entity, foreignEntity) {
        const tableName = `${entity.name}_${foreignEntity.name}`

        const entityPK = entity.getPK()
        const foreignPK = Entity.findPk(foreignEntity.meta())

        const entityField = entity.name.toLowerCase() + entityPK
        const foreignField = foreignEntity.name.toLowerCase() + foreignPK
        
        await this.query(`DROP TABLE IF EXISTS ${tableName} CASCADE`)

        await this.query(`
            CREATE TABLE ${tableName} (
                ${entityField} INT REFERENCES ${entity.name}(${entityPK}),
                ${foreignField} INT REFERENCES ${foreignEntity.name}(${foreignPK}),
                CONSTRAINT ID PRIMARY KEY (${entityField}, ${foreignField})
            )
        `)

        OrmLog.print(`Jointure table ${tableName} has been created !`);
    }
}