import Type from "../engine/type"
import Entity from "./entity"

export default class Student extends Entity {
    constructor(dbInstance) {
        super(dbInstance, 'Student')
    }

    getPK() {
        return 'id'
    }

    static meta() {
        return {
            name: "Student",
            columns: {
                id: {
                    primary: true,
                    type: Type.INTEGER,
                    generated: true
                },
                firstname: {
                    type: Type.STRING
                },
                lastname: {
                    type: Type.STRING
                },
                age: {
                    type: Type.INTEGER
                }
            }
        }
    }
}