import mOrm from "./mOrm"
import Student from "./entities/student"

/*let orm = new mOrm({
    type: 'postgresql',
    host: 'localhost',
    port: 5432,
    username: 'podpak',
    password: '',
    database: 'podpak',
    synchronize: true,
    entities: [
        Student
    ],
})*/
let orm = new mOrm()

orm.createConnection({
    uri: 'postgresql://podpak:@localhost:5432/podpak',
    synchronize: true,
    entities: [
        Student
    ],
}).then(() => {
})

