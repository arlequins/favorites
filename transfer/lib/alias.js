// S: lib
const Moment = require('moment-timezone')
const MomentRange = require('moment-range')
const process = require('process')
const helpers = require('../helpers')
const axios = require('axios')
const moment = MomentRange.extendMoment(Moment)
// E: lib

const env = helpers.currentEnvironment(process.env)

const getTimeStamp = (name, aliasName, type) => {
  const dttm = name.replace(`${aliasName}-`, '')
  if (type === 'day') {
    return dttm.replace(/\./g, '-')
  } else {
    const replaceDttm = dttm.replace('-', ' ')
    return replaceDttm.replace(/\./g, '-')
  }
}

const setAliases = async (currentStatus, indexList, list, esUrl, type) => {
  let responses = []
  for (const aliasName of list) {
    console.log('# START INDEX:', aliasName)

    const currentIndexObj = currentStatus.filter(v => v.alias === aliasName)
    const allMatchIndexList = indexList.filter(v => v.index.startsWith(aliasName)).map(v => {
      const date = getTimeStamp(v.index, aliasName, type)
      v.date = date
      return v
    }).sort((a, b) => moment(a.date).tz('Asia/Tokyo') - moment(b.date).tz('Asia/Tokyo'))

    if (currentIndexObj.length > 0 && allMatchIndexList.length > 0) {
      const currentIndex = {
        index: currentIndexObj[0].index,
        count: Number.parseInt(allMatchIndexList.filter(v => v.index === currentIndexObj[0].index)[0]['docs.count']),
        date: getTimeStamp(currentIndexObj[0].index, aliasName, type),
      }

      const nextTarget = allMatchIndexList
      .filter(v => moment(v.date).tz('Asia/Tokyo') > moment(currentIndex.date).tz('Asia/Tokyo'))
      .filter(v => {
        return Number.parseInt(v['docs.count']) / currentIndex.count > 0.5
      })

      if (nextTarget.length > 0) {
        // name - aliasName
        const removeIndex = currentIndex.index
        const addIndex = nextTarget[0].index
        console.log('# REPLACE INDEX:', aliasName, ':', removeIndex, ' -> ', addIndex)
        // alias
        const response = await axios.post(`${esUrl}/_aliases?pretty`, {
          actions: [
            {
              remove : {
                index : removeIndex,
                alias : aliasName,
              },
            },
            {
              add : {
                index : addIndex,
                alias : aliasName,
              },
            }
          ],
        })

        responses.push(response)
      }
    } else if (currentIndexObj.length === 0 && allMatchIndexList.length > 0) {
      const currentIndex = {
        index: allMatchIndexList[allMatchIndexList.length - 1].index,
        count: Number.parseInt(allMatchIndexList[allMatchIndexList.length - 1]['docs.count']),
        date: getTimeStamp(allMatchIndexList[allMatchIndexList.length - 1].index, aliasName, type),
      }
      if (currentIndex.count > 0) {
        // name - aliasName
        const addIndex = currentIndex.index
        console.log('# ADD INDEX: IN ', aliasName, ':', addIndex)
        // alias
        const response = await axios.post(`${esUrl}/_aliases?pretty`, {
          actions: [
            { add : {
              index : addIndex,
              alias : aliasName,
              },
            }
          ],
        })

        responses.push(response)
      }
    }

    // delete old index
    if (allMatchIndexList.length > 2) {
      const targetIndex = allMatchIndexList[0]
      const indexName = targetIndex.index
      console.log('# DELETE OLD INDEX: ', indexName)
      const deleteResponse = await axios.delete(`${esUrl}/${indexName}`)
      console.log('# DELETE OLD INDEX STATUS:', deleteResponse.status)
    }
    console.log('# END INDEX:', aliasName)
  }

  return {
    response: responses.map(v => v.status),
    changed: responses.length,
    task: list.length,
  }
}

const fire = async () => {
  const esUrl = env.ELASTICSEARCH
  const targetIndex = {
    days: [
    ],
    hours: [
      `${env.ELASTICSEARCH_INDEX}-${env.ELASTICSEARCH_VERSION}`,
    ]
  }

  console.log(`# ALIAS START`)
  try {
    const aliases = await axios.get(`${esUrl}/_cat/aliases?format=json&pretty`)
    const allIndex = await axios.get(`${esUrl}/_cat/indices?format=json&pretty`)
    if (aliases.status === 200 && allIndex.status === 200) {
      const currentStatus = aliases.data
      const indexList = allIndex.data

      // check and replace days alias
      const dayResponse = await setAliases(currentStatus, indexList, targetIndex.days, esUrl, 'day')
      const hoursResponse = await setAliases(currentStatus, indexList, targetIndex.hours, esUrl, 'hours')
      console.log('# DAY RESPONSE: ', dayResponse)
      console.log('# HOURS RESPONSE: ', hoursResponse)
    }
  } catch(e) {
    console.error(e)
  }
  console.log(`# ALIAS END`)
}

const task = {
  fire: fire,
}

module.exports = fire
