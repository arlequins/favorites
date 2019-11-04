import { Payload, Response, UserData } from 'common'
import urlJoin from 'url-join'

import { Request } from './methods'

import { FAVORITES_URL } from './constant'

export const putUserFavorites = async (payload: Payload, userData: UserData) => {
  let result: Response = {
    status: 500,
    payload: {},
  }

  try {
    result = await Request.put(urlJoin(FAVORITES_URL, 'favorites'), payload, userData)
  } catch(e) {
    // tslint:disable
    console.error('# ERROR IN putUserFavorites: ', e)
  }

  return result
}

export const deleteUserFavorites = async (payload: Payload, userData: UserData) => {
  let result: Response = {
    status: 500,
    payload: {},
  }

  try {
    result = await Request.delete(urlJoin(FAVORITES_URL, 'favorites'), payload, userData)
  } catch(e) {
    // tslint:disable
    console.error('# ERROR IN deleteUserFavorites: ', e)
  }

  return result
}

export const requestUserFavorites = async (payload: Payload, userData: UserData) => {
  let result: Response = {
    status: 500,
    payload: {},
  }

  try {
    result = await Request.get(urlJoin(FAVORITES_URL, 'favorites'), payload, userData)
  } catch(e) {
    // tslint:disable
    console.error('# ERROR IN requestUserFavorites: ', e)
  }

  return result
}

export const requestAllFavorites = async (payload: Payload) => {
  let result: Response = {
    status: 500,
    payload: {},
  }

  try {
    result = await Request.get(urlJoin(FAVORITES_URL, 'count', 'favorites'), payload)
  } catch(e) {
    // tslint:disable
    console.error('# ERROR IN requestAllFavorites: ', e)
  }

  return result
}
