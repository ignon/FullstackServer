const Person = require('../models/person')
const personRouter = require('express').Router()
const logger = require('../utils/logger')

personRouter.get('/', (request, response, next) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
    .catch(error => next(error))
})

personRouter.get('/:id', (request, response, next) => {
  const personID = request.params.id

  Person.findById(personID).then(person => {
    if (person) response.json(person)
    else        response.status(404).end()
  })
    .catch(error => next(error))
})

personRouter.delete('/:id', (request, response, next) => {
  const personID = request.params.id
  Person.findByIdAndRemove(personID)
    .then(result => {
      logger.info(result)
      if (result) response.status(204).end()
      else        response.status(400).json({ error: 'Person has already been removed from the server' })
    })
    .catch(error => next(error))
})

personRouter.put('/:id', (request, response, next) => {

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


personRouter.post('/', (request, response, next) => {

  const { name, number } = request.body
  const person = new Person({ name, number })

  person.save()
    .then(savedPerson => {
      logger.info(typeof savedPerson)
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

// personRouter.get('/info', (req, res) => {
//   Person.count({})
//     .then(personCount => {
//       res.status(200)
//       res.setHeader('Content-Type', 'text/html')
//       res.send(`<p>
//         Phonebook has info for ${personCount} people
//         <br>
//         ${(new Date()).toString()}
//         </p>`)
//     })
//     .catch(error => {
//       res.status(500)
//       res.setHeader('Content-Type', 'text/html')
//       res.send('<p>Accessing person count failed.</p>')
//     })
// })

module.exports = personRouter