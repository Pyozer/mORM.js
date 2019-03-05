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

    async save(data) { }
    async count() { }
    async findByPk(id, { attributes }) { }
    async findAll({ attributes }) { }
    async findOne({ where, attributes }) { }
    async update(data) { }
    async remove(data) { }
}