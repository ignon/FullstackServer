// Hi!
// Please use the front-end located "osa3/phonebook_client"

// Terminal might show "MongoError: circular dependency" error, which is "safe to ignore" error in MongoDB Node drivers:
// https://developer.mongodb.com/community/forums/t/warning-accessing-non-existent-property-mongoerror-of-module-exports-inside-circular-dependency/15411
require('dotenv').config()
const { response } = require('express')
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const Person = require('./models/person')

morgan.token('res_body', function (req, res) { return JSON.stringify(req.body) })

const PORT = process.env.PORT || 3001

app.use(cors()) // ??
app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status - :res_body - :response-time ms'))



app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    const personID = request.params.id

    Person.findById(personID).then(person => {
        if (person) response.json(person)
        else        response.status(404).end()
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    const personID = request.params.id
    Person.findByIdAndRemove(personID)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})


app.post('/api/persons', (request, response, next) => {
    const respondError = (error, status=400) => {
        response.status(status).json({error})
    }

    if (!request.body) {
        respondError('Request body must contain person in JSON format')
        return;
    }

    const {name, number} = request.body
    
    if (!name || typeof name !== 'string') {
        respondError('Field "name" must be a non-empty string')
        return;
    }

    if (!number || typeof number !== 'string') {
        respondError('Field "number" must be a non-empty string')
        return;
    }

    // const duplicate = persons.find(p => p.name == name) 
    // if (duplicate) {
    //     respondError('Name must be unique')
    //     return;
    // }

    const person = new Person({name, number})

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
    .catch(error => next(error))
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


const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}
const errorHandler = (error, request, response, next) => {
    console.log(error.message) 
    
    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    }
    next(error)
}

app.use(unknownEndpoint)
app.use(errorHandler)