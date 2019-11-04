'use strict'
const elasticsearch = require('elasticsearch')

const helpers = require('../../../helpers')
const mutation = require('../../../mutation')
const env = helpers.currentEnvironment()
const HandleError = require('../../../helpers/handleError')

const INDEX = `${env.ELASTICSEARCH_INDEX}-${env.ELASTICSEARCH_VERSION}`

module.exports = (server, version) => {
  const requestUri = `${version}/count/favorites`

  // get user's favorites info
  server.get(requestUri, async (req, res, next) => {
    const query = req.query

    const requestId = req.headers[env.X_REQUEST_ID]
    const uniqueId = req.headers && req.headers['authorization'] ? req.headers['authorization'] : ''

    const userInfo = {
      requestId: requestId,
      uniqueId: uniqueId,
    }

    const params = {
      ...userInfo,
      type: Number.parseInt(query.type, 10),
      code: query.code ? query.code : '',
      metaCode: query.meta_code ? query.meta_code : '',
    }

    let result = {
      status: 500,
      count: {
        parent: -1,
        meta: -1,
      },
      params: params,
    }

    try {
      const client = new elasticsearch.Client({
        host: env.ELASTICSEARCH_URI,
        log: 'info',
        requestTimeout: 300000,
        apiVersion: '7.2',
      })

      const count = await mutation.getCount(client, INDEX, params.type, params.code, params.metaCode, uniqueId)

      result = {
        status: 200,
        count: count,
        params: params,
      }

      res.json(result)
		} catch (e) {
      const message = e.message
      return next(HandleError.internalServer(res, message))
		}
  })
}