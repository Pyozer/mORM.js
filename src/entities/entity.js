export default class Entity {
    constructor(dbInstance, name) {
        this.dbInstance = dbInstance
        this.name = name
    }

    async save(data) {
        //this.dbInstance.save(this.name, data)
    }
    async count() {
        //this.dbInstance.count(this.name)
    }
    async findByPk(id, { attributes }) {
        //this.dbInstance.findByPk(this.name, id, attributes)
    }
    async findAll({ attributes }) {
        //this.dbInstance.findAll(this.name, attributes)
    }
    async findOne({ where, attributes }) {
        //this.dbInstance.findOne(this.name, where, attributes)
    }
    async update(data) {
        //this.dbInstance.update(this.name, data)
    }
    async remove(data) {
        //this.dbInstance.remove(this.name, data)
    }
}