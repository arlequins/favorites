import { Payload, Response, UserData } from 'common'
import urlJoin from 'url-join'

import { Request } from './methods'

import { FAVORITES_URL } from './constant'

export const requestFavorites = async (payload: Payload, userData: UserData) => {
  let result: Response = {
    status: 500,
    payload: {},
  }

  try {
    result = await Request.get(urlJoin(FAVORITES_URL, 'favorites'), payload, userData)
  } catch(e) {
    // tslint:disable
    console.error('# ERROR IN requestFavorites: ', e)
  }

  return result
}
