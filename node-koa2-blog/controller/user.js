const {
  exec,
  escape
} = require('../db/mysql')
const { genPassword } = require('../utils/crypto.js')

const login = async (username, password) => {
  // password = genPassword(password)
  const sql = `
    select username, realname from users where username=${escape(username)} and password=${escape(password)};
  `

  const rows = await exec(sql)
  return rows[0] || {}
}

module.exports = {
  login
}