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

        return this.pool
    }

    async initTables() {
        if (this.synchronize) {
            for (const entity of this.entities) {
                let table = entity.meta()
                await this.pool.query(`DROP TABLE IF EXISTS ${table.name}`)

                let fields = []
                for (const key in table.columns) {
                    if (table.columns.hasOwnProperty(key)) {
                        const field = table.columns[key]
                        let type = this.getType(field.type)

                        if (!type) continue

                        let primaryKey = ''
                        if (field.primary)
                            primaryKey = ' PRIMARY KEY'
                        if (field.generated) type = 'SERIAL'

                        fields.push(`${key} ${type}${primaryKey}`)
                    }
                }
                await this.pool.query(`CREATE TABLE IF NOT EXISTS ${table.name} ( ${fields.join(',')} )`)
            }
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
}