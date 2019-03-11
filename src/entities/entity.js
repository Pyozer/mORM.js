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

    static findPk({ columns = {} }) {
        for (const key of Object.keys(columns))
            if (columns[key].primary)
                return key
        throw "Model doesn't have PrimaryKey !"
    }

    async save(data) {
        return this.dbInstance.save(this, data)
    }
    async count() {
        return this.dbInstance.count(this)
    }
    async findByPk(id, { attributes = [] }) {
        return this.dbInstance.findByPk(this, id, attributes)
    }
    async findAll({ attributes = [] }) {
        return await this.dbInstance.findAll(this, attributes)
    }
    async findOne({ where = {}, attributes = [] }) {
        return this.dbInstance.findOne(this, where, attributes)
    }
    async update(data) {
        return this.dbInstance.update(this, data)
    }
    async remove(data) {
        return this.dbInstance.remove(this, data)
    }

    async hasOne(entity, options) {
        return this.dbInstance.hasOne(this, entity, options)
    }

    async manyToMany(entity, options) {
        return this.dbInstance.manyToMany(this, entity, options)
    }
}