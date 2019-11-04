// tslint:disable
declare global {
  interface Window {
    _babelPolyfill: any;
    TSUKUYOMI: any;
  }
}

if (! (window as Window)._babelPolyfill) {
  require("babel-polyfill")
}

import { UserData, Payload } from 'common'

import { requestUserFavorites, requestAllFavorites } from './ApiRequestServices'
import { Tsukuyomi } from './tsukuyomi'
import { USER_FAVORITES_LIST, FAVORITES_LIST } from './templates'

// main process
class Favorites extends Tsukuyomi {
  action: string
  payload: Payload
  targetId: string

  constructor (action: string, targetId: string, payload: Payload, userData: UserData) {
    super(userData)

    this.action = action
    this.payload = payload
    this.targetId = targetId

    switch (this.action) {
      case 'get':
        this.getUserFavorites(this.payload, this.userData, this.targetId)
        break
      case 'put':

        break
      case 'delete':

        break
      case 'count':
        this.getAllFavorites(this.payload, this.targetId)
        break
    }
  }

  async getUserFavorites(payload: Payload, userData: UserData, targetId: string) {
    let response: any = {
      status: 500,
      payload: {},
    }

    try {
      response = await requestUserFavorites(payload, userData)
    } catch(e) {
      console.log('# ERROR IN getUserFavorites: ', e)
    }

    if (response && response.hasOwnProperty('result') && response.result.hasOwnProperty('list')) {
      const html = USER_FAVORITES_LIST(userData.uniqueId ? userData.uniqueId : '', response.result, response.count)
      const targetElement = document.getElementById(targetId)
      if (targetElement) {
        targetElement.innerHTML = html
      }
    }
  }

  async getAllFavorites(payload: Payload, targetId: string) {
    let response: any = {
      status: 500,
      payload: {},
    }

    try {
      response = await requestAllFavorites(payload)
    } catch(e) {
      console.log('# ERROR IN getAllFavorites: ', e)
    }

    if (response && response.hasOwnProperty('count') && response.count.hasOwnProperty('parent')) {
      const html = FAVORITES_LIST(payload, response.count)
      const targetElement = document.getElementById(targetId)
      if (targetElement) {
        targetElement.innerHTML = html
      }
    }
  }
}

window.TSUKUYOMI = {
  requestId: 'ADWADWRWAAWBAWE1213',
  uniqueId: 'testtest1001'
};

// init user favorites list
(async () => {
  const response = await new Favorites('get', 'user-favorites-list', {
    type: 0,
  }, window.TSUKUYOMI)
  console.log(response)
  console.log('END OF get task')
})();

// init all favorites list
(async () => {
  const response = await new Favorites('count', 'favorites-list', {
    code: '0001',
    meta_code: '0001',
    type: 0,
  }, window.TSUKUYOMI)
  console.log(response)
  console.log('END OF count task')
})();
