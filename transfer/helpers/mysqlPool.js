'use strict'
const mysql = require('mysql')
const helpers = require('../helpers')
const util = require('util')
const env = helpers.currentEnvironment(process.env)

const debug = env.NODE_ENV === 'localhost' ? {
  debug: true,
} : {}

const pool = mysql.createPool({
  connectionLimit: 10,
  host: env.MARIADB_HOST,
  port: env.MARIADB_PORT,
  user: env.MARIADB_USER,
  password: env.MARIADB_PASSWORD,
  database: env.MARIADB_TABLE,
  trace: env.MARIADB_TRACE,
  ...debug,
})

pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.')
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.')
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused.')
    }
  }
  if (connection) connection.release()
  return
})

pool.query = util.promisify(pool.query)

module.exports = pool
