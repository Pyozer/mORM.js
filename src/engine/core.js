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

    initTables(pool) {
        throw "You must implement method initTables !"
    }

    getType(source) {
        throw "You must implement method getType !"
    }

    async save(data) {
        throw "You must implement method save !"
    }
    async count() {
        throw "You must implement method count !"
    }
    async findByPk(id, { attributes }) {
        throw "You must implement method findByPk !"
    }
    async findAll({ attributes }) {
        throw "You must implement method findAll !"
    }
    async findOne({ where, attributes }) {
        throw "You must implement method findOne !"
    }
    async update(data) {
        throw "You must implement method update !"
    }
    async remove(data) {
        throw "You must implement method remove !"
    }
}