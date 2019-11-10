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

import { UserData, Payload, FavoritesListCount, Store } from 'common'

import { requestUserFavorites, requestAllFavorites, putUserFavorites, deleteUserFavorites } from './ApiRequestServices'
import { Tsukuyomi } from './tsukuyomi'
import { USER_FAVORITES_LIST, FAVORITES_LIST, USER_FAVORITES_BTN, USER_ACTION_FAVORITES_BTN, USER_META_FAVORITES_BTN } from './templates'

// main process
class Favorites extends Tsukuyomi {
  action: string
  payload: Payload
  targetId: string
  store: any
  storageName: string

  constructor (storageName: string, action: string, targetId: string, payload: Payload, userData: UserData, pathname?: string) {
    super(userData)

    this.action = action
    this.payload = payload
    this.targetId = targetId
    this.storageName = storageName

    const item = window.localStorage.getItem(storageName)
    this.store = this.getStorage(item)

    switch (this.action) {
      case 'get':
        this.getUserFavorites(this.store, this.payload, this.userData, this.targetId)
        break
      case 'count':
        this.getAllFavorites(this.payload, this.targetId)
        break
      case 'parentEvent':
        this.setEventListenerFavorites(this.store, this.payload, this.userData, this.targetId, 0, pathname)
        break
      case 'metaEvent':
        this.setEventListenerFavorites(this.store, this.payload, this.userData, this.targetId, 1, pathname)
        break
    }
  }

  getStorage(obj: any): Store {
    let json: Store = {
      uniqueId: '',
      count: {
        parent: -1,
        meta: -1,
      },
      currentPageCount: {
        parent: -1,
        meta: -1,
      },
      result: {
        total: 0,
        list: [],
      },
      flag: false,
    }

    if (obj) {
      try {
        const parse = JSON.parse(obj)
        if (parse && parse.hasOwnProperty('uniqueId') && parse.uniqueId.length > 0) {
          json = JSON.parse(obj)
          json.flag = true
        }
      } catch(e) {
        console.info('# INFO IN getStorage')
      }
    }
    return json
  }

  async initStore(store: Store, payload: Payload, userData: UserData) {
    let response: any = {
      status: 500,
      payload: {},
    }

    if (!store.flag) {
      try {
        const rawResponse = await requestUserFavorites(payload, userData)
        store = {
          uniqueId: rawResponse.payload.uniqueId,
          count: rawResponse.count,
          currentPageCount: {
            parent: -1,
            meta: -1,
            pathname: '',
          },
          result: {
            list: rawResponse.result.list,
            total: rawResponse.result.total,
          },
          flag: true,
        }
        // save ls
        window.localStorage.setItem(this.storageName, JSON.stringify(store))
        this.store = store
      } catch(e) {
        console.error('# ERROR IN getUserFavorites: ', e)
      }
    } else {
      response = {
        status: 200,
        count: store.count,
        currentPageCount: store.currentPageCount,
        result: {
          list: store.result.list,
        },
        uniqueId: store.uniqueId,
      }
    }

    return response
  }

  async getCurrentBtnStatus(response: Store, payload: Payload, type: Number, pathname?: string) {
    let html = ''
    let allResponse: any = {
      status: 500,
      payload: {},
    }

    try {
      allResponse = await requestAllFavorites(payload)

      const btnType = payload.meta_code ? (payload.meta_code.length > 0 ? 1 : 0) : 0
      if (type === 0) {
        html = USER_FAVORITES_BTN(response.count, allResponse.count, btnType)
      } else if (type === 1) {
        html = USER_META_FAVORITES_BTN(response.count, allResponse.count, btnType)
      }
    } catch(e) {
      console.error('# ERROR IN getCurrentBtnStatus: ', e)
    }

    let newAllCount = allResponse.count
    newAllCount.pathname = pathname ? pathname : ''

    return {
      count: response.count,
      allCount: newAllCount,
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

  setInStore(store: Store, currentType: string, actionType: Number, currentPageCount?: FavoritesListCount, pathname?: string) {
    let flag = false
    let newStore: Store = store

    if (currentType === 'all') {
      newStore.currentPageCount = currentPageCount && currentPageCount.hasOwnProperty('parent') ? currentPageCount : {
        parent: -1,
        meta: -1,
        pathname: pathname ? pathname : '',
      }
      if (window.location.pathname !== store.currentPageCount.pathname) {
        newStore.currentPageCount.pathname = pathname
      }
      flag = true
      // add
      window.localStorage.setItem(this.storageName, JSON.stringify(newStore))
      this.store = newStore
    } else {
      // plus
      console.log('# actionType:', actionType)
      if (actionType === 0) {
        const currentCount = newStore.count[currentType]
        console.log('# add:', currentCount)
        if (currentCount && currentCount === 0) {
          store.count[currentType] ++
          store.currentPageCount[currentType] ++
        }
      } else {
        // delete
        const currentCount = newStore.count[currentType]
        console.log('# delete:', currentCount)
        if (currentCount && currentCount > 0) {
          store.count[currentType] --
          store.currentPageCount[currentType] --
        }
      }
      flag = true

      // add
      window.localStorage.setItem(this.storageName, JSON.stringify(newStore))
      this.store = newStore
    }
    return flag
  }

  async setEventListenerFavorites(store: Store, payload: Payload, userData: UserData, targetId: string, type: number, pathname?: string) {
    const response: Store = await this.initStore(store, payload, userData)

    // get target data
    const targetElement = document.getElementById(targetId)
    const currentStatus = await this.getCurrentBtnStatus(response, payload, type, pathname)
    if (targetElement) {
      targetElement.innerHTML = currentStatus.html
    }

    // set all count
    const flag = this.setInStore(response, 'all', 0, currentStatus.allCount, pathname)

    // add listener
    try {
      if (flag && targetElement) {
        targetElement.addEventListener("click", async (_e) => {
          const isClicked = targetElement.getElementsByClassName('list-group-item-danger').length
          const currentType = type === 0 ? 'parent' : 'meta'
          console.log('# currentType:', currentType)
          console.log('# currentStatus:', currentStatus)
          console.log('# isClicked:', isClicked)
          console.log('# currentStatus.count[currentType]:', currentStatus.count[currentType])
          if (isClicked === 0) {
            if (currentStatus.count[currentType] === 0) {
              const putResponse = await putUserFavorites(payload, userData)
              // plus in ls
              const flag = this.setInStore(response, currentType, 0)

              console.info('# putResponse:', putResponse)
              if (flag) {
                const putHtml = await this.getActionCurrentBtnStatus(currentStatus.allCount, 0)
                targetElement.innerHTML = putHtml
              }
            }
          } else {
            if (currentStatus.count[currentType] > 0) {
              const delResponse = await deleteUserFavorites(payload, userData)
              // delete in ls
              const flag = this.setInStore(response, currentType, 1)

              console.info('# delResponse:', delResponse)
              if (flag) {
                const putHtml = await this.getActionCurrentBtnStatus(currentStatus.allCount, 1)
                targetElement.innerHTML = putHtml
              }
            }
          }
        })
      }
    } catch(e) {
      console.error('# ERROR IN setEventListenerFavorites:', e)
    }
  }

  async getUserFavorites(store: Store, payload: Payload, userData: UserData, targetId: string) {
    const response = await this.initStore(store, payload, userData)

    if (response && response.hasOwnProperty('result') && response.result.hasOwnProperty('list')) {
      const html = USER_FAVORITES_LIST(response.uniqueId ? response.uniqueId : '', response.result, response.count)
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
  get: async (storage: string) => {
    await new Favorites(storage, 'get', 'user-favorites-list', {
      type: 0,
    }, window.TSUKUYOMI)
  },
  count: async () => {
    await new Favorites('', 'count', 'favorites-list', {
      code: '0001',
      meta_code: '0001',
      type: 0,
    }, window.TSUKUYOMI)
  },
  event1: async (storage: string, pathname: string) => {
    await new Favorites(storage, 'parentEvent', 'event-favorites-1', {
      code: '0001',
      type: 0,
    }, window.TSUKUYOMI, pathname)
  },
  event2: async (storage: string, pathname: string) => {
    await new Favorites(storage, 'metaEvent', 'event-favorites-2', {
      code: '0001',
      meta_code: '0001',
      type: 0,
    }, window.TSUKUYOMI, pathname)
  },
}

const fire = async (window: Window, storage: string) => {
  const pathname = window.location.pathname
  if (pathname === '/') {
    await init.get(storage)
    await init.count()
  } else {
    await init.event1(storage, pathname)
    // await init.event2(storage, pathname)
  }
}

fire(window, 'favorites-local-storage')
