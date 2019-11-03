'use strict'
const fs = require('fs')

// S: private
const escapeRegExp = (str) => {
  return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}
// E: private

const currentEnvironment = () => {
  const packageJson = require('../package.json').config
  const checkEnv = process.env.NODE_ENV ? 1 : 0
  const envStr = checkEnv === 1 ? process.env.NODE_ENV === 'production' ? 'production' : process.env.NODE_ENV === 'release' ? 'release' : 'localhost' : 'localhost'
  return packageJson[envStr]
}

const makeFolder = (distFolder) => {
  if (!fs.existsSync(distFolder)){
    fs.mkdirSync(distFolder)
  }
}

const makeTwo = (num) => {
  const changeToString = `${num}`
  if (changeToString.length === 1) {
    return `0${num}`
  } else {
    return `${num}`
  }
}

const replaceAll = (str, find, replace) => {
  if (str && find && replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
  } else {
    return str
  }
}

const setInteger = (str, defaultVal) => {
  let val = defaultVal
  try {
    const num = Number.parseInt(str)
    if (Number.isInteger(num)) {
      val = num
    }
  } catch(e) {
    console.error('# ERROR IN setInteger:', e)
  }
  return val
}

const snakeToCamel = (s) => {
  return s.replace(/(\_\w)/g, function(m){return m[1].toUpperCase()})
}

const camelToSnake = (s) => {
  return s.split(/(?=[A-Z])/).join('_').toLowerCase()
}

const convertArrayToSnakeCode = (list) => {
  let res = []

  for (const v of list) {
    let obj = {}
    for (const k in v) {
      if (v.hasOwnProperty(k)) {
        const ele = v[k]
        const camel = snakeToCamel(k)
        obj[camel] = ele
      }
    }
    res.push(obj)
  }
  return res
}

const convertObjToSnakeCode = (raw) => {
  let obj = {}
  for (const k in raw) {
    if (raw.hasOwnProperty(k)) {
      const ele = raw[k]
      const camel = snakeToCamel(k)
      obj[camel] = ele
    }
  }
  return obj
}

const convertNullToZero = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(v => {
      let returnObj = {}
      for (const key in v) {
        if (v.hasOwnProperty(key)) {
          const ele = v[key]
          if (ele === null) {
            returnObj[key] = ''
          } else {
            returnObj[key] = ele
          }
        }
      }
      return returnObj
    })
  } else {
    let returnObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const ele = obj[key]
        if (ele === null) {
          returnObj[key] = ''
        } else {
          returnObj[key] = ele
        }
      }
    }
    return returnObj
  }
}

const logHeader = (req) => {
  const getTargetHeader = (req, target) => (req.hasOwnProperty('headers') ? req.headers.hasOwnProperty(target)  ? req.headers[target] ? req.headers[target] : '-' : '-' : '-')
  return `${moment().tz('Asia/Tokyo').format()} ${getTargetHeader(req, env.X_REQUEST_ID)} [${req.route.path}]`
}

const formatCount = (n, c, d, t) => {
  var c = isNaN(c = Math.abs(c)) ? 2 : c,
    d = d == undefined ? "." : d,
    t = t == undefined ? "," : t,
    s = n < 0 ? "-" : "",
    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
    j = (j = i.length) > 3 ? j % 3 : 0;

  return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "")
}

const setDate = (str) => {
  if (str) {
    return moment(str).tz(timezone)
  } else {
    return moment().tz(timezone)
  }
}

module.exports = {
  currentEnvironment: currentEnvironment,
  makeFolder: makeFolder,
  makeTwo: makeTwo,
  replaceAll: replaceAll,
  setInteger: setInteger,
  snakeToCamel: snakeToCamel,
  camelToSnake: camelToSnake,
  convertArrayToSnakeCode: convertArrayToSnakeCode,
  convertObjToSnakeCode: convertObjToSnakeCode,
  convertNullToZero: convertNullToZero,
  logHeader: logHeader,
  formatCount: formatCount,
  setDate: setDate,
}
