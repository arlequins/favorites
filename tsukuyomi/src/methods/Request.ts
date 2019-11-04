import axios from 'axios'
import { AxiosResponse } from 'axios'
import { Payload, UserData } from 'common'
import querystring from 'querystring'

const methods = ['get', 'post', 'put', 'patch', 'delete']

interface Request {
  [key: string]: (endpoint: string, payload: Payload, userData?: UserData) => Promise<AxiosResponse>
}

export const Request = methods.reduce((request: Request, method) => ({
  ...request,
  [method]: async (endpoint: string, payload: Payload, userData?: UserData) => {
    const query = querystring.stringify(payload ? payload : {})
    const uri = method === 'get' ? `${endpoint}?${query}` : endpoint
    const data = method === 'get' ? '' : query
    const additionalHeader = method === 'get' ? {} : {'Content-Type': 'application/x-www-form-urlencoded'}

    const headers = {
      'x-request-id' : userData && userData.requestId ? userData.requestId : '',
      'Authorization' : userData && userData.uniqueId ? userData.uniqueId : '',
      ...additionalHeader,
    }

    const response: AxiosResponse = await axios(uri, {
      method,
      ...({
        data: data,
        headers: headers,
      }),
    })

    const results: any = await response.data

    if (response.status !== 200) {
      throw new Error('STATUS CODE IS NOT 200')
    }

    return results
  },
}), {} as Request)
