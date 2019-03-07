const handleBlogRouter = require('./src/router/blog')
const handleUserRouter = require('./src/router/user')

const serverHandle = (req, res) => {
  req.path = req.url.split('?')[0]
  // 设置返回格式为JSON
  res.setHeader('Content-type', 'application/json')

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