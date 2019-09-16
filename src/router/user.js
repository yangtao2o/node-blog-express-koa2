const { login } = require('../controller/user')
const { SuccessModel, ErrorModel } = require('../model/resModel')

// 获取 cookie 过期时间
const getCookieExpires = () => {
  const d = new Date()
  d.setTime(d.getTime() + (24 * 60 * 60 * 1000))
  return d.toGMTString()
}

const handleUserRouter = (req, res) => {
  const method = req.method
  // 登录 POST
  if(method === 'POST' && req.path === '/api/user/login') {
    const { username, password } = req.body
    const result = login(username, password)
    return result.then(data => {
      if(data.username) {
        return new SuccessModel()
      }
      return new ErrorModel('登录失败')
    })
  }

  // 登录 GET 测试
  if(method === 'GET' && req.path === '/api/user/login') {
    const { username, password } = req.query
    const result = login(username, password)
    return result.then(data => {
      if(data.username) {
        // 操作 cookie
        res.setHeader('Set-Cookie', `username=${data.username}; path='/'; httpOnly; expire=${getCookieExpires()}`)  // httpOnly 仅 server端修改
        return new SuccessModel()
      }
      return new ErrorModel('登录失败')
    })
  }

  // 登录 cookie 测试
  if(method === 'GET' && req.path === '/api/user/logintest') {
    if(req.cookie.username) {
      return Promise.resolve(
        new SuccessModel({
          username: req.cookie.username
        })
      )
    }
    return Promise.resolve(
      new ErrorModel('登录失败')
    )
  }
}
module.exports = handleUserRouter