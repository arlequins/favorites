declare module 'common' {
  interface Response {
    status: number
    error?: string
    count?: any
    result?: any
    payload: any
  }

  interface UserData {
    requestId: string
    uniqueId?: string
  }

  interface Payload {
    [key: string]: any
    code?: string
    meta_code?: string
    type: number
  }

  interface FavoritesListResult {
    total: number
    list: any[]
  }

  interface FavoritesListCount {
    [key: string]: any
    parent: number
    meta: number
    pathname?: string
  }

  interface Store {
    uniqueId: string
    count: FavoritesListCount
    currentPageCount: FavoritesListCount
    result: FavoritesListResult
    flag: boolean
  }
}
