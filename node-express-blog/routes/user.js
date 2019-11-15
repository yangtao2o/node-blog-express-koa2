const express = require('express');
const {
  login
} = require('../controller/user')
const {
  SuccessModel,
  ErrorModel
} = require('../model/resModel')
const {
  set
} = require('./../db/redis')

const router = express.Router()

router.post('/login', (req, res, next) => {
  const {
    username,
    password
  } = req.body

  login(username, password).then(data => {
    if (data.username) {
      req.session.username = data.username
      req.session.realname = data.realname
      res.json(new SuccessModel())
      return
    }
    res.json(new ErrorModel('登录失败'))
  })
})

router.get('/login-test', (req, res, next) => {
  if(req.session.username) {
    res.json({
      errno: 0,
      msg: '已登录'
    })
  } else {
    res.json({
      errno: -1,
      msg: '未登录'
    })
  }
})

router.get('/session-test', (req, res, next) => {
  const session = req.session
  if(session.viewNum == null) {
    session.viewNum = 0
  }
  session.viewNum++
  if(session) {
    res.json({
      viewNum: session.viewNum
    })
  }
})

module.exports = router