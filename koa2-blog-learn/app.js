const Koa = require('koa')
const Router = require('@koa/router')
const bodyParser = require('koa-bodyparser')
const serve = require('koa-static')
const views = require('koa-views')
let ejs = require('ejs')

const app = new Koa()
const router = new Router()

const render = views(__dirname + '/static', {
  extension: 'ejs'
})

// Must be used before any router is used
app.use(render)

router.get('/list', async (ctx, next) => {
  return ctx.render('list', {
    title: '列表页'
  })
})

router.get('/', async (ctx, next) => {
  ctx.body = `
    <form action="/login" method="post">
    <p>
      <label for="username">Username: </label>
      <input type="text" id="username" name="username" required>
    </p>
    <p>
      <label for="username">Passwrod: </label>
      <input type="password" id="password" name="password" required>
    </p>
    <input type="submit" value="submit">
  </form>
  `
})

router.post('/login', async (ctx, next) => {
  let { username, password } = ctx.request.body
  if (username === 'yangtao' && password === '123456') {
    ctx.body = 'Success!'
  } else {
    ctx.body = 'Login error!'
  }
})

router.get('/article/:category/:articleId', async (ctx, next) => {
  const { category, articleId } = ctx.params
  ctx.body = `文章分类是：${category}，ID：${articleId}`
})

// body 解析
app.use(bodyParser())
// 路由
app.use(router.routes()).use(router.allowedMethods())

// 静态文件服务
app.use(serve('.', { extensions: ['html'] })) // 根目录设置，extensions 可省略文件后缀访问
app.use(serve(__dirname + '/static', { extensions: ['html'] })) // static 目录下
app.use(serve(__dirname + '/static/assets')) // static 目录下

app.listen(3000)
