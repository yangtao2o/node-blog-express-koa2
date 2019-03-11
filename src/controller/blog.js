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