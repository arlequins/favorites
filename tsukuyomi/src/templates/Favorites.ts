import { FavoritesListCount, FavoritesListResult } from 'common'

export const FAVORITESLIST = (result: FavoritesListResult, count: FavoritesListCount) => {
  const html = `
    <div>
      <h1>Parent</h1>
      <h2>${count.parent}</h2>
    </div>
    <div>
      <h1>Meta</h1>
      <h2>${count.meta}</h2>
    </div>
    <div>
      <h1>Total</h1>
      <h2>${result.total}</h2>
    </div>
    <div>
      ${result.list.length > 0 ? result.list.map(card => `
      <div><span>typeId</span>${card.typeId}</div>
      <div><span>code</span>${card.code}</div>
      <div><span>innerHits</span>${card.innerHits.join(' | ')}</div>
      `) : ''}
    </div>
    `
  return html
}
