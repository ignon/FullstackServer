// Hi!
// Please use the front-end located "osa3/phonebook_client"


const { response } = require('express')
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

morgan.token('res_body', function (req, res) { return JSON.stringify(req.body) })

const PORT = process.env.PORT || 3001


app.use(cors())
app.use(express.json())
app.use(express.static('build'))
app.use(morgan(':method :url :status - :res_body - :response-time ms'))

let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    }
]

app.get('/api/persons', (request, response) => {
    debugger
    
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const personID = Number(request.params.id)
    const person = persons.find(p => p.id === personID)

    if (!person) {
        response.status(404).end()
        return;
    }

    response.json(person)

})

app.delete('/api/persons/:id', (request, response) => {
    const personID = Number(request.params.id)
    persons = persons.filter(p => p.id !== personID)

    response.status(204).end()
})


app.post('/api/persons', (request, response) => {
    const respondError = (error, status=400) => {
        response.status(status).json({error})
    }

    if (!request.body) {
        respondError('Request body must contain person in JSON format')
        return;
    }

    console.log('1');
    

    const {name, number} = request.body
    
    if (!name || typeof name !== 'string') {
        respondError('Field "name" must be a non-empty string')
        return;
    }

    if (!number || typeof number !== 'string') {
        respondError('Field "number" must be a non-empty string')
        return;
    }

    const duplicate = persons.find(p => p.name == name) 
    if (duplicate) {
        respondError('Name must be unique')
        return;
    }

    const person = {
        name,
        number,
        id: Math.floor(
            Math.random() * Number.MAX_SAFE_INTEGER
        )
    }

    persons = persons.concat(person)
    response.json(person)
})


app.get('/info', (request, response) => {
    const page =
    `<!DOCTYPE html>
    <html><body>
    <p>
        Phonebook has info for ${persons.length} people
        <br>
        ${(new Date()).toString()}
    </p>
    </body></html>`
    
    response.setHeader('Content-Type', 'text/html')
    response.send(page)
})


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})