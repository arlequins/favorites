const makeTwo = (num: number): string => {
  const changeToString = `${num}`
  if (changeToString.length === 1) {
    return `0${num}`
  } else {
    return `${num}`
  }
}

export const loadjscssfile = (filename: any, filetype: any) => {
  let fileref: any
  if (filetype === 'js') {
    fileref = document.createElement('script')
    fileref.setAttribute('type', 'text/javascript')
    fileref.setAttribute('src', filename)
  } else if (filetype === 'css') {
    fileref = document.createElement('link')
    fileref.setAttribute('rel', 'stylesheet')
    fileref.setAttribute('type', 'text/css')
    fileref.setAttribute('href', filename)
  }
  if (typeof fileref !== 'undefined') {
    document.getElementsByTagName('head')[0].appendChild(fileref)
  }
}

export const setDate = (str: string) => {
  const today = str.length > 0 ? new Date(str) : new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const day = today.getDate()
  return `${year}.${makeTwo(month)}.${makeTwo(day)}`
}

export const setMonth = (str: string) => {
  const today = str.length > 0 ? new Date(str) : new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  return `${year}.${makeTwo(month)}`
}

// tslint:disable
const formatCount = (n: any, c: any, d: any, t: any) => {
  var c = isNaN(c = Math.abs(c)) ? 2 : c,
    d = d == undefined ? "." : d,
    t = t == undefined ? "," : t,
    s = n < 0 ? "-" : "",
    i: any = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
    j: any = (j = i.length) > 3 ? j % 3 : 0;

  return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "")
}

export const formatForMoney = (val: number) => {
  return formatCount(val, 0, '.', ',')
}
