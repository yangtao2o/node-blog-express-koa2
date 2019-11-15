const express = require('express');
const {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  delBlog
} = require('../controller/blog')
const {
  SuccessModel,
  ErrorModel
} = require('../model/resModel')
const loginCheck = require('../middleware/loginCheck')

const router = express.Router();

// 获取博客列表
router.get('/list', (req, res, next) => {
  let author = req.query.author || ''
  const keyword = req.query.keyword || ''
  const username = req.session.username
  // 管理员后台
  if (req.query.isadmin) {
    if(username == null) {
      return res.json(new ErrorModel('未登录'))
    }
    // 强制使用自己的用户名
    author = username
  }

  getList(author, keyword).then(data => {
    res.json(new SuccessModel(data))
  })

});

// 获取博客详情
router.get('/detail', (req, res, next) => {
  getDetail(req.query.id).then(data => {
    res.json(new SuccessModel(data))
  })
})

// 新建一篇博客
router.post('/new', loginCheck, (req, res, next) => {
  req.body.author = req.session.username
  newBlog(req.body).then(data => {
    res.json(new SuccessModel(data))
  })
})

// 更新一篇博客
router.post('/update', loginCheck, (req, res, next) => {
  updateBlog(req.query.id, req.body).then(data => {
    if (data) {
      res.json(new SuccessModel(data))
    } else {
      res.json(new ErrorModel('更新失败'))
    }
  })
})

// 删除一篇博客
router.post('/del', loginCheck, (req, res, next) => {
  const id = req.query.id
  const author = req.session.username
  delBlog(id, author).then(data => {
    if (data) {
      res.json(new SuccessModel(data))
    } else {
      res.json(new ErrorModel('更新失败'))
    }
  })
})

module.exports = router