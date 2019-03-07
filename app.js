const express = require('express')
const superagent = require('superagent')
const cheerio = require('cheerio')

const app = express()
const PORT = process.env.PORT || 8000
const URL = 'https://cnodejs.org'
/**
 * 当在浏览器中访问 http://localhost:8000/ 时，输出 CNode(https://cnodejs.org/ ) 社区首页的所有帖子标题和链接，以 json 的形式。
 */
app.get('/', (req, res, next) => {
  // 使用 superagent 获取 url
  superagent.get(URL, (err, sres) => {
    if(err) {
      return next(err)
    }
    const $ = cheerio.load(sres.text)
    const items = []
    const $target = $('#topic_list .topic_title')
    let itemsHtml = ''  

    $target.each((i, item) => {
      let $this = $(item)
      items.push({
        title: $this.attr('title'),
        url: URL + $this.attr('href')
      })
    })

    console.log('items--->', items)  // 以 JSON 格式打印

    if(items) {
      $(items).each((i, item) => {
        itemsHtml += `<li><a href="${item.url}" title="${item.title}">${item.title}</a></li>`
      })
        itemsHtml = `<ol id="listItem">${itemsHtml}</ol>`
    } else {
      itemsHtml = `<p>暂时还获取不到数据...</p>`
    }

    res.send(itemsHtml)
  })
  
})

app.listen(PORT, (req, res) => {
  console.log('App is listening at port ' + PORT)
})