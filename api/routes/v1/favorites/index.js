'use strict'
const elasticsearch = require('elasticsearch')

const helpers = require('../../../helpers')
const mutation = require('../../../mutation')
const env = helpers.currentEnvironment()
const HandleError = require('../../../helpers/handleError')

const INDEX = `${env.ELASTICSEARCH_INDEX}-${env.ELASTICSEARCH_VERSION}`

module.exports = (server, version) => {
  const requestUri = `${version}/favorites`

  // get user's favorites info
  server.get(requestUri, async (req, res, next) => {
    const query = req.query

    const requestId = req.headers[env.X_REQUEST_ID]
    const uniqueId = req.headers['authorization']

    const userInfo = {
      requestId: requestId,
      uniqueId: uniqueId,
    }

    const params = {
      ...userInfo,
      type: Number.parseInt(query.type, 10),
    }

    let result = {
      status: 500,
      total: 0,
      result: [],
      payload: params,
    }

    try {
      const client = new elasticsearch.Client({
        host: env.ELASTICSEARCH_URI,
        log: 'info',
        requestTimeout: 300000,
        apiVersion: '7.2',
      })

      const mutate = await mutation.selectByUniqueIdAndType(client, INDEX, params.uniqueId, params.type)
      const parentCount = await mutation.getParentCountByUniqueId(client, INDEX, params.type, params.uniqueId)
      const metaCount = await mutation.getMetaCountByUniqueId(client, INDEX, params.type, params.uniqueId)

      result = {
        status: 200,
        count: {
          parent: parentCount,
          meta: metaCount,
        },
        result: mutate,
        payload: params,
      }

      res.json(result)
		} catch (e) {
      const message = e.message
      return next(HandleError.internalServer(res, message))
		}
  })

  server.put(requestUri, async (req, res, next) => {
    const body = req.body

    const requestId = req.headers[env.X_REQUEST_ID]
    const uniqueId = req.headers['authorization']

    const userInfo = {
      requestId: requestId,
      uniqueId: uniqueId,
    }
    const params = {
      ...userInfo,
      type: Number.parseInt(body.type ? body.type : 0, 10),
      code: body.code ? body.code : '',
      metaCode: body.meta_code ? body.meta_code : '',
    }

    let result = {
      status: 500,
      result: -1,
      payload: params,
    }

    try {
      const client = new elasticsearch.Client({
        host: env.ELASTICSEARCH_URI,
        log: 'info',
        requestTimeout: 300000,
        apiVersion: '7.2',
      })

      // check count
      const count = await mutation.getCount(client, INDEX, params.type, params.code, params.metaCode, params.uniqueId)

      if ((count.parent === 0 && count.meta === 0) || (count.parent === 1 && count.meta === 0) || (count.parent === 0 && count.meta === -1)) {
        const array = mutation.setUpsertBulkJsonArray(INDEX, params)
        const response = await mutation.upsertJson(client, array, 'index')

        result = {
          status: 200,
          result: {
            status: response.status,
            count: response.count,
          },
          payload: params,
        }

        res.json(result)
      } else {
        const count = await mutation.getCount(client, INDEX, params.type, params.code, params.metaCode)
        const message = 'code or meta_code is bad request'
        result = {
          status: 400,
          error: message,
          count: count,
          payload: params,
        }

        res.json(result)
      }
		} catch (e) {
      const message = e.message
      return next(HandleError.internalServer(res, message))
		}
  })

  server.delete(requestUri, async (req, res, next) => {
    const body = req.body

    const requestId = req.headers[env.X_REQUEST_ID]
    const uniqueId = req.headers['authorization']

    const userInfo = {
      requestId: requestId,
      uniqueId: uniqueId,
    }
    const params = {
      ...userInfo,
      type: Number.parseInt(body.type ? body.type : 0, 10),
      code: body.code ? body.code : '',
      metaCode: body.meta_code ? body.meta_code : '',
    }

    let result = {
      status: 500,
      result: -1,
      payload: params,
    }

    try {
      const client = new elasticsearch.Client({
        host: env.ELASTICSEARCH_URI,
        log: 'info',
        requestTimeout: 300000,
        apiVersion: '7.2',
      })

      const array = await mutation.setDeleteBulkJsonArray(client, INDEX, params)
      const response = await mutation.upsertJson(client, array, 'delete')

      result = {
        status: 200,
        result: {
          status: response.status,
          count: response.count,
        },
        payload: params,
      }

      res.json(result)
		} catch (e) {
      const message = e.message
      return next(HandleError.internalServer(res, message))
		}
  })
}