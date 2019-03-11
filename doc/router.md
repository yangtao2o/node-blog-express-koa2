## Router

使用 [postman](https://www.getpostman.com/) 工具，进行接口测试

### 路由初始化

根据启动项目的访问顺序：

* 根目录`bin/www.js`文件为启动项，定义如何创建 http 服务器

```js
const http = require('http')
const serverHandle = require('../app')

const PORT = 8000

const server = http.createServer(serverHandle)

server.listen(PORT)
```

* 接着根据`serverHandle`进入`app.js`，一些基本信息的配置，如定义header，解析query，处理路由等，并无业务逻辑内容

```js
const querystring = require('querystring')
const handleBlogRouter = require('./src/router/blog')
const handleUserRouter = require('./src/router/user')

const serverHandle = (req, res) => {
  // 设置返回格式为JSON
  res.setHeader('Content-type', 'application/json')

  // 获取 path
  req.path = req.url.split('?')[0]

  // 解析 query
  req.query = querystring.parse(req.path)

  // 登录路由
  const userData = handleUserRouter(req, res)
  if(userData) {
    res.end(
      JSON.stringify(userData)
    )
    return
  }

  // 处理博客路由
  const blogData = handleBlogRouter(req, res)
  if(blogData) {
    res.end(
      JSON.stringify(blogData)
    )
    return
  }

  // 未命中路由
  res.writeHead(404, {'Content-type': 'text/plain'})
  res.write('404 Not Found!\n')
  res.end()
}

module.exports = serverHandle
```

* 紧接着，进入路由层`./src/router/`，做业务逻辑判断，只负责与路由相关的数据，并作出相应反馈，不负责数据是如何获取、检索、判断等业务

router目录下 `blog.js`:

```js
const { getList } = require('../controller/blog')
const { SuccessModel, ErrorModel } = require('../model/resModel')

const handleBlogRouter = (req, res) => {
  const method = req.method  // GET POST

  // 获取博客列表
  if(method === 'GET' && req.path === '/api/blog/list') {
    const author = req.query.author || ''
    const keyword = req.query.keyword || ''
    const listData = getList(author, keyword)
    console.log(new SuccessModel(listData))
    return new SuccessModel(listData)
  }
  // ...
 
}

module.exports = handleBlogRouter
```

router目录下 `user.js`:

```js
const handleUserRouter = (req, res) => {
  const method = req.method
 
  if(method === 'POST' && req.path === '/api/blog/login') {
    return {
      msg: '登录接口'
    }
  }
}
module.exports = handleUserRouter
```

* 而数据层就是`./src/controller`目录下的文件，只关心数据，其他的统统不管

```js
// blog.js
const getList = (author, keyword) => {

  // 假如传入成功
  return [
    {
      id: 1,
      title: '标题A',
      content: '内容A',
      createTime: 1552099988419,
      author: 'yangtao'
    },
    {
      id: 2,
      title: '标题B',
      content: '内容B',
      createTime: 1552099988420,
      author: 'hhhha'
    },
  ]
}

module.exports =  { 
  getList,
}
```

总结：www.js -> app.js -> router -> controller

### 各个路由的创建

app.js: 主要创建 `getPostData()`

```js
const querystring = require('querystring')
const handleBlogRouter = require('./src/router/blog')
const handleUserRouter = require('./src/router/user')

// 处理 post data
const getPostData = (req) => {
  const promise = new Promise((resolve, reject) => {
    if(req.method !== 'POST') {
      resolve({})
      return
    }
    if(req.headers['content-type'] !== 'application/json') {
      resolve({})
      return
    }

    let postData = ''
    req.on('data', chunk => {
      postData += chunk.toString()
    })
    req.on('end', () => {
      if(!postData) {
        resolve({})
        return
      }
      resolve(
        JSON.parse(postData)
      )
    })
  })
  return promise
}

const serverHandle = (req, res) => {
  // 设置返回格式为JSON
  res.setHeader('Content-type', 'application/json')

  // 获取 path
  req.path = req.url.split('?')[0]

  // 解析 query
  req.query = querystring.parse(req.url.split('?')[1])

  // post data
  getPostData(req).then(postData => {
    req.body = postData
    console.log('reqbody:', postData)
    // 登录路由
    const userData = handleUserRouter(req, res)
    if(userData) {
      res.end(
        JSON.stringify(userData)
      )
      return
    }

    // 处理博客路由
    const blogData = handleBlogRouter(req, res)
    if(blogData) {
      res.end(
        JSON.stringify(blogData)
      )
      return
    }

    // 未命中路由
    res.writeHead(404, {'Content-type': 'text/plain'})
    res.write('404 Not Found!\n')
    res.end()

  })

}

module.exports = serverHandle
```

路由：blog.js

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
    const listData = getList(author, keyword)
    return new SuccessModel(listData)
  }

  // 获取博客详情
  if(method === 'GET' && req.path === '/api/blog/detail') {
    const data = getDetail(id)
    return new SuccessModel(data)
  }

  // 新建一篇博客
  if(method === 'POST' && req.path === '/api/blog/new') {
    const blogData = newBlog(req.body)
    return new SuccessModel(blogData)
  
  }

  // 更新一篇博客
  if(method === 'POST' && req.path === '/api/blog/update') {
    const result = updateBlog(id, req.body)
    if(result) {
      return new SuccessModel()
    } 
    return new ErrorModel('更新失败')
  }

  // 删除一篇博客
  if(method === 'POST' && req.path === '/api/blog/delete') {
    const result = delBlog(id)
    if(result) {
      return new SuccessModel()
    } 
    return new ErrorModel('删除失败')
  }
}

module.exports = handleBlogRouter
```

路由：user.js

```js
const { loginCheck } = require('../controller/user')
const { SuccessModel, ErrorModel } = require('../model/resModel')

const handleUserRouter = (req, res) => {
  const method = req.method
 
  if(method === 'POST' && req.path === '/api/blog/login') {
    const { username, password } = req.body
    const result = loginCheck(username, password)
    console.log('user: ', username, password)
    if(result) {
      return new SuccessModel()
    }
    return new ErrorModel('登录失败')
  }
}
module.exports = handleUserRouter
```

controller: blog.js

```js
const getList = (author, keyword) => {

  // 假如传入成功
  return [
    {
      id: 1,
      title: '标题A',
      content: '内容A',
      createTime: 1552099988419,
      author: 'yangtao'
    },
    {
      id: 2,
      title: '标题B',
      content: '内容B',
      createTime: 1552099988420,
      author: 'hhhha'
    },
  ]
}

const getDetail = (id) => {

  return [
    {
      id: 1,
      title: '标题A',
      content: '内容A',
      createTime: 1552099988419,
      author: 'yangtao'
    }
  ]
}

const newBlog = (blogData = {}) => {
  
  return {
    id: 3
  }
}

const updateBlog = (id, blogData = {}) => {
  return true
}

const delBlog = (id) => {
  return true
}

module.exports =  { 
  getList,
  getDetail,
  newBlog,
  updateBlog,
  delBlog
}
```

controller: user.js

```js
const loginCheck = (username, password) => {
  if(username === 'yangtao' && password === '123456') {
    return true
  }
  return false
}

module.exports = { loginCheck }
```

最后，补充下相应信息的model： `./src/model/resModel.js`

```js
class BaseModel {
  constructor(data, message) {
    if(typeof data === 'string') {
      this.message = data
      data = null
      message = null
    }
    if(data) {
      this.data = data
    }
    if(message) {
      this.message = message
    }
  }
}

class SuccessModel extends BaseModel {
  constructor(data, message) {
    super(data, message)
    this.errno = 0
  }
}

class ErrorModel extends BaseModel {
  constructor(data, message) {
    super(data, message)
    this.errno = -1
  }
}
module.exports = {
  SuccessModel,
  ErrorModel
}
```
