const handleBlogRouter = (req, res) => {
  const method = req.method  // GET POST

  // 获取博客列表
  if(method === 'GET' && req.path === '/api/blog/list') {
    return {
      msg: '列表接口'
    }
  }

  // 获取博客详情
  if(method === 'GET' && req.path === '/api/blog/detail') {
    return {
      msg: '详情接口'
    }
  }

  // 新建一篇博客
  if(method === 'POST' && req.path === '/api/blog/new') {
    return {
      msg: '新建接口'
    }
  }

  // 更新一篇博客
  if(method === 'POST' && req.path === '/api/blog/update') {
    return {
      msg: '更新接口'
    }
  }

  // 删除一篇博客
  if(method === 'POST' && req.path === '/api/blog/delete') {
    return {
      msg: '删除接口'
    }
  }
}

module.exports = handleBlogRouter