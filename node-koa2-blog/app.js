const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const fs = require('fs')
const path = require('path')
const session = require('koa-generic-session');
const redisStore = require('koa-redis');
const morgan = require('koa-morgan');

const index = require('./routes/index')
const users = require('./routes/users')
const user = require('./routes/user')
const blog = require('./routes/blog')

const ENV = app.env;

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(__dirname, './logs', 'access.log'), {
  flags: 'a'
});

// setup the logger
if (ENV === 'dev' || ENV === 'test') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: accessLogStream
  }));
}

app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'ejs'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// session
app.keys = ['Xam_is195#*^0']
app.use(session({
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: '24 * 60 * 60 * 1000'
  },
  store: redisStore()
}))

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(user.routes(), index.allowedMethods())
app.use(blog.routes(), index.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
