export default class Entity {
    constructor(dbInstance, name) {
        this.dbInstance = dbInstance
        this.name = name
    }

    static meta() {
        throw "You must implement static meta in your entity !"
    }

    getPK() {
        throw "You must implement getPK in your entity !"
    }

    async save(data) {
        return (await this.dbInstance.save(this, data)).rows[0]
    }
    async count() {
        return (await this.dbInstance.count(this)).rows[0].count
    }
    async findByPk(id, { attributes = [] }) {
        return (await this.dbInstance.findByPk(this, id, attributes)).rows[0]
    }
    async findAll({ attributes = [] }) {
        return (await this.dbInstance.findAll(this, attributes)).rows
    }
    async findOne({ where = {}, attributes = [] }) {  
        return (await this.dbInstance.findOne(this, where, attributes)).rows[0]
    }
    async update(data) {
        return (await this.dbInstance.update(this, data)).rows[0]
    }
    async remove(data) {
        return (await this.dbInstance.remove(this, data)).rows[0]
    }
}