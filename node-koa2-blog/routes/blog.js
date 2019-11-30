const router = require('koa-router')()

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

router.prefix('/api/blog')

// 获取博客列表
router.get('/list', async (ctx, next) => {
  const query = ctx.query
  let author = query.author || ''
  const keyword = query.keyword || ''

  // 管理员后台
  if (query.isadmin) {
    if (ctx.session.username == null) {
      ctx.body = new ErrorModel('未登录')
      return
    }
    // 强制使用自己的用户名
    author = ctx.session.username
  }

  const listData = await getList(author, keyword)
  ctx.body = new SuccessModel(listData)
})

// 获取博客详情
router.get('/detail', async (ctx, next) => {
  const data = await getDetail(ctx.query.id)
  ctx.body = new SuccessModel(data)
})

// 新建一篇博客
router.post('/new', loginCheck, async (ctx, next) => {
  const body = ctx.request.body
  body.author = ctx.session.username

  console.log({ctx})

  const data = await newBlog(body)
  ctx.body = new SuccessModel(data)
})

// 更新一篇博客
router.post('/update', loginCheck, async (ctx, next) => {
  const data = await updateBlog(ctx.query.id, ctx.request.body)
  if (data) {
    ctx.body = new SuccessModel(data)
  } else {
    ctx.body = new ErrorModel('更新失败')
  }
})

// 删除一篇博客
router.post('/del', loginCheck, async (ctx, next) => {
  const id = ctx.query.id
  const author = ctx.session.username
  const data = await delBlog(id, author)
  if (data) {
    ctx.body = new SuccessModel(data)
  } else {
    ctx.body = new ErrorModel('更新失败')
  }
})

module.exports = router