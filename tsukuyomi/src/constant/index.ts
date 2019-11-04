const API_URL = process.env.API_URL ? process.env.API_URL : 'https://api.yukoyuko.net'
const API_V1 = process.env.API_V1 ? process.env.API_V1 : 'v1'

export const FAVORITES_URL = `${API_URL}/${API_V1}`
export const ENV = process.env.ENV ? process.env.ENV : 'production'
export const DEBUG = process.env.DEBUG ? process.env.DEBUG : false
