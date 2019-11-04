// tslint:disable
declare global {
  interface Window {
    _babelPolyfill: any;
    YUKOYUKONET: any;
    dataLayer: any;
    TSUKUYOMI: any;
  }
}

if (! (window as Window)._babelPolyfill) {
  require("babel-polyfill")
}

import { requestFavoritesCount } from './ApiRequestServices'
import { Tsukuyomi } from './tsukuyomi'
import { FAVORITES } from './templates'

// main process
const event = async (_e: any, _userData: any, _eventType: string, _linkEle?: any) => {
}

class TsukuyomiYukoyuko extends Tsukuyomi {
  constructor (event: any, userData: any) {
    super(event, userData)
    // initial
    this.initFavorites()
  }

  // override all default fn
  async fire () {
  }

	setListener (_requestLogs: any) {
  }
  // E: override all default fn

  async initFavorites() {
    let response = {
      data: [],
    }
    try {
      response = await requestFavoritesCount({
        code: 'top',
      })
    } catch(e) {
      console.log('# CONNECTION ERROR: ', e)
    }

    if (response && response.hasOwnProperty('data') && response.data.length > 0) {
      const html = FAVORITES(response)
      const targetElement = document.getElementById('favorites')
      if (targetElement) {
        targetElement.innerHTML = html
      }
    }
  }
}

new TsukuyomiYukoyuko(event, {
  userAgent: window.navigator.userAgent || '',
  client_id: window.TSUKUYOMI.CLIENT_ID,
})
