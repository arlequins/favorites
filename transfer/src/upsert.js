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
// E: local variables

const setMutateInnerHits = (parentTypeId, rawInnerHits) => {
  let array = []

  if (rawInnerHits) {
    const innerHits = rawInnerHits && rawInnerHits.hits ? rawInnerHits.hits : {}
    if (innerHits.hasOwnProperty('total')) {
      const hits = innerHits.hits
      const filteredList = hits.filter(hit => hit._source.typeId === parentTypeId)

      if (filteredList) {
        array = filteredList.map(hit => ({
          metaId: hit._id,
          metaCode: hit._source.code,
        }))
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
          primaryId: hit._id,
          uniqueId: source.uniqueId,
          typeId: typeId,
          primaryCode: source.code,
          innerHits: innerHits,
        }
      })
    }
  }

  return obj
}

const fire = async (pool) => {
  const client = new elasticsearch.Client({
    host: env.ELASTICSEARCH_URI,
    log: 'info'
  })

  try {
    console.info('# START: UPSERT TASK')
    const queryTypes = await pool.query(`SELECT type_id, delete_flag FROM favorite_type WHERE delete_flag = false`)

    if (queryTypes.length === 0) {
      console.info('# ERROR IN SELECT TYPES')
      process.exit(1)
    }

    const typeIds = queryTypes.map(v => (v.type_id))

    console.log('## typeIds:', typeIds)

    // select by typeIds
    let parentResponse = {}
    let mutateObjs = {}
    let mutateForSql = {
      primary: [],
      meta: [],
    }

    for (const typeId of typeIds) {
      try {
        parentResponse = await client.search({
          index: INDEX,
          size: 10000,
          body: {
            query: {
              bool : {
                must : [
                  { term : { type : 'primary' } },
                  { term : { typeId : typeId } },
                ],
                should: [
                  {
                    has_child : {
                      type : 'meta',
                      query : {
                        bool : {
                          must : [
                            { term : { typeId : typeId } },
                          ],
                          disable_coord : false,
                          adjust_pure_negative : true,
                          boost : 1.0,
                        }
                      },
                      inner_hits: {
                        size: 100000,
                        from: 0,
                        name: 'innerHits',
                      }
                    }
                  }
                ],
              }
            }
          }
        })
      } catch(e) {
        console.error('# ERROR IN parentResponse: ', e)
        process.exit(1)
      }

      const currentResponse = setMutateResponse(parentResponse)
      const currentList = currentResponse && currentResponse.list && currentResponse.list.length > 0 ? currentResponse.list : []
      for (const obj of currentList) {
        const uniqueId = obj.uniqueId
        if (mutateObjs.hasOwnProperty(uniqueId)) {
          const targetPrimary = mutateObjs[uniqueId].primary.find(hit => hit.primaryCode === obj.primaryCode)

          if (!targetPrimary) {
            mutateObjs[uniqueId].primary.push({
              primaryId: obj.primaryId,
              typeId: obj.typeId,
              primaryCode: obj.primaryCode,
              uniqueId: uniqueId,
            })
          }

          const metaList = obj.innerHits

          for (const meta of metaList) {
            const targetMeta = mutateObjs[uniqueId].meta.find(hit => hit.metaId === obj.metaId)

            if (!targetMeta) {
              mutateObjs[uniqueId].meta.push({
                metaId: meta.metaId,
                primaryId: obj.primaryId,
                typeId: obj.typeId,
                metaCode: meta.metaCode,
                uniqueId: uniqueId,
              })
            }
          }
        } else {
          mutateObjs[uniqueId] = {
            primary: [],
            meta: [],
          }

          mutateObjs[uniqueId].primary.push({
            primaryId: obj.primaryId,
            typeId: obj.typeId,
            primaryCode: obj.primaryCode,
            uniqueId: uniqueId,
          })

          const metaList = obj.innerHits

          for (const meta of metaList) {
            mutateObjs[uniqueId].meta.push({
              metaId: meta.metaId,
              primaryId: obj.primaryId,
              typeId: obj.typeId,
              metaCode: meta.metaCode,
              uniqueId: uniqueId,
            })
          }
        }
      }
    }

    // make upsert array
    for (const uniqueId in mutateObjs) {
      if (mutateObjs.hasOwnProperty(uniqueId)) {
        const mutateObj = mutateObjs[uniqueId]

        for (const primary of mutateObj.primary) {
          mutateForSql.primary.push(primary)
        }

        for (const meta of mutateObj.meta) {
          mutateForSql.meta.push(meta)
        }
      }
    }

    console.log('## length of mutateForSql.primary:', mutateForSql.primary.length)
    console.log('## length of mutateForSql.meta:', mutateForSql.meta.length)

    // upsert
    let bulkValues = {
      primary: [],
      meta: [],
    }

    const rawCurrentPrimaryBatchCount = await pool.query('SELECT MIN(batch_count) as minCount, MAX(batch_count) as maxCount FROM favorite_primary')

    let currentPrimaryBatchCount = 1
    if (rawCurrentPrimaryBatchCount && rawCurrentPrimaryBatchCount.length > 0 && rawCurrentPrimaryBatchCount[0].minCount !== null) {
      currentPrimaryBatchCount = Number.parseInt(rawCurrentPrimaryBatchCount[0].maxCount, 10)
    }

    let primaryRows = 0
    for (const primary of mutateForSql.primary) {
      const value = `('${primary.primaryId}','${primary.uniqueId}', ${primary.typeId}, '${primary.primaryCode}', false, ${currentPrimaryBatchCount})`
      const upsertPrimary = await pool.query(`INSERT INTO favorite_primary (primary_id, unique_id, type_id, primary_code, delete_flag, batch_count) VALUES
      ${value}
        ON DUPLICATE KEY UPDATE primary_id=primary_id, unique_id=unique_id, type_id=type_id, primary_code=primary_code, delete_flag=false, batch_count=${currentPrimaryBatchCount + 1};`
      )
      primaryRows += upsertPrimary.affectedRows
    }

    console.log('## upsertPrimary')
    console.log('### affectedRows:', primaryRows)

    const rawCurrentMetaBatchCount = await pool.query('SELECT MIN(batch_count) as minCount, MAX(batch_count) as maxCount FROM favorite_meta')

    let currentMetaBatchCount = 1
    if (rawCurrentMetaBatchCount && rawCurrentMetaBatchCount.length > 0 && rawCurrentMetaBatchCount[0].minCount !== null) {
      currentMetaBatchCount = Number.parseInt(rawCurrentMetaBatchCount[0].maxCount, 10)
    }

    let metaRows = 0
    for (const meta of mutateForSql.meta) {
      const value = `('${meta.metaId}','${meta.primaryId}','${meta.uniqueId}', ${meta.typeId}, '${meta.metaCode}', false, ${currentMetaBatchCount})`
      const upsertMeta = await pool.query(`INSERT INTO favorite_meta (meta_id, primary_id, unique_id, type_id, meta_code, delete_flag, batch_count) VALUES
      ${value}
        ON DUPLICATE KEY UPDATE meta_id=meta_id, primary_id=primary_id, unique_id=unique_id, type_id=type_id, meta_code=meta_code, delete_flag=false, batch_count=${currentMetaBatchCount + 1};`)
        metaRows += upsertMeta.affectedRows
    }

    console.log('## upsertMeta')
    console.log('### affectedRows:', metaRows)

    // set delete_flag last batch_count
    console.log('## setPrimaryDeleteFlag')
    const primaryBatchCount = await pool.query('SELECT MIN(batch_count) as minCount, MAX(batch_count) as maxCount FROM favorite_primary WHERE delete_flag = false')
    if (primaryBatchCount && primaryBatchCount.length > 0 && primaryBatchCount[0].minCount !== null) {
      if (primaryBatchCount[0].minCount !== primaryBatchCount[0].maxCount) {
        const targetCount = primaryBatchCount[0].minCount
        const setPrimaryDeleteFlag = await pool.query(`UPDATE favorite_primary SET delete_flag = true WHERE batch_count = ${targetCount} AND delete_flag = false`)
        console.log('### affectedRows:', setPrimaryDeleteFlag.affectedRows)
      } else {
        console.log('### there is no new data in primary')
      }
    }

    console.log('## setMetaDeleteFlag')
    const metaBatchCount = await pool.query('SELECT MIN(batch_count) as minCount, MAX(batch_count) as maxCount FROM favorite_meta WHERE delete_flag = false')
    if (metaBatchCount && metaBatchCount.length > 0 && metaBatchCount[0].minCount !== null) {
      if (metaBatchCount[0].minCount !== metaBatchCount[0].maxCount) {
        const targetCount = metaBatchCount[0].minCount
        const setMetaDeleteFlag = await pool.query(`UPDATE favorite_meta SET delete_flag = true WHERE batch_count = ${targetCount} AND delete_flag = false`)
        console.log('### affectedRows:', setMetaDeleteFlag.affectedRows)
      } else {
        console.log('### there is no new data in meta')
      }
    }

    console.info('# END: UPSERT TASK')
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
