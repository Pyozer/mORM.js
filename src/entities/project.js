import Type from "../engine/type"
import Entity from "./entity"
import Student from "./student";

export default class Project extends Entity {
    constructor(dbInstance) {
        super(dbInstance, 'Project')
    }

    getPK() {
        return Entity.findPk(Project.meta())
    }

    static meta() {
        return {
            name: "Project",
            columns: {
                id: {
                    primary: true,
                    type: Type.INTEGER,
                    generated: true
                },
                name: {
                    type: Type.STRING
                },
                description: {
                    type: Type.STRING
                },
            }
        }
    }
}