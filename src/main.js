import mOrm from "./mOrm"
import Student from "./entities/student"

async function init() {
    let orm = new mOrm()

    await orm.createConnection({
        uri: 'postgresql://podpak:@localhost:5432/podpak',
        synchronize: true,
        entities: [
            Student
        ],
    })

    let student = {
        firstname: 'Dora',
        lastname: 'Lexploratrice'
    }

    console.log(student);

    const studentEntity = orm.getEntity('Student')
    const countresult = await studentEntity.count();
    console.log(`Row count: ${countResult.rows[0].count}`);
    

    const saved = await studentEntity.save(student)
    console.log(`New student ${saved.firstname}`)
}

init()