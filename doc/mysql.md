### 下载安装

* [Mysql](https://dev.mysql.com/downloads/mysql/)
* [Mysql Workbench](https://dev.mysql.com/downloads/workbench/)

### 数据库操作

* pk（Y） - 主键
* nn - 不为空
* AI - 自动增加
* datatype（int、varchar、longtext、bigint(20)） - 数据类型
* Default - 默认值

Workbench的使用操作：

```bash
use myblog;  

show tables; 

# 插入
insert into users(username,`password`,realname) values ('zhangsan','123','张三');

# 查询
-- select * from users;  # -- 表示这一行语句被注释
select id,username from users;
select * from users where username='zhangsan' and `password`=123
select * from users where username='zhangsan' or `password`=123
select * from users where username like '%zhang%';
select * from users where `password` like '%1%' order by id desc;

# 更新
SET SQL_SAFE_UPDATES = 0;  # 取消安全模式
update users set realname='李四2' where username='lisi';

# 删除
delete from users where username='lisi';

# 软删除，可恢复(<>不等于)
select * from users where state='1'; 
select * from users where state<>'0';
update users set state='0' where username='李四'; 
update users set state='1' where username='李四';
```

### Nodejs 操作 MySQL

#### nodejs 连接 MySQL 做成工具

`/src/conf/db.js`
```js
const env = process.env.NODE_ENV

let MYSQL_CONF

if(env === 'dev') {
  MYSQL_CONF = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    port: '3306',
    database: 'myblog'
  }
}

if(env === 'production') {
  MYSQL_CONF = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    port: '3306',
    database: 'myblog'
  }
}

module.exports = {
  MYSQL_CONF
}
```
`/src/db/mysql.js`
```js
const mysql = require('mysql')
const { MYSQL_CONF } = require('./../conf/db')

// 创建链接对象
const con = mysql.createConnection(MYSQL_CONF)

// 开始连接
con.connect()

// 统一执行 sql 的函数
function exec(sql) {
  const promise = new Promise((resolve, reject) => {
    con.query(sql, (err, result) => {
      if(err) {
        console.log(err)
        return
      }
      resolve(result)
    })
  })
  return promise
}

module.exports = {
  exec
}
```

#### API 对接

##### app.js 文件：
```js
// post data
getPostData(req).then(postData => {
  req.body = postData

  // 登录路由
  const userResult = handleUserRouter(req, res)
  if(userResult) {
    userResult.then(userData => {
      res.end(
        JSON.stringify(userData)
      )
    })
    return
  }

  // 处理博客路由
  const blogResult = handleBlogRouter(req, res)
  if(blogResult) {
    blogResult.then(blogData => {
      res.end(
        JSON.stringify(blogData)
      )
    })
    return
  }

  // 未命中路由
  res.writeHead(404, {'Content-type': 'text/plain'})
  res.write('404 Not Found!\n')
  res.end()

})
```

##### router 文件下的 blog.js 文件：

```js
const { getList, getDetail, newBlog, updateBlog, delBlog } = require('../controller/blog')
const { SuccessModel, ErrorModel } = require('../model/resModel')

const handleBlogRouter = (req, res) => {
  const method = req.method  // GET POST
  const id = req.query.id

  // 获取博客列表
  if(method === 'GET' && req.path === '/api/blog/list') {
    const author = req.query.author || ''
    const keyword = req.query.keyword || ''
    const result = getList(author, keyword)
    return result.then(listData => {
      return new SuccessModel(listData)
    })
  }

  // 获取博客详情
  if(method === 'GET' && req.path === '/api/blog/detail') {
    const result = getDetail(id)
    return result.then(data => {
      return new SuccessModel(data)
    })
  }

  // 新建一篇博客
  if(method === 'POST' && req.path === '/api/blog/new') {
    const author = 'wangwu'
    req.body.author = author  // 创建假数据
    const result = newBlog(req.body)
    return result.then(data => {
      return new SuccessModel(data)
    })
  
  }

  // 更新一篇博客
  if(method === 'POST' && req.path === '/api/blog/update') {
    const result = updateBlog(id, req.body)
    return result.then(val => {
      if(val) {
        return new SuccessModel()
      } else {
        return new ErrorModel('更新失败')
      }
    })
  }

  // 删除一篇博客
  if(method === 'POST' && req.path === '/api/blog/delete') {
    const author = 'wangwu'
    req.body.author = author  // 创建假数据
    const result = delBlog(id, author)
    return result.then(val => {
      if(val) {
        return new SuccessModel()
      } else {
        return new ErrorModel('删除失败')
      }
    })
  }
}

module.exports = handleBlogRouter
```

##### router 文件下的 user.js 文件：

```js
const { loginCheck } = require('../controller/user')
const { SuccessModel, ErrorModel } = require('../model/resModel')

const handleUserRouter = (req, res) => {
  const method = req.method
 
  if(method === 'POST' && req.path === '/api/blog/login') {
    const { username, password } = req.body
    const result = loginCheck(username, password)
    return result.then(data => {
      if(data.username) {
        return new SuccessModel()
      } else {
        return new ErrorModel('登录失败')
      }
    })
  }
}
module.exports = handleUserRouter
```
然后沿着 `require()` 找到 `controller/blog.js`，博客的增删改查：

```js
const { getList, getDetail, newBlog, updateBlog, delBlog } = require('../controller/blog')
const { SuccessModel, ErrorModel } = require('../model/resModel')

const handleBlogRouter = (req, res) => {
  const method = req.method  // GET POST
  const id = req.query.id

  // 获取博客列表
  if(method === 'GET' && req.path === '/api/blog/list') {
    const author = req.query.author || ''
    const keyword = req.query.keyword || ''
    const result = getList(author, keyword)
    return result.then(listData => {
      return new SuccessModel(listData)
    })
  }

  // 获取博客详情
  if(method === 'GET' && req.path === '/api/blog/detail') {
    const result = getDetail(id)
    return result.then(data => {
      return new SuccessModel(data)
    })
  }

  // 新建一篇博客
  if(method === 'POST' && req.path === '/api/blog/new') {
    const author = 'wangwu'
    req.body.author = author  // 创建假数据
    const result = newBlog(req.body)
    return result.then(data => {
      return new SuccessModel(data)
    })
  
  }

  // 更新一篇博客
  if(method === 'POST' && req.path === '/api/blog/update') {
    const result = updateBlog(id, req.body)
    return result.then(val => {
      if(val) {
        return new SuccessModel()
      } else {
        return new ErrorModel('更新失败')
      }
    })
  }

  // 删除一篇博客
  if(method === 'POST' && req.path === '/api/blog/delete') {
    const author = 'wangwu'
    req.body.author = author  // 创建假数据
    const result = delBlog(id, author)
    return result.then(val => {
      if(val) {
        return new SuccessModel()
      } else {
        return new ErrorModel('删除失败')
      }
    })
  }
}

module.exports = handleBlogRouter
```

以及同目录下的 `user.js`：

```js
const { exec } = require('./../db/mysql')

const loginCheck = (username, password) => {
  const sql = `
    select username, realname from users where username='${username}' and password='${password}';
  `

  return exec(sql).then(rows => {
    return rows[0] || {} 
  })
}

module.exports = { loginCheck }
```