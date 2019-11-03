'use strict'
module.exports.badRequest = (res, msg, log) => {
  if (log) {
    console.error(log)
  }
  const code = 400
  res.status(code)
  res.json({
    status: code,
    error: msg ? msg : '',
  })
}

module.exports.unauthorized = (res, msg, log) => {
  if (log) {
    console.error(log)
  }
  const code = 401
  res.status(code)
  res.json({
    status: code,
    error: msg ? msg : '',
  })
}

module.exports.forbidden = (res, msg, log) => {
  if (log) {
    console.error(log)
  }
  const code = 403
  res.status(code)
  res.json({
    status: code,
    error: msg ? msg : '',
  })
}

module.exports.notFound = (res, msg, log) => {
  if (log) {
    console.error(log)
  }
  const code = 404
  res.status(code)
  res.json({
    status: code,
    error: msg ? msg : '',
  })
}

module.exports.internalServer = (res, msg, log) => {
  if (log) {
    console.error(log)
  }
  const code = 500
  res.status(code)
  res.json({
    status: code,
    error: msg ? msg : '',
  })
}

module.exports.badGateway = (res, msg, log) => {
  if (log) {
    console.error(log)
  }
  const code = 502
  res.status(code)
  res.json({
    status: code,
    error: msg ? msg : '',
  })
}

module.exports.notImplemented = (res, msg, log) => {
  if (log) {
    console.error(log)
  }
  const code = 501
  res.status(code)
  res.json({
    status: code,
    error: msg ? msg : '',
  })
}

module.exports.serviceUnavailable = (res, msg, log) => {
  if (log) {
    console.error(log)
  }
  const code = 503
  res.status(code)
  res.json({
    status: code,
    error: msg ? msg : '',
  })
}

module.exports.timeout = (res, msg, log) => {
  if (log) {
    console.error(log)
  }
  const code = 504
  res.status(code)
  res.json({
    status: code,
    error: msg ? msg : '',
  })
}
