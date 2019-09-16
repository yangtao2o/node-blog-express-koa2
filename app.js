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

  // 解析 cookie
  req.cookie = {}
  const cookieStr = req.headers.cookie || ''  // "k1=v1; k2=v2; k3=v3"
  cookieStr.split(';').forEach(item => {
    if(!item) {
      return
    }
    const str = item.split('=')
    const key = str[0].trim()
    const val = str[1].trim()

    req.cookie[key] = val
  })
  console.log(req.cookie)

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

}

module.exports = serverHandle