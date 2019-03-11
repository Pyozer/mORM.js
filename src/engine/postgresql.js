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

    async hasOne(entity, foreignEntity, { fieldName }) {
        if (!fieldName) throw 'You must provide the column name to create the foreignKey !'

        const foreignEntityPK = Entity.findPk(foreignEntity.meta())

        await this.query(`ALTER TABLE ${entity.name} ADD COLUMN ${fieldName} ${this.getType(Type.INTEGER)}`)
        await this.query(`ALTER TABLE ${entity.name} ADD FOREIGN KEY (${fieldName}) REFERENCES ${foreignEntity.name}(${foreignEntityPK})`)

        OrmLog.print(`Table ${entity.name} has been altered to add ForeignKey`);
    }

    async manyToMany(entity, foreignEntity, { tableName }) {
        if (!tableName) throw 'You must provide the join table name to create the foreignKeys !'

        const foreignEntityPK = foreignEntity.name.toLowerCase() + Entity.findPk(foreignEntity.meta())
        const entityPK = entity.name.toLowerCase() + entity.getPK()

        const columns = [foreignEntityPK, entityPK].map(c => `${c} ${this.getType(Type.INTEGER)} NOT NULL`).join(',')
        
        await this.query(`DROP TABLE IF EXISTS ${tableName}`)
        await this.query(`CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`)

        await this.query(`ALTER TABLE ${tableName} ADD FOREIGN KEY (${foreignEntityPK}) REFERENCES ${foreignEntity.name}(${foreignEntityPK})`)
        await this.query(`ALTER TABLE ${tableName} ADD FOREIGN KEY (${entityPK}) REFERENCES ${entity.name}(${entityPK})`)

        OrmLog.print(`Table ${tableName} has been created !`);
    }
}