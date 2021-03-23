const express = require('express')
const morgan = require('morgan') // logger
const cors = require('cors')
const Person = require('./models/person')
const logger = require('./utils/logger')



morgan.token('res_body', function (req, res) { return JSON.stringify(req.body) })

app.use(cors())
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
      logger.info(result)
      if (result) response.status(204).end()
      else        response.status(400).json({ error: 'Person has already been removed from the server' })
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {

  const personID = request.params.id
  const personData = {
    name: request.body.name,
    number: request.body.number
  }

  const validationError = (new Person(personData)).validateSync()
  if (validationError) {
    return response.status(400).json({
      error: validationError.message
    })
  }

  Person.findByIdAndUpdate(personID, personData, { new: true }) /*, runValidators: true, context: 'query'*/
    .then(result => {
      if (result) response.status(200).json(result)
      else        response.status(400).json({ error: `${personData.name} has already been removed from the server` })
    })
    .catch(error => next(error))
})


app.post('/api/persons', (request, response, next) => {

  const { name, number } = request.body
  const person = new Person({ name, number })

  person.save()
    .then(savedPerson => {
      logger.info(typeof savedPerson)
      response.json(savedPerson)
    })
    .catch(error => next(error))
})


app.get('/info', (req, res) => {
  Person.count({})
    .then(personCount => {
      res.status(200)
      res.setHeader('Content-Type', 'text/html')
      res.send(`<p>
          Phonebook has info for ${personCount} people
          <br>
          ${(new Date()).toString()}
        </p>`)
    })
    .catch(error => {
      res.status(500)
      res.setHeader('Content-Type', 'text/html')
      res.send('<p>Accessing person count failed.</p>')
    })
})



const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
const errorHandler = (error, request, response, next) => {
  logger.info('Error handler: ', error.message)

  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    logger.info(error.message)
    return response.status(400).json({ error: error.message })
  }
  else if (error.message) {
    logger.info(error.message)
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(unknownEndpoint)
app.use(errorHandler)


module.exports = app