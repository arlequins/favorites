'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const compression = require('compression')
const app = express()
const router = express.Router()

app.set('view engine', 'pug')
app.use(cors({
  origin: '*',
  methods: 'GET,POST,OPTION',
  preflightContinue: true,
  credentials: true,
  optionsSuccessStatus: 204,
}))

router.use(compression())
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

if (process.env.LOG_LEVEL !== 'nodemon') {
  const logger = require('./middlewares/logger')
  logger.initRequestLogger(app)
}

// S: router default settings
router.get('/', (req, res) => {

  const host = `${req.protocol}://${req.hostname}${req.url}`

  res.json({
    url: host
  })
})

router.get('/health', (_req, res) => {
  res.json({status: 200})
})

require('./routes')(router)

app.use('/', router)
// E: router default settings

module.exports = app
