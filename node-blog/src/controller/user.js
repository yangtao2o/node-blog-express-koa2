const {
  exec,
  escape
} = require('../db/mysql')

const login = (username, password) => {
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