import { requestFavoritesCount } from './ApiRequestServices'

export class Tsukuyomi {
  userData: any
	event: any

  constructor (event: any, userData: any) {
    this.event = event
		this.userData = userData

    // initial
    this.fire()
    this.setListener(this.event, this.userData)
  }

  async fire () {
  }

	setListener (_requestLogs: any, _userData: any) {

	}
}
