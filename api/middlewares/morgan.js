'use strict'
const morgan = require('morgan')
const moment = require('moment-timezone')
const helpers = require('../helpers')
const env = helpers.currentEnvironment()

const changeToNumber = (str, type) => {
  let num = 0
  try {
    if (type === 'integer') {
      num = Number.parseInt(str)
    } else if (type === 'float') {
      num = Number.parseFloat(str)
    }
  } catch(e) {
    console.error(e)
  }

  return num
}

morgan.token('current-time', (req, res, tz) => {
  return moment().tz('Asia/Tokyo').format()
})

morgan.token('real-ip', (req, res) => {
  if (req.headers.hasOwnProperty('x-real-ip')) {
    return req.headers['x-real-ip']
  } else {
    return req.ip
  }
})

morgan.token('x-forwarded-for', (req, res) => {
  if (req.headers.hasOwnProperty('x-forwarded-for')) {
    return req.headers['x-forwarded-for']
  } else {
    return req.ip
  }
})

morgan.token('x-request-id', (req) => {
  if (req.headers.hasOwnProperty(env.X_REQUEST_ID)) {
    return req.headers[env.X_REQUEST_ID]
  } else {
    return ''
  }
})

morgan.token('url-query', (req) => {
  if (req.query) {
    return JSON.stringify(req.query)
  } else {
    return {}
  }
})

morgan.token('url-pathname', (req) => {
  if (req.route) {
    if (req.route.path) {
      return req.route.path
    } else {
      return ''
    }
  } else {
    return ''
  }
})

morgan.token('app-token', (req) => {
  const token = req.get('Authorization')
  if (token) {
    const matches = token.match(/Bearer\s(\S+)/)
    if (!matches) {
      return ''
    } else {
      return matches[1]
    }
  } else {
    return ''
  }
})

const jsonFormat = (tokens, req, res) => {
  const query = tokens['url-query'](req, res)

  const version = changeToNumber(tokens['http-version'](req, res), 'float')
  const status = changeToNumber(tokens['status'](req, res), 'integer')
  const contentLength = changeToNumber(tokens['res'](req, res, 'content-length'), 'integer')

  return JSON.stringify({
      timestamp: tokens['current-time'](req, res, 'iso'),
      method: tokens['method'](req, res),
      url: {
        query: query,
        pathname: tokens['url-pathname'](req, res),
      },
      version: version,
      status: status,
      contentLength: contentLength,
      referrer: tokens['referrer'](req, res),
      userAgent: tokens['user-agent'](req, res),
      forwarded: tokens['x-forwarded-for'](req, res),
      realIp: tokens['real-ip'](req, res),
      requestId: tokens['x-request-id'](req, res),
      appToken: tokens['app-token'](req, res),
  });
}

morgan.format('jsonFormat', jsonFormat)

module.exports = morgan
