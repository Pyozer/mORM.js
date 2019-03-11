import mOrm from "./mOrm"
import Student from "./entities/student"
import Project from "./entities/project";
import Note from "./entities/note";

async function init() {
    let orm = new mOrm()

    await orm.createConnection({
        uri: 'postgresql://podpak:@localhost:5432/podpak',
        synchronize: true,
    }, {
        entities: [
            Student,
            Project,
            Note
        ],
    })


    orm.dbInstance.dump()

    const studentEntity = orm.getEntity('Student')
    const projectEntity = orm.getEntity('Project')
    await projectEntity.hasOne(Student)
    await projectEntity.manyToMany(Note)

    // Count number of rows
    const countResult = await studentEntity.count();
    console.log(`Row count: ${countResult}`);

    // Insert a new Student
    const student1Saved = await studentEntity.save({
        firstname: 'Dora',
        lastname: 'L\'exploratrice'
    })
    console.log(`Inserted value: ${student1Saved.firstname}`)

    // Count number of rows
    const countResult2 = await studentEntity.count();
    console.log(`Row count: ${countResult2}`);

    // Insert a new Student
    const student2Saved = await studentEntity.save({
        firstname: 'Chipeur',
        lastname: 'Arrête de chiper !',
        age: 12
    })
    console.log(`Inserted value: ${student2Saved.firstname}`)

    // Search Student by primary key
    const findByPkResult = await studentEntity.findByPk(1, {});
    console.log(`Find By Pk: ${findByPkResult.firstname}`);

    // Get all Student
    const findAllResult = await studentEntity.findAll({});
    console.log(`Find All: ${findAllResult.map(e => e.firstname).join(', ')}`);

    // Get Student with firstname = Chipeur
    const findOneResult = await studentEntity.findOne({
        where: { firstname: "Chipeur" },
        attributes: ["lastname"]
    });
    console.log(`Find one: ${findOneResult.lastname}`)

    // Update student
    findByPkResult.lastname = "LastnameEdited"
    const studentUpdated = await studentEntity.update(findByPkResult)
    console.log(`Edited value: ${studentUpdated.lastname}`)

    // Search Student by primary key
    const findUpdatedStudent = await studentEntity.findByPk(1, {});
    console.log(`Find By Pk: ${findUpdatedStudent.lastname}`);

    // Delete student
    const studentRemoved = await studentEntity.remove(findUpdatedStudent)
    console.log(`Removed value: ${studentRemoved.id}`)
}

init()