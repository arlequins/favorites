module.exports = (server) => {
  const v1 = `/v1`

  // S: v1
  require(`.${v1}/favorites`)(server, v1)
  // E: v1
}
