// Hi!
// Please use the front-end located "osa3/phonebook_client"

// Terminal might show "MongoError: circular dependency" error, which is "safe to ignore" error in MongoDB Node drivers:
// https://developer.mongodb.com/community/forums/t/warning-accessing-non-existent-property-mongoerror-of-module-exports-inside-circular-dependency/15411


const app = require('./app')
const config = require('./utils/config')
const http = require('http')    // server
const logger = require('./utils/logger')



const server = http.createServer(app)
server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})
