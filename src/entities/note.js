import Type from "../engine/type"
import Entity from "./entity"
import Project from "./project";
import Student from "./student";

export default class Note extends Entity {
    constructor(dbInstance) {
        super(dbInstance, 'Note')
    }

    getPK() {
        return Entity.findPk(Note.meta())
    }

    static meta() {
        return {
            name: "Note",
            columns: {
                id: {
                    primary: true,
                    type: Type.INTEGER,
                    generated: true
                },
                note: {
                    type: Type.INTEGER
                },
            }
        }
    }
}