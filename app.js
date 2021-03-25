const express = require('express')
const morgan = require('morgan') // logger
const cors = require('cors')
const logger = require('./utils/logger')
const personRouter = require('./controllers/persons')
const middleware = require('./utils/middleware')
const config = require('./utils/config')
const mongoose = require('mongoose')

console.log('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })


morgan.token('res_body', function (req, res) { return JSON.stringify(req.body) })

const app = express()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status - :res_body - :response-time ms'))

app.use('/api/persons', personRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)


module.exports = app