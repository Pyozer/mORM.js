import PostgreSQL from "./engine/postgresql"
import OrmLog from "./libs/mLogs";

export default class mOrm {
    configPathName = "./mOrm.config.json"
    config
    dbInstance

    async createConnection(dbConfig = {}, extras = { entities: [] }, logging = true) {
        // Init configuration
        this.config = await this.validateConfig(dbConfig)

        this.config.synchronize = dbConfig.synchronize !== undefined ? dbConfig.synchronize : false;

        this.entities = {}
        extras.entities.forEach(e => {
            this.entities[e.name] = e
        })

        this.config.logging = logging

        if (this.config.type == "postgresql") {
            this.dbInstance = await new PostgreSQL(this.config, this.entities)
        } else {
            throw (`${this.config.type} is not supported !`)
        }
        await this.dbInstance.initialize()
        OrmLog.print(`Connected to ${this.config.database}`);
    }

    async validateConfig(dbConfig, canCallSelf = true) {
        // If config pass is correct
        if (dbConfig.type && dbConfig.host && dbConfig.username && dbConfig.password && dbConfig.database)
            return dbConfig
        // If URI pass, parse it
        if (dbConfig.uri) {
            const regex = /^(.*):\/\/(.*):(.*)@(.*):(\d+)\/(.*)$/
            const [, type, username, password, host, port, database] = regex.exec(dbConfig.uri)
            return { type, username, password, host, port, database }
        }
        if (!canCallSelf) throw ('The config file is not correct ! You must provide database informations or URI.')

        // Otherwise, get config file
        let { readFileSync, existsSync } = require('fs')
        let { join } = require('path')

        const configFilePath = join(__dirname, this.configPathName);

        if (!existsSync(configFilePath))
            throw ('No config was pass in parameter and there is no mOrm.config.js file !')

        let configFile = readFileSync(configFilePath)
        return validateConfig(JSON.parse(configFile), false)
    }

    getEntity(entityName) {
        const entity = this.entities[entityName]
        if (!entity)
            throw (`${entityName} is not a valid model !`)
        return new entity(this.dbInstance)
    }
}