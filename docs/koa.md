# Koa

> Koa 是一个新的 web 框架，由 Express 幕后的原班人马打造， 致力于成为 web 应用和 API 开发领域中的一个更小、更富有表现力、更健壮的基石。

## 初始化

app.js:

```js
const Koa = require("koa");
const app = new Koa();
const views = require("koa-views");
const json = require("koa-json");
const onerror = require("koa-onerror");
const bodyparser = require("koa-bodyparser");
const logger = require("koa-logger");
const fs = require("fs");
const path = require("path");
const session = require("koa-generic-session");
const redisStore = require("koa-redis");
const morgan = require("koa-morgan");

const index = require("./routes/index");
const users = require("./routes/users");
const user = require("./routes/user");
const blog = require("./routes/blog");

const ENV = app.env;

// error handler
onerror(app);

// middlewares
app.use(
  bodyparser({
    enableTypes: ["json", "form", "text"]
  })
);
app.use(json());

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "./logs", "access.log"),
  {
    flags: "a"
  }
);

// setup the logger
if (ENV === "dev" || ENV === "test") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: accessLogStream
    })
  );
}

app.use(require("koa-static")(__dirname + "/public"));

app.use(
  views(__dirname + "/views", {
    extension: "ejs"
  })
);

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// session
app.keys = ["Xam_is195#*^0"];
app.use(
  session({
    cookie: {
      path: "/",
      httpOnly: true,
      maxAge: "24 * 60 * 60 * 1000"
    },
    store: redisStore()
  })
);

// routes
app.use(index.routes(), index.allowedMethods());
app.use(users.routes(), users.allowedMethods());
app.use(user.routes(), index.allowedMethods());
app.use(blog.routes(), index.allowedMethods());

// error-handling
app.on("error", (err, ctx) => {
  console.error("server error", err, ctx);
});

module.exports = app;
```

## 路由

user.js:

```js
const router = require("koa-router")();
const { login } = require("../controller/user");
const { SuccessModel, ErrorModel } = require("../model/resModel");

router.prefix("/api/user");

router.post("/login", async (ctx, next) => {
  const { username, password } = ctx.request.body;

  const data = await login(username, password);

  if (data.username) {
    ctx.session.username = data.username;
    ctx.session.realname = data.realname;
    ctx.body = new SuccessModel();
    return;
  }

  ctx.body = new ErrorModel("登录失败");
});

module.exports = router;
```

blog.js:

```js
const router = require("koa-router")();

const {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  delBlog
} = require("../controller/blog");
const { SuccessModel, ErrorModel } = require("../model/resModel");
const loginCheck = require("../middleware/loginCheck");

router.prefix("/api/blog");

// 获取博客列表
router.get("/list", async (ctx, next) => {
  const query = ctx.query;
  let author = query.author || "";
  const keyword = query.keyword || "";

  // 管理员后台
  if (query.isadmin) {
    if (ctx.session.username == null) {
      ctx.body = new ErrorModel("未登录");
      return;
    }
    // 强制使用自己的用户名
    author = ctx.session.username;
  }

  const listData = await getList(author, keyword);
  ctx.body = new SuccessModel(listData);
});

// 获取博客详情
router.get("/detail", async (ctx, next) => {
  const data = await getDetail(ctx.query.id);
  ctx.body = new SuccessModel(data);
});

// 新建一篇博客
router.post("/new", loginCheck, async (ctx, next) => {
  const body = ctx.request.body;
  body.author = ctx.session.username;

  console.log({ ctx });

  const data = await newBlog(body);
  ctx.body = new SuccessModel(data);
});

// 更新一篇博客
router.post("/update", loginCheck, async (ctx, next) => {
  const data = await updateBlog(ctx.query.id, ctx.request.body);
  if (data) {
    ctx.body = new SuccessModel(data);
  } else {
    ctx.body = new ErrorModel("更新失败");
  }
});

// 删除一篇博客
router.post("/del", loginCheck, async (ctx, next) => {
  const id = ctx.query.id;
  const author = ctx.session.username;
  const data = await delBlog(id, author);
  if (data) {
    ctx.body = new SuccessModel(data);
  } else {
    ctx.body = new ErrorModel("更新失败");
  }
});

module.exports = router;
```

## Controller

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

const getList = async (author, keyword) => {
  let sql = `select * from blogs where 1=1 `;
  if (author) {
    sql += `and author=${escape(author)} `;
  }
  if (keyword) {
    sql += `and title like '%${keyword}%' `;
  }
  sql += `order by createtime desc;`;

  return await exec(sql);
};

const getDetail = async id => {
  const sql = `select * from blogs where id='${id}'`;
  const rows = await exec(sql);
  return rows[0];
};

const newBlog = async (blogData = {}) => {
  // blogData 是一个博客对象，包含 title content 属性
  const title = xss(blogData.title);
  const content = xss(blogData.content);
  const author = blogData.author;
  const createtime = Date.now();

  const sql = `
    insert into blogs (title, content, author, createtime)
    values (${escape(title)}, ${escape(content)}, '${author}', ${createtime});
  `;

  const insertData = await exec(sql);
  return {
    id: insertData.insertId
  };
};

const updateBlog = async (id, blogData = {}) => {
  const title = xss(blogData.title);
  const content = xss(blogData.content);

  const sql = `
    update blogs set title=${escape(title)}, content=${escape(
    content
  )} where id='${id}'
  `;

  const updateData = await exec(sql);
  if (updateData.affectedRows > 0) {
    return true;
  } else {
    return false;
  }
};

const delBlog = async (id, author) => {
  const sql = `
    delete from blogs where id='${id}' and author='${author}';
  `;

  const delData = await exec(sql);
  if (delData.affectedRows > 0) {
    return true;
  } else {
    return false;
  }
};

module.exports = {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  delBlog
};
```

## 中间件

loginCheck.js:

```js
// express
const {
  ErrorModel
} = require('../model/resModel')

module.exports = (req, res, next) => {
  if (!req.session.username) {
    return res.json(new ErrorModel('未登录'))
  }
  next()
}

// koa

const {
  ErrorModel
} = require('../model/resModel')

module.exports = async (ctx, next) => {
  if (ctx.session.username) {
    await next()
    return
  }

  ctx.body = new ErrorModel('未登录')
}
```