const express = require('express')  // 引入依赖
const utility = require('utility')
const PORT = 8000
const app = express()  // 实例化

// 访问 http://localhost:8000/?q=alsotang 时，输出 alsotang 的 sha1 值，即 e3c766d71667567e18f77869c65cd62f6a1b9ab9。

app.get('/', (req, res) => {
  const q = req.query.q  // 获取参数 q
  if(q != null) {
    const md5Value = utility.md5(q)  //调用 utility.md5 方法，得到 md5 之后的值
    res.send(md5Value)
  } else {
    res.send('Hello Express!')
  }
})

app.listen(PORT, (req, res) => {
  console.log('App is listening at port ' + PORT)
})