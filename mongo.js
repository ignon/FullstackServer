const mongoose = require('mongoose')

console.log(`
    Terminal might show "MongoError: circular dependency" error, which is "safe to ignore" error in MongoDB Node drivers:
    https://developer.mongodb.com/community/forums/t/warning-accessing-non-existent-property-mongoerror-of-module-exports-inside-circular-dependency/15411
`)

const argCount = process.argv.length

if (argCount < 3) {
    console.log('give password as an argument')
    process.exit(1)
}

const password = process.argv[2]

const url =
    `mongodb+srv://fullstack:${password}@cluster0.kktqx.mongodb.net/phonebook?retryWrites=true&w=majority`


mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
    important: Boolean
}, {
    pluralize: false
})

const Person = mongoose.model('Person', personSchema, "persons")

if (argCount === 3) {
    console.log('\n\n')
    Person.find({}).then(result => {
        console.log('phonebook:')
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`);
        })
        mongoose.connection.close()
    })
}
else if (argCount >= 5) {
    const name = process.argv[3]
    const number = process.argv[4]

    const person = new Person({
        name,
        number
    })
    
    person.save().then(response => {
        console.log(`\nAdded ${name} number ${number} to phonebook`);
        mongoose.connection.close()
    }).catch(err => {
        console.log(err)
    })
}    
