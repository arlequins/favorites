const defineEnum = require('./')

module.exports.ORDER = defineEnum({
  ASC: {
    value : 0,
    string : 'ASC'
  },
  DESC : {
    value : 1,
    string : 'DESC'
  },
})
