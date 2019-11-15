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

const router = express.Router();
const loginCheck = (req) => {
  if (!req.session.username) {
    return Promise.resolve(
      new ErrorModel('未登录')
    )
  }
}

// 获取博客列表
router.get('/list', (req, res, next) => {
  let author = req.query.author || ''
  const keyword = req.query.keyword || ''

  // 管理员后台
  // if (req.query.isadmin) {
  //   const loginCheckResult = loginCheck(req)
  //   if (loginCheckResult) {
  //     return loginCheckResult
  //   }
  //   // 强制使用自己的用户名
  //   author = req.session.username
  // }

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
router.get('/new', (req, res, next) => {
  const loginCheckResult = loginCheck(req)
  if (loginCheckResult) {
    return loginCheckResult
  }
  req.body.author = req.session.username
  newBlog(req.body).then(data => {
    res.json(new SuccessModel(data))
  })
})

// 更新一篇博客
router.get('/update', (req, res, next) => {
  const loginCheckResult = loginCheck(req)
  if (loginCheckResult) {
    return loginCheckResult
  }
  updateBlog(req.query.id, req.body).then(data => {
    if (data) {
      res.json(new SuccessModel(data))
    } else {
      res.json(new ErrorModel('更新失败'))
    }
  })
})

// 删除一篇博客
router.get('/del', (req, res, next) => {
  const loginCheckResult = loginCheck(req)
  if (loginCheckResult) {
    return loginCheckResult
  }
  author = req.session.username
  delBlog(id, author).then(data => {
    if (data) {
      res.json(new SuccessModel(data))
    } else {
      res.json(new ErrorModel('更新失败'))
    }
  })
})

module.exports = router