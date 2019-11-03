'use strict'
const helpers = require('../helpers')

// S: PRIVATE METHOD
const setMutateInnerHits = (parentTypeId, rawInnerHits) => {
  let array = []

  if (rawInnerHits) {
    const innerHits = rawInnerHits && rawInnerHits.hits ? rawInnerHits.hits : {}
    if (innerHits.hasOwnProperty('total')) {
      const hits = innerHits.hits
      const filteredList = hits.filter(hit => hit._source.typeId === parentTypeId)

      if (filteredList) {
        array = filteredList.map(hit => hit._source.code)
      }
    }
  }

  return array
}

const setMutateResponse = (response) => {
  let obj = {
    total: -1,
    list: [],
  }

  if (response && response.hits && response.hits.total && response.hits.hits) {
    const total = response.hits.total && response.hits.total.value ? response.hits.total.value : 0
    const hits = response.hits.hits

    obj = {
      total: total,
      list: hits.map(hit => {
        const source = hit._source
        const rawInnerHits = hit.inner_hits.innerHits
        const typeId = source.typeId
        const innerHits = setMutateInnerHits(typeId, rawInnerHits)

        return {
          typeId: typeId,
          code: source.code,
          innerHits: innerHits,
        }
      })
    }
  }

  return obj
}
// E: PRIVATE METHOD

const getParentCountByUniqueId = async (client, INDEX, type, uniqueId) => {
  let count = -1

  try {
    const parentCountResponse = await client.count({
      index: INDEX,
      body: {
        query: {
          bool : {
            must : [
              { term : { type : 'primary' } },
              { term : { typeId : type } },
              { term : { uniqueId : uniqueId } }
            ]
          }
        }
      }
    })
    count = parentCountResponse.count
  } catch(e) {
    console.error('# ERROR IN getParentCountByUniqueId: ', e)
  }
  return count
}

const getMetaCountByUniqueId = async (client, INDEX, type, uniqueId) => {
  let count = -1
  try {
    const response = await client.count({
      index: INDEX,
      body: {
        query: {
          bool : {
            must : [
              { term : { type : 'primary' } },
              { term : { typeId : type } },
              { term : { uniqueId : uniqueId } },
              {
                has_child : {
                  type : 'meta',
                  query : {
                    bool : {
                      must : [
                        { term : { typeId : type } },
                      ],
                      disable_coord : false,
                      adjust_pure_negative : true,
                      boost : 1.0,
                    }
                  },
                  inner_hits: {
                    size: 10000,
                    from: 0,
                    name: 'innerHits',
                  }
                }
              }
            ]
          }
        }
      }
    })
    count = response.count
  } catch(e) {
    console.error('# ERROR IN getMetaCountByUniqueId', e)
  }
  return count
}

const getParentCount = async (client, INDEX, type, code, uniqueId) => {
  let count = -1

  let mustArray = [
    { term : { type : 'primary' } },
    { term : { typeId : type } },
    { term : { code : code } },
  ]
  if (uniqueId && uniqueId.length > 0) {
    mustArray.push({ term : { uniqueId : uniqueId } })
  }

  try {
    const parentCountResponse = await client.count({
      index: INDEX,
      body: {
        query: {
          bool : {
            must : mustArray,
          }
        }
      }
    })
    count = parentCountResponse.count
  } catch(e) {
    console.error('# ERROR IN getParentCount: ', e)
  }
  return count
}

const getMetaCount = async (client, INDEX, type, code, metaCode, uniqueId) => {
  let count = -1

  let mustArray = [
    { term : { type : 'primary' } },
    { term : { typeId : type } },
    { term : { code : code } },
    {
      has_child : {
        type : 'meta',
        query : {
          bool : {
            must : [
              { term : { typeId : type } },
              { term : { code : metaCode } },
            ],
            disable_coord : false,
            adjust_pure_negative : true,
            boost : 1.0,
          }
        },
        inner_hits: {
          size: 10000,
          from: 0,
          name: 'innerHits',
        }
      }
    }
  ]
  if (uniqueId && uniqueId.length > 0) {
    mustArray.push({ term : { uniqueId : uniqueId } })
  }

  try {
    const response = await client.count({
      index: INDEX,
      body: {
        query: {
          bool : {
            must : mustArray,
          }
        }
      }
    })
    count = response.count
  } catch(e) {
    console.error('# ERROR IN getMetaCount', e)
  }
  return count
}

// S: PUBLIC METHOD
const selectByUniqueIdAndType = async (client, INDEX, uniqueId, type) => {
  let obj = {
    total: -1,
    list: [],
  }
  try {
    const response = await client.search({
      index: INDEX,
      body: {
        query: {
          bool : {
            must : [
              { term : { uniqueId : uniqueId } },
              { term : { type : 'primary' } },
              { term : { typeId : type } },
            ],
            should: [
              {
                has_child : {
                  type : 'meta',
                  query : {
                    bool : {
                      must : [
                        { term : { typeId : type } }
                      ],
                      disable_coord : false,
                      adjust_pure_negative : true,
                      boost : 1.0,
                    }
                  },
                  inner_hits: {
                    size: 10000,
                    from: 0,
                    name: 'innerHits',
                  }
                }
              }
            ]
          }
        }
      }
    })

    obj = setMutateResponse(response)
  } catch(e) {
    console.error('# ERROR IN selectByParams:', e)
  }
  return obj
}

const setDeleteBulkJsonArray = async (client, INDEX, params) => {
  let array = []
  const parentId = `${params.uniqueId}_${params.type}_${params.code}`

  // put index
  if (!(params.metaCode && params.metaCode.length > 0)) {
    array.push({
      delete: {
        _index: INDEX,
        _type: '_doc',
        _id: parentId,
      }
    })

    // delete all meta
    const mutate = await selectByUniqueIdAndType(client, INDEX, params.uniqueId, params.type)

    if (mutate.total > 0) {
      const target = mutate.list.find(hit => parentId === `${params.uniqueId}_${hit.typeId}_${hit.code}`)
      if (target) {
        const targetInnerHits = target.innerHits

        if (targetInnerHits.length > 0) {
          for (const metaCode of targetInnerHits) {
            const targetMetaId = `${parentId}_${metaCode}`

            array.push({
              delete: {
                _index: INDEX,
                _type: '_doc',
                _id: targetMetaId,
                routing: parentId,
              }
            })
          }
        }
      }
    }
  }

  if (params.metaCode && params.metaCode.length > 0) {
    const metaId = `${parentId}_${params.metaCode}`

    array.push({
      delete: {
        _index: INDEX,
        _type: '_doc',
        _id: metaId,
        routing: parentId,
      }
    })
  }

  return array
}

const setUpsertBulkJsonArray = (INDEX, params) => {
  let array = []
  const parentId = `${params.uniqueId}_${params.type}_${params.code}`

  // put index
  array.push({
    index: {
      _index: INDEX,
      _type: '_doc',
      _id: parentId,
    }
  })

    // put data
  array.push({
    type: 'primary',
    uniqueId: params.uniqueId,
    typeId: params.type,
    code: params.code,
    metajoin: 'primary',
    '@timestamp': helpers.setDate().valueOf(),
    '@version': 1
  })

  if (params.metaCode && params.metaCode.length > 0) {
    const metaId = `${parentId}_${params.metaCode}`

    array.push({
      index: {
        _index: INDEX,
        _type: '_doc',
        _id: metaId,
        routing: parentId,
      }
    })

    // put data
    array.push({
      type: 'meta',
      uniqueId: params.uniqueId,
      typeId: params.type,
      code: params.metaCode,
      metajoin: {
        name: 'meta',
        parent: parentId,
      },
      '@timestamp': helpers.setDate().valueOf(),
      '@version': 1,
    })
  }

  return array
}

const upsertJson = async (client, array, action) => {
  let obj = {
    statusCode: 0,
    count: {
      create: -1,
      update: -1,
      total: -1,
    },
    response: {},
  }

  try {
    const upsert = await client.bulk({
      body: array,
    })

    const isError = upsert.errors

    if (!isError) {
      const items = upsert.items
      const createList = items.filter(item => item.index && item.index.result === 'created')
      const updateList = items.filter(item => item.index && item.index.result === 'updated')
      const deleteList = items.filter(item => item.delete && item.delete.result === 'deleted')
      const createCount = createList && createList.length > 0 ? createList.length : 0
      const updateCount = updateList && updateList.length > 0 ? updateList.length : 0
      const deleteCount = deleteList && deleteList.length > 0 ? deleteList.length : 0
      const totalCount = createCount + updateCount + deleteCount

      const count = action === 'index' ? {
        create: createCount,
        update: updateCount,
        total: totalCount,
      } : {
        delete: deleteCount,
        total: totalCount,
      }

      obj = {
        count: count,
        response: upsert,
        statusCode: 2,
      }
    }
  } catch(e) {
    console.error('# ERROR IN upsertJson: ', e)
    obj.statusCode = 1
  }
  return obj
}

const getCount = async (client, INDEX, type, code, metaCode, uniqueId) => {
  let count = {
    parent: -1,
    meta: -1,
  }

  try {
    if (code.length > 0) {
      const parentCountResponse = await getParentCount(client, INDEX, type, code, uniqueId)
      count.parent = parentCountResponse
    }

    if (metaCode.length > 0) {
      const metaCountResponse = await getMetaCount(client, INDEX, type, code, metaCode, uniqueId)
      count.meta = metaCountResponse
    }
  } catch(e) {
    console.error('# ERROR IN getCount: ', e)
  }
  return count
}
// E: PUBLIC METHOD

module.exports = {
  getParentCountByUniqueId: getParentCountByUniqueId,
  getMetaCountByUniqueId: getMetaCountByUniqueId,
  selectByUniqueIdAndType: selectByUniqueIdAndType,
  setDeleteBulkJsonArray: setDeleteBulkJsonArray,
  setUpsertBulkJsonArray: setUpsertBulkJsonArray,
  upsertJson: upsertJson,
  getCount: getCount,
}
