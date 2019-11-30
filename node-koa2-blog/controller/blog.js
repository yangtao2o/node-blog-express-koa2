const {
  exec,
  escape
} = require('./../db/mysql')
const xss = require('xss')

const getList = async (author, keyword) => {
  let sql = `select * from blogs where 1=1 `
  if (author) {
    sql += `and author=${escape(author)} `
  }
  if (keyword) {
    sql += `and title like '%${keyword}%' `
  }
  sql += `order by createtime desc;`

  return await exec(sql)
}

const getDetail = async (id) => {
  const sql = `select * from blogs where id='${id}'`
  const rows = await exec(sql)
  return rows[0]

}

const newBlog = async (blogData = {}) => {
  // blogData 是一个博客对象，包含 title content 属性
  const title = xss(blogData.title)
  const content = xss(blogData.content)
  const author = blogData.author
  const createtime = Date.now()

  const sql = `
    insert into blogs (title, content, author, createtime)
    values (${escape(title)}, ${escape(content)}, '${author}', ${createtime});
  `

  const insertData = await exec(sql)
  return {
    id: insertData.insertId
  }
}

const updateBlog = async (id, blogData = {}) => {
  const title = xss(blogData.title)
  const content = xss(blogData.content)

  const sql = `
    update blogs set title=${escape(title)}, content=${escape(content)} where id='${id}'
  `

  const updateData = await exec(sql)
  if (updateData.affectedRows > 0) {
    return true
  } else {
    return false
  }
}

const delBlog = async (id, author) => {
  const sql = `
    delete from blogs where id='${id}' and author='${author}';
  `

  const delData = await exec(sql)
  if (delData.affectedRows > 0) {
    return true
  } else {
    return false
  }
}

module.exports = {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  delBlog
}