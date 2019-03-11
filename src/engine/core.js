import mDump from "../libs/mDump";

export default class Core {
    constructor({ type, host, port, username, password, database, synchronize = false }, entities) {
        this.type = type
        this.host = host
        this.port = port
        this.user = username
        this.password = password
        this.database = database
        this.synchronize = synchronize
        this.entities = entities
    }

    async dropTables() {
        throw "You must implement method dropTables !"
    }

    async initTables() {
        throw "You must implement method initTables !"
    }

    getType(source) {
        throw "You must implement method getType !"
    }

    getFields(attributes = []) {
        return (attributes.length == 0) ? '*' : attributes.join(', ')
    }

    async query(query, params) {
        throw "You must implement method query !"
    }

    async save(entity, data) {
        throw "You must implement method save !"
    }
    async count(entity) {
        throw "You must implement method count !"
    }
    async findByPk(entity, id, { attributes }) {
        throw "You must implement method findByPk !"
    }
    async findAll(entity, { where, attributes }) {
        throw "You must implement method findAll !"
    }
    async findOne(entity, { where, attributes }) {
        throw "You must implement method findOne !"
    }
    async update(entity, data) {
        throw "You must implement method update !"
    }
    async remove(entity, data) {
        throw "You must implement method remove !"
    }

    async hasOne(entity, foreignEntity) {
        throw "You must implement method hasOne !"
    }

    async manyToMany(entity, foreignEntity) {
        throw "You must implement method manyToMany !"
    }

    dump() {
        const { type, host, port, user, password, database } = this;
        mDump(`${type}://${user}:${password}@${host}:${port}/${database}`);
    }
}