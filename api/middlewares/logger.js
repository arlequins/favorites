'use strict'
const morgan = require('./morgan')
const path = require('path')
const stackTrace = require('stack-trace')
const {
  createLogger,
  format,
  transports
} = require('winston')
require('winston-daily-rotate-file')

const app = 'api'
const LOGS_DIR = process.env.LOG_LEVEL !== 'nodemon' ? `/var/log/${app}` : path.join(__dirname, '..', 'log')

const logger = createLogger({
  transports: [
    new transports.DailyRotateFile({
      name: 'error',
      level: 'error',
      filename: `${LOGS_DIR}/${app}-error.log`,
      colorize: false,
      prepend: true,
      datePattern: 'YYYY-MM-DD',
      handleExceptions: true,
      maxsize: 1024 * 1024 * 10,
      maxFiles: '14d',
    }),
  ],
  format: format.combine(format.printf(info => info.message.replace('\n', ''))),
  exitOnError: false,
})

const accessLogger = createLogger({
  transports: [
    new transports.DailyRotateFile({
      name: 'access',
      level: 'info',
      filename: `${LOGS_DIR}/${app}-access.log`,
      colorize: false,
      prepend: true,
      datePattern: 'YYYY-MM-DD',
      handleExceptions: true,
      maxsize: 1024 * 1024 * 10,
      maxFiles: '14d',
    }),
  ],
  format: format.combine(format.printf(info => info.message.replace('\n', ''))),
  exitOnError: false,
})

logger.stream = {
  write: function (data) {
    accessLogger.info(data)
  }
}

const Logger = {
  initRequestLogger: function (app) {
    app.use(
      morgan('jsonFormat', {
        stream: logger.stream,
        skip: (req, res) => {
          if (req.url == '/health') {
            return true
          } else {
            return false
          }
        }
      })
    )
  },

  debug: function () {
    if (process.env['NODE_ENV'] === 'development') {
      let cellSite = stackTrace.get()[1];
      logger.debug.apply(
        logger, [
          ...arguments,
          {
            FilePath: cellSite.getFileName(),
            LineNumber: cellSite.getLineNumber(),
          }
        ]
      );
    }
  },

  info: function () {
    let cellSite = stackTrace.get()[1];
    logger.info.apply(
      logger, [
        ...arguments,
        {
          FilePath: cellSite.getFileName(),
          LineNumber: cellSite.getLineNumber(),
        }
      ]
    )
  },

  warn: function () {
    let cellSite = stackTrace.get()[1];
    logger.warn.apply(
      logger, [
        ...arguments,
        {
          FilePath: cellSite.getFileName(),
          LineNumber: cellSite.getLineNumber(),
        }
      ]
    )
  },

  error: function () {
    let cellSite = stackTrace.get()[1];
    logger.error.apply(
      logger, [
        ...arguments,
        {
          filePath: cellSite.getFileName(),
          lineNumber: cellSite.getLineNumber(),
        }
      ]
    )
  },
}

module.exports = Logger
