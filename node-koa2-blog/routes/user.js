const router = require('koa-router')()
const {
  login
} = require('../controller/user')
const {
  SuccessModel,
  ErrorModel
} = require('../model/resModel')

router.prefix('/api/user')

router.post('/login', async (ctx, next) => {
  const {
    username,
    password
  } = ctx.request.body

  const data = await login(username, password)

  if (data.username) {
    ctx.session.username = data.username
    ctx.session.realname = data.realname
    ctx.body = new SuccessModel()
    return
  }

  ctx.body = new ErrorModel('登录失败')
})

router.get('/login-test', (ctx, next) => {
  console.log({
    ctx
  })
  if (ctx.session.username) {
    ctx.body = {
      errno: 0,
      msg: '已登录'
    }
  } else {
    ctx.body = {
      errno: -1,
      msg: '未登录'
    }
  }
})

router.get('/session-test', (ctx, next) => {
  const session = ctx.session
  if (session.viewNum == null) {
    session.viewNum = 0
  }
  session.viewNum++
  if (session) {
    ctx.body = {
      viewNum: session.viewNum
    }
  }
})

module.exports = router