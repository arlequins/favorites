import { UserData } from 'common'

export class Tsukuyomi {
  userData: UserData
  isInit: boolean

  constructor (userData: UserData) {
    // initial
    this.fire(userData)
  }

  fire (userData: UserData): void {
    if (userData.uniqueId && userData.uniqueId.length > 0) {
      this.userData = {
        requestId: userData.requestId,
        uniqueId: userData.uniqueId && userData.uniqueId.length > 0 ? userData.uniqueId : '',
      }
    }
    this.isInit = true
  }
}
