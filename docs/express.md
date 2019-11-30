# Express

## 初始化

文档：[Express 安装](http://www.expressjs.com.cn/starter/installing.html)

### 入口文件分析

```javascript
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// 加载路由控制
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

// 创建实例
var app = express();

// 创建 ejs 模板引擎即模板文件位置
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
// 定义日志和输出级别
app.use(logger("dev"));
// JSON 解析中间件
app.use(express.json());
// application/x-www-form-urlencode请求解析中间件
app.use(express.urlencoded({ extended: false }));
// 定义cookie解析器
app.use(cookieParser());
// HTTP 伪造中间件
app.use(express.methodOverride());
// 定义静态文件目录
app.use(express.static(path.join(__dirname, "public")));

// 匹配路径和路由
app.use("/", indexRouter);

// 404 错误处理
app.use(function(req, res, next) {
  next(createError(404));
});

// 500 错误处理及错误堆栈跟踪
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
```

app.js 具体内容:

```js
const createError = require("http-errors");
const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const redis = require("redis");
let RedisStore = require("connect-redis")(session);
let client = redis.createClient();

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const userRouter = require("./routes/user");
const blogRouter = require("./routes/blog");

const ENV = process.env.NODE_ENV;

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// setup the session
app.use(
  session({
    secret: "Xam_is195#*^0",
    resave: false,
    saveUninitialized: true,
    store: new RedisStore({
      client
    }),
    cookie: {
      // path: '/',  // 默认
      // httpOnly: true,  // 默认
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

app.use(express.json());

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "./logs", "access.log"),
  {
    flags: "a"
  }
);

// setup the logger
if (ENV === "dev" || ENV === "test") {
  app.use(logger("dev"));
} else {
  app.use(
    logger("combined", {
      stream: accessLogStream
    })
  );
}

app.use(
  express.urlencoded({
    extended: false
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
// app.use('/users', usersRouter);
app.use("/api/user", userRouter);
app.use("/api/blog", blogRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "dev" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
```

### 路由

user.js:

```js
const express = require("express");
const { login } = require("../controller/user");
const { SuccessModel, ErrorModel } = require("../model/resModel");

const router = express.Router();

router.post("/login", (req, res, next) => {
  const { username, password } = req.body;

  login(username, password).then(data => {
    if (data.username) {
      req.session.username = data.username;
      req.session.realname = data.realname;
      res.json(new SuccessModel());
      return;
    }
    res.json(new ErrorModel("登录失败"));
  });
});

router.get("/login-test", (req, res, next) => {
  if (req.session.username) {
    res.json({
      errno: 0,
      msg: "已登录"
    });
  } else {
    res.json({
      errno: -1,
      msg: "未登录"
    });
  }
});

router.get("/session-test", (req, res, next) => {
  const session = req.session;
  if (session.viewNum == null) {
    session.viewNum = 0;
  }
  session.viewNum++;
  if (session) {
    res.json({
      viewNum: session.viewNum
    });
  }
});

module.exports = router;
```

blog.js:

```js
const express = require("express");
const {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  delBlog
} = require("../controller/blog");
const { SuccessModel, ErrorModel } = require("../model/resModel");
const loginCheck = require("../middleware/loginCheck");

const router = express.Router();

// 获取博客列表
router.get("/list", (req, res, next) => {
  let author = req.query.author || "";
  const keyword = req.query.keyword || "";
  const username = req.session.username;
  // 管理员后台
  if (req.query.isadmin) {
    if (username == null) {
      return res.json(new ErrorModel("未登录"));
    }
    // 强制使用自己的用户名
    author = username;
  }

  getList(author, keyword).then(data => {
    res.json(new SuccessModel(data));
  });
});

// 获取博客详情
router.get("/detail", (req, res, next) => {
  getDetail(req.query.id).then(data => {
    res.json(new SuccessModel(data));
  });
});

// 新建一篇博客
router.post("/new", loginCheck, (req, res, next) => {
  req.body.author = req.session.username;
  newBlog(req.body).then(data => {
    res.json(new SuccessModel(data));
  });
});

// 更新一篇博客
router.post("/update", loginCheck, (req, res, next) => {
  updateBlog(req.query.id, req.body).then(data => {
    if (data) {
      res.json(new SuccessModel(data));
    } else {
      res.json(new ErrorModel("更新失败"));
    }
  });
});

// 删除一篇博客
router.post("/del", loginCheck, (req, res, next) => {
  const id = req.query.id;
  const author = req.session.username;
  delBlog(id, author).then(data => {
    if (data) {
      res.json(new SuccessModel(data));
    } else {
      res.json(new ErrorModel("更新失败"));
    }
  });
});

module.exports = router;
```

### Controller

user.js:

```js
const { exec, escape } = require("../db/mysql");
const { genPassword } = require("../utils/crypto.js");

const login = async (username, password) => {
  // password = genPassword(password)
  const sql = `
    select username, realname from users where username=${escape(
      username
    )} and password=${escape(password)};
  `;

  const rows = await exec(sql);
  return rows[0] || {};
};

module.exports = {
  login
};
```

blog.js:

```js
const { exec, escape } = require("./../db/mysql");
const xss = require("xss");

const getList = (author, keyword) => {
  let sql = `select * from blogs where 1=1 `;
  if (author) {
    sql += `and author=${escape(author)} `;
  }
  if (keyword) {
    sql += `and title like '%${keyword}%' `;
  }
  sql += `order by createtime desc;`;

  return exec(sql);
};

const getDetail = id => {
  const sql = `select * from blogs where id='${id}'`;
  return exec(sql).then(rows => {
    return rows[0];
  });
};

const newBlog = (blogData = {}) => {
  // blogData 是一个博客对象，包含 title content 属性
  const title = xss(blogData.title);
  const content = xss(blogData.content);
  const author = blogData.author;
  const createtime = Date.now();

  const sql = `
    insert into blogs (title, content, author, createtime)
    values (${escape(title)}, ${escape(content)}, '${author}', ${createtime});
  `;
  return exec(sql).then(insertData => {
    return {
      id: insertData.insertId
    };
  });
};

const updateBlog = (id, blogData = {}) => {
  const title = xss(blogData.title);
  const content = xss(blogData.content);

  const sql = `
    update blogs set title=${escape(title)}, content=${escape(
    content
  )} where id='${id}'
  `;

  return exec(sql).then(updateData => {
    if (updateData.affectedRows > 0) {
      return true;
    } else {
      return false;
    }
  });
};

const delBlog = (id, author) => {
  const sql = `
    delete from blogs where id='${id}' and author='${author}';
  `;
  return exec(sql).then(delData => {
    if (delData.affectedRows > 0) {
      return true;
    } else {
      return false;
    }
  });
};

module.exports = {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  delBlog
};
```

