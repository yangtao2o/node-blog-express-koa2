# Koa2 使用学习总结

## 起步

### 启动

Koa 版本：`"koa": "^2.13.0"`

```js
const Koa = require('koa')
const app = new Koa()

app.use(async ctx => {
  ctx.body = 'Hello World'
})

app.listen(3000)
```

`ctx.body = 'Hello World'`相当于：

```js
res.statusCode = 200
res.end('Hello World')
```

### 静态文件服务

使用 [koa-static](https://www.npmjs.com/package/koa-static)，版本：`"koa-static": "^5.0.0"`：

```js
const Koa = require('koa')
const serve = require('koa-static')
const app = new Koa()

// 静态文件服务
app.use(serve('.', { extensions: ['html'] })) // 根目录设置，extensions 可省略文件后缀访问
app.use(serve(__dirname + '/static', { extensions: ['html'] })) // static 目录下
app.use(serve(__dirname + '/static/assets')) // static 目录下

app.listen(3000)
```

可设置根目录或者其他目录（如 static），`extensions`可以指定文件的后缀，这样我们访问时就可以省略其后缀。

### 路由服务

- 使用 [koa-bodyparser](https://www.npmjs.com/package/koa-bodyparser))，版本：`"koa-bodyparser": "^4.3.0"`
- 使用 [@koa/router](https://www.npmjs.com/package/@koa/router)，版本：`"@koa/router": "^9.3.1"`

```js
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const Router = require('@koa/router')

const app = new Koa()
const router = new Router()

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
// http://localhost:3000/article/vue/20200712  -->
// 文章分类是：vue，ID：20200712
router.get('/article/:category/:articleId', async (ctx, next) => {
  const { category, articleId } = ctx.params
  ctx.body = `文章分类是：${category}，ID：${articleId}`
})

// body 解析，需要在 router 之前 use
app.use(bodyParser())
app.use(router.routes()).use(router.allowedMethods())

app.listen(3000)
```
