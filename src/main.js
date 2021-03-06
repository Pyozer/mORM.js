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
    const noteEntity = orm.getEntity('Note')
    await projectEntity.hasOne(Student)
    await projectEntity.manyToMany(Note)
    await studentEntity.hasMany(Note)

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

    // Insert a new Project
    const projectSaved = await projectEntity.save({
        name: 'Best project',
        description: 'Description of the best project',
        studentid: 1
    })
    console.log(`Inserted value: ${projectSaved.name}`)

    // Left join student project
    const { firstname: lfFirstName, name: lfProject } = await projectEntity.getStudent({
        where: { studentid: 1 }
    })
    console.log(`Find project's student: ${lfFirstName + ": " + lfProject}`);

    // Insert a new Note for User #1
    const noteSaved = await noteEntity.save({
        note: 17,
        studentid: 1
    })
    console.log(`Inserted value: ${noteSaved.note}`)
    const noteSaved2 = await noteEntity.save({
        note: 10,
        studentid: 1
    })
    console.log(`Inserted value: ${noteSaved2.note}`)

    // Left join student note
    const leftJoinStudentNote = await studentEntity.getNotes({
        where: { studentid: 1 }
    })
    console.log(`Find All: ${leftJoinStudentNote.map(({ firstname, note }) => firstname + ": " + note).join(', ')}`);
}

init()