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

import { UserData, Payload, FavoritesListCount } from 'common'

import { requestUserFavorites, requestAllFavorites, putUserFavorites, deleteUserFavorites } from './ApiRequestServices'
import { Tsukuyomi } from './tsukuyomi'
import { USER_FAVORITES_LIST, FAVORITES_LIST, USER_FAVORITES_BTN, USER_ACTION_FAVORITES_BTN } from './templates'

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
      case 'count':
        this.getAllFavorites(this.payload, this.targetId)
        break
      case 'event':
        this.setEventListenerFavorites(this.payload, this.userData, this.targetId)
        break
    }
  }

  async getCurrentBtnStatus(payload: Payload, userData: UserData) {
    let html = ''
    let response: any = {
      status: 500,
      payload: {},
    }
    let allResponse: any = {
      status: 500,
      payload: {},
    }

    try {
      response = await requestUserFavorites(payload, userData)
      allResponse = await requestAllFavorites(payload)

      if (response && response.hasOwnProperty('result') && response.result.hasOwnProperty('list')) {
        const type = payload.meta_code ? (payload.meta_code.length > 0 ? 1 : 0) : 0
        html = USER_FAVORITES_BTN(response.count, allResponse.count, type)
      }
    } catch(e) {
      console.error('# ERROR IN getCurrentBtnStatus: ', e)
    }

    return {
      count: response.count,
      allCount: allResponse.count,
      html: html,
    }
  }

  async getActionCurrentBtnStatus(allCount: FavoritesListCount, type: number) {
    let html = ''

    try {
      html = USER_ACTION_FAVORITES_BTN(allCount, type)
    } catch(e) {
      console.error('# ERROR IN getActionCurrentBtnStatus: ', e)
    }

    return html
  }

  async setEventListenerFavorites(payload: Payload, userData: UserData, targetId: string) {
    // get target data
    const targetElement = document.getElementById(targetId)
    const currentStatus = await this.getCurrentBtnStatus(payload, userData)
    if (targetElement) {
      targetElement.innerHTML = currentStatus.html
    }

    // add listener
    try {
      if (targetElement) {
        targetElement.addEventListener("click", async (_e) => {
          const isClicked = targetElement.getElementsByClassName('list-group-item-danger').length
          if (isClicked === 0) {
            const putResponse = await putUserFavorites(payload, userData)
            console.info('# putResponse:', putResponse)
            const putHtml = await this.getActionCurrentBtnStatus(currentStatus.allCount, 0)
            targetElement.innerHTML = putHtml
          } else {
            const delResponse = await deleteUserFavorites(payload, userData)
            console.info('# delResponse:', delResponse)
            const putHtml = await this.getActionCurrentBtnStatus(currentStatus.allCount, 1)
            targetElement.innerHTML = putHtml
          }
        })
      }
    } catch(e) {
      console.error('# ERROR IN setEventListenerFavorites:', e)
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
      console.error('# ERROR IN getUserFavorites: ', e)
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
      console.error('# ERROR IN getAllFavorites: ', e)
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

const init = {
  get: async () => {
    await new Favorites('get', 'user-favorites-list', {
      type: 0,
    }, window.TSUKUYOMI)
  },
  count: async () => {
    await new Favorites('count', 'favorites-list', {
      code: '0001',
      meta_code: '0001',
      type: 0,
    }, window.TSUKUYOMI)
  },
  event1: async () => {
    await new Favorites('event', 'event-favorites-1', {
      code: '0001',
      type: 0,
    }, window.TSUKUYOMI)
  },
  event2: async () => {
    await new Favorites('event', 'event-favorites-2', {
      code: '0001',
      meta_code: '0001',
      type: 0,
    }, window.TSUKUYOMI)
  },
}

const fire = async (window: Window) => {
  const pathname = window.location.pathname
  if (pathname === '/') {
    await init.get()
    await init.count()
  } else {
    await init.event1()
    await init.event2()
  }
}

fire(window)
