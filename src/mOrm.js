import PostgreSQL from "./engine/postgresql"

export default class mOrm {
    configPathName = "./mOrm.config.json"
    config
    dbInstance

    async createConnection(dbConfig = {}) {
        // Init configuration
        this.config = await this.validateConfig(dbConfig)

        this.config.synchronize = dbConfig.synchronize
        this.config.entities = dbConfig.entities

        this.entities = {}
        dbConfig.entities.forEach(e => {
            this.entities[e.name] = e
        })

        if (this.config.type == "postgresql") {
            this.dbInstance = await new PostgreSQL(this.config).initialize()
        } else {
            throw (`${this.config.type} is not supported !`)
        }
    }

    async validateConfig(dbConfig) {
        // Check dbConfig pass in parameter
        if (dbConfig.type && dbConfig.host && dbConfig.username && dbConfig.password && dbConfig.database)
            return dbConfig
        if (dbConfig.uri) {
            const regex = /^(.*):\/\/(.*):(.*)@(.*):(\d+)\/(.*)$/
            const [, type, username, password, host, post, database] = regex.exec(dbConfig.uri)
            return { type, username, password, host, post, database }
        }

        let { readFile } = require('fs').promises
        let { join } = require('path')
        try {
            let configFile = await readFile(join(__dirname, this.configPathName))
            return JSON.parse(configFile)
        } catch (err) {
            throw ('No config was pass in parameter and there is no mOrm.config.js file !')
        }
    }
}