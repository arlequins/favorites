'use strict'
const currentEnvironment = (env) => {
  let config = {
    localhost: {},
    release: {},
    production: {},
  }

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

  const cmd = JSON.parse(env.npm_config_argv).original[1]
  const determinedCmd = {
    'start': 'localhost',
    'build': 'localhost',
    'build:localhost': 'localhost',
    'build:release': 'release',
    'build:production': 'production',
  }

  for (const key in config) {
    if (config.hasOwnProperty(key)) {
      const ele = config[key]
      ele.DEV_MODE = cmd === 'start' ? true : false
    }
  }

  const currentEnv = determinedCmd[cmd]
  if (currentEnv) {
    return config[currentEnv]
  } else {
    console.info('there is no environment. process in localhost')
    return config['localhost']
  }
}

module.exports = {
  currentEnvironment: currentEnvironment,
}
