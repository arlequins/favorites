'use strict'
const fs = require('fs')

const currentEnvironment = (env) => {
  const config = {
    localhost: {},
    release: {},
    production: {},
  }
  const currentTargetEnv = env.npm_config_env

  const array = ['localhost', 'release', 'production']
  for (const key in env) {
    if (env.hasOwnProperty(key)) {
      const ele = env[key]
      for (const v of array) {
        const targetKey = `npm_package_config_${v}_`
        if (key.startsWith(targetKey)) {
          const splitKey = key.split(targetKey)
          if (splitKey.length > 1) {
            config[v][splitKey[1]] = ele
          }
        }
      }
    }
  }

  if (!config.hasOwnProperty(currentTargetEnv) && !currentTargetEnv) {
    console.info('there is no environment. process in localhost')
    return config['localhost']
  }

  if (currentTargetEnv !== 'localhost' && currentEnvironment !== 'release' && currentEnvironment !== 'production') {
    console.error('mismatch on --env={}. localhost, release, production are allowed.')
    process.exit(128)
  }

  return config[currentTargetEnv]
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

module.exports = {
  currentEnvironment: currentEnvironment,
  makeFolder: makeFolder,
  makeTwo: makeTwo,
}
