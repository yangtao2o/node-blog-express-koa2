const {
  exec,
  escape
} = require('../db/mysql')
const { genPassword } = require('../utils/crypto.js')

const login = (username, password) => {
  // password = genPassword(password)
  const sql = `
    select username, realname from users where username=${escape(username)} and password=${escape(password)};
  `
  return exec(sql).then(rows => {
    return rows[0] || {}
  })
}

module.exports = {
  login
}