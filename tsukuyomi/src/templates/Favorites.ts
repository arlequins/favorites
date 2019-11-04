import { FavoritesListCount, FavoritesListResult, Payload } from 'common'

export const USER_FAVORITES_LIST = (uniqueId: string, result: FavoritesListResult, count: FavoritesListCount) => {
  const html = `
    </div>
    <div class="container">
      <h1 class="display-4">USER FAVORITES LIST</h1>
      <h3 class="display-8">UNIQUEID</h1>
      <p class="lead">${uniqueId}</p>

      <div class="row pb-4">
        <div class="col">
          <h2>COUNT</h2>
          <ul class="list-group">
            <li class="list-group-item d-flex justify-content-between align-items-center">
              TOTAL
              <span class="badge badge-primary badge-pill">${count.parent + count.meta}</span>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
              PARENT
              <span class="badge badge-primary badge-pill">${count.parent}</span>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
              META
              <span class="badge badge-primary badge-pill">${count.meta}</span>
            </li>
          </ul>
        </div>
      </div>

      ${result.list.length > 0 ? `
        <div class="row">
        <div class="col table-responsive">
          <h2>LIST</h2>
          <table class="table table-sm">
            <thead>
              <tr>
                <th scope="col">TYPE</th>
                <th scope="col">CODE</th>
                <th scope="col">INNER_HITS</th>
              </tr>
            </thead>
            <tbody>
              ${result.list.map(card => `
              <tr>
                <td>${card.typeId}</td>
                <td>${card.code}</td>
                <td>${card.innerHits.join(',')}</td>
              </tr>
              `)}
            </tbody>
          </table>
        </div>
      </div>` : ``}
    </div>
    `
  return html
}

export const FAVORITES_LIST = (payload: Payload, count: FavoritesListCount) => {
  const html = `
    <div class="container">
      <h1 class="display-4">FAVORITES LIST</h1>
      <h3 class="display-8">PAYLOAD</h1>
      <p class="lead mb-0">CODE: ${payload.code}</p>
      <p class="lead mb-0">META_CODE: ${payload.meta_code}</p>
      <p class="lead">TYPE: ${payload.type}</p>

      <div class="row pb-4">
        <div class="col">
          <h2>COUNT</h2>
          <ul class="list-group">
            <li class="list-group-item d-flex justify-content-between align-items-center">
              TOTAL
              <span class="badge badge-primary badge-pill">${count.parent + count.meta}</span>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
              PARENT
              <span class="badge badge-primary badge-pill">${count.parent}</span>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
              META
              <span class="badge badge-primary badge-pill">${count.meta}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    `
  return html
}
