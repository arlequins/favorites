import { Response } from 'common'
import urlJoin from 'url-join'

import { Request } from './methods'

import { FAVORITES_URL } from './constant'

export const requestFavoritesCount = async (params: any) => {
  let result: Response = {
    data: {},
    status: 404,
  }

  try {
    const response = await Request.get(urlJoin(FAVORITES_URL, 'favorites'), params)
    if (response.status === 200) {
      const data: any = response.data || {}
      result = {
        data: data,
        status: 200,
      }
    }
  } catch(e) {
    console.error('# ERROR IN requestFavoritesCount: ', e)
  }

  return result
}
