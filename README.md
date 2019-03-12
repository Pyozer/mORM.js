# mORM.js

School project to learn how to dev an ORM for PostegreSQL (can be extend with other databases like MySQL, MongoDB)

## How to use it

### Initialize the database connection

You can define your own models in `entities`'s folder (like predefined Student, Project or Note).

When you have created your models, you must initialize the database connection :

```javascript
let orm = new mOrm()

await orm.createConnection({
    // Instead of uri, you can provide in separate parameters: database, host, ...
    uri: 'postgresql://podpak:@localhost:5432/podpak',
    synchronize: true, // DROP all tables at started
}, {
    // Your model list
    entities: [
        Student,
        Project,
        Note
    ],
})
```

### Manipulate data

After the database initialization, you have different methods that you can use with the models :

- save(data)
- count()
- findByPk(id, { attributes = [] } = {})
- findAll({ where = {}, attributes = [] } = {})
- findOne({ where = {}, attributes = [] } = {})
- update(data)
- remove(data)

To use theses methodes you have to do :

```javascript
const studentEntity = orm.getEntity('Student')
console.log(await studentEntity.count())
```

### Relations

mOrm.js support simple relations, you can have :

- Many-to-one
- One-To-Many
- Many-To-Many

To add a relation, you can do :

```javascript
// Get models instances
const studentEntity = orm.getEntity('Student')
const projectEntity = orm.getEntity('Project')
const noteEntity = orm.getEntity('Note')

// Add in Project table a student foreignKey
await projectEntity.hasOne(Student)
// Add join table, with note and project foreignKey
await projectEntity.manyToMany(Note)
// Add student foreignKey in Note
await studentEntity.hasMany(Note)
```

After doing this, you can have access to new methods.

With the previous example, you have access to :

```javascript
// Get project with student data, of student with id #1
const { firstname, name } = await projectEntity.getStudent({
    where: { studentid: 1 }
})
console.log(`Project's student: ${firstname + ": " + name}`);
```

```javascript
// Get all notes of student with id #1
const studentNotes = await studentEntity.getNotes({
    where: { studentid: 1 }
})
console.log(`
    Notes: ${studentNotes.map(e => e.firstname + ": " + e.note).join(', ')}
`);
```

You can see that a method `getStudent` has been added for relation `hasOne` and a method `getNotes` has been added for relation `hasMany`.
Obviously, the methods name depend on Table name defined in models.