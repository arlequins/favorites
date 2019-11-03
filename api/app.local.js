'use strict'
const app = require('./app')
const port = 3000

const server = app.listen(port)

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 125 * 1000;

console.log(`listening on ${port}`)
