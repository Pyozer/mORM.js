export default class Core {
    constructor({ host, port, username, password, database, synchronize = false, entities = [] }) {
        this.host = host
        this.port = port
        this.user = username
        this.password = password
        this.database = database
        this.synchronize = synchronize
        this.entities = entities
    }

    initTables() {
        throw "You must implement method initTables !"
    }

    getType(source) {
        throw "You must implement method getType !"
    }

    async save(tableName, data) {
        throw "You must implement method save !"
    }
    async count(tableName) {
        throw "You must implement method count !"
    }
    async findByPk(tableName, id, { attributes }) {
        throw "You must implement method findByPk !"
    }
    async findAll(tableName, { attributes }) {
        throw "You must implement method findAll !"
    }
    async findOne(tableName, { where, attributes }) {
        throw "You must implement method findOne !"
    }
    async update(tableName, data) {
        throw "You must implement method update !"
    }
    async remove(tableName, data) {
        throw "You must implement method remove !"
    }
}