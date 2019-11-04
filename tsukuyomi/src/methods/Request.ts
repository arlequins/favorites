import axios from 'axios'
import { AxiosResponse } from 'axios'

const methods = ['get', 'post', 'put', 'patch', 'delete']

interface Request {
  [key: string]: (endpoint: string, requestBody?: any) => Promise<AxiosResponse>
}

export const Request = methods.reduce((request: Request, method) => ({
  ...request,
  [method]: async (endpoint: string, requestBody?: any) => {
    const response: AxiosResponse = await axios(endpoint, {
      method,
      ...(requestBody !== undefined ? requestBody : {
        data: JSON.stringify(requestBody),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }),
    })

    const results: any = await response.data

    if (response.status !== 200) {
      throw new Error(results)
    }

    return results
  },
}), {} as Request)
