const crypto = require('crypto')

const SECRET_KEY = 'WJiol_8776#'

// md5 加密
function md5(content) {
  return crypto.createHash('md5').update(content).digest('hex')
}

// Hmac 加密
function hmac(content) {
  return crypto.createHmac('md5', SECRET_KEY).update(content).digest('hex')
}

// 加密函数
function genPassword(password) {
  return md5(`password=${password}&key=${SECRET_KEY}`)
}

module.exports = {
  genPassword,
  hmac
}