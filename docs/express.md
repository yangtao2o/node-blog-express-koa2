# Express

## 初始化

文档：[Express安装](http://www.expressjs.com.cn/starter/installing.html)

### app.js

```javascript
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// 加载路由控制
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// 创建实例
var app = express();

// 创建 ejs 模板引擎即模板文件位置
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// 定义日志和输出级别
app.use(logger('dev'));  
// JSON 解析中间件
app.use(express.json());
// application/x-www-form-urlencode请求解析中间件
app.use(express.urlencoded({ extended: false }));
// 定义cookie解析器
app.use(cookieParser());
// HTTP 伪造中间件
app.use(express.methodOverride())
// 定义静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

// 匹配路径和路由
app.use('/', indexRouter);

// 404 错误处理
app.use(function(req, res, next) {
  next(createError(404));
});

// 500 错误处理及错误堆栈跟踪
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
```

### router

### 中间件