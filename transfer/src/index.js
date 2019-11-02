'use strict'

// S: lib
const Moment = require('moment-timezone')
const MomentRange = require('moment-range')
const moment = MomentRange.extendMoment(Moment)
const process = require('process')
const elasticsearch = require('elasticsearch')

const helpers = require('../helpers')
const pool = require('../helpers/mysqlPool')

const env = helpers.currentEnvironment(process.env)
// E: lib

// S: local variables
const INDEX = `${env.ELASTICSEARCH_INDEX}-${env.ELASTICSEARCH_VERSION}`
const INDEX_NAME = `${INDEX}-${moment().tz('Asia/Tokyo').format('YYYY.MM.DD-HH')}`
// E: local variables

const fire = async (pool) => {
  const client = new elasticsearch.Client({
    host: env.ELASTICSEARCH_URI,
    log: 'info'
  })

  try {
    console.info('# START: INDEX INDEX')

    console.info('# END: INDEX INDEX')
    process.exit(0)
  } catch(e) {
    console.error('# ERROR IN FIRE:', e)
    throw e
  }
}

const task = {
  fire: fire,
}

// process
task.fire(pool)
