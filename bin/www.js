const http = require('http')
const serverHandle = require('../app')

const PORT = 8000

const server = http.createServer(serverHandle)

server.on('connection', (req, res) => {
  console.log('connected')
})
server.on('request', (req, res) => {
  console.log('request')
})
server.listen(PORT)