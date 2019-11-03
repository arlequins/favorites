'use strict'
const helpers = require('../../../helpers')
const env = helpers.currentEnvironment()
const HandleError = require('../../../helpers/handleError')

module.exports = (server, version) => {
  const request = {
    get: `${version}/favorites`,
  }

  server.get(request.get, async (req, res, next) => {
    const requestId = req.headers[env.X_REQUEST_ID]
    const uniqueId = req.headers['authorization']

    const userInfo = {
      requestId: requestId,
      uniqueId: uniqueId,
    }

    const params = {
      ...userInfo,
    }

    try {
      let result = {}

      res.json({
        status: 200,
        result: {},
        params: params,
      })
		} catch (e) {
      const message = e.message
      return next(HandleError.internalServer(res, message))
		}
  })

  server.put(request.get, async (req, res, next) => {
    const body = req.body

    const requestId = req.headers[env.X_REQUEST_ID]
    const uniqueId = req.headers['authorization']

    const userInfo = {
      requestId: requestId,
      uniqueId: uniqueId,
    }
    const params = {
      ...userInfo,
      type: Number.parseInt(body.type, 10),
      code: body.code,
      metaCode: body.meta_code,
      action: Number.parseInt(body.action, 10), // 0: primary, 1: meta
    }

    try {
      let result = {}

      res.json({
        status: 200,
        result: {},
        params: params,
      })
		} catch (e) {
      const message = e.message
      return next(HandleError.internalServer(res, message))
		}
  })

  server.delete(request.get, async (req, res, next) => {
    const body = req.body

    const requestId = req.headers[env.X_REQUEST_ID]
    const uniqueId = req.headers['authorization']

    const userInfo = {
      requestId: requestId,
      uniqueId: uniqueId,
    }
    const params = {
      ...userInfo,
      type: Number.parseInt(body.type, 10),
      code: body.code,
      metaCode: body.meta_code,
      action: Number.parseInt(body.action, 10), // 0: primary, 1: meta
    }

    try {
      let result = {}

      res.json({
        status: 200,
        result: {},
        params: params,
      })
		} catch (e) {
      const message = e.message
      return next(HandleError.internalServer(res, message))
		}
  })
}