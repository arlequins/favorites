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

import { requestFavorites } from './ApiRequestServices'
import { Tsukuyomi } from './tsukuyomi'
import { FAVORITESLIST } from './templates'

// main process
class Favorites extends Tsukuyomi {
  action: string
  payload: Payload

  constructor (action: string, payload: Payload, userData: UserData) {
    super(userData)

    this.action = action
    this.payload = payload

    switch (this.action) {
      case 'get':
        this.getFavorites(this.payload, this.userData)
        break
      case 'put':

        break
      case 'delete':

        break
      case 'count':

        break
    }
  }

  async getFavorites(payload: Payload, userData: UserData) {
    let response: any = {
      status: 500,
      payload: {},
    }

    try {
      response = await requestFavorites(payload, userData)
    } catch(e) {
      console.log('# ERROR IN getFavorites: ', e)
    }

    if (response && response.hasOwnProperty('result') && response.result.hasOwnProperty('list')) {
      const html = FAVORITESLIST(response.result, response.count)
      const targetElement = document.getElementById('favorites-list')
      if (targetElement) {
        targetElement.innerHTML = html
      }
    }
  }
}

new Favorites('get', {
  code: '0001',
  meta_code: '0001',
  type: 0,
}, {
  requestId: window.TSUKUYOMI.requestId || '',
  uniqueId: window.TSUKUYOMI.uniqueID,
})
