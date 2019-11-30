# 日志

## 步骤

### access

首先使用nodejs标准的文件系统module fs：

```js
const fs = require('fs')
```

然后创建写入文件流：[fs.createWriteStream(path[, options])](http://nodejs.cn/api/fs.html#fs_fs_createwritestream_path_options)

```js
function createWriteStream(filename) {
  const fullFilename = path.join(__dirname, '../', '../', 'logs', filename)
  return fs.createWriteStream(fullFilename, {
    flags: 'a'  // 持续追加内容
  })
}
```

其中，当 flag 选项采用字符串时，可用以下[标志](http://nodejs.cn/api/fs.html#fs_file_system_flags)：

'a' - 打开文件用于追加。如果文件不存在，则创建该文件。

最后，写日志：

```js
const accessWriteStream = createWriteStream('access.log')
function access(log) {
  writeLog(accessWriteStream, log)
}
function writeLog(writeStream, log) {
  writeStream.write(log + '\n')
}
```

完整内容（`src/utils/log.js`）：

```js
const fs = require('fs')
const path = require('path')

// 写日志
function writeLog(writeStream, log) {
  writeStream.write(log + '\n')
}

// fs.createWriteStream(path[, options])
function createWriteStream(filename) {
  const fullFilename = path.join(__dirname, '../', '../', 'logs', filename)
  return fs.createWriteStream(fullFilename, {
    flags: 'a'  // 持续追加内容
  })
}

const accessWriteStream = createWriteStream('access.log')
function access(log) {
  writeLog(accessWriteStream, log)
}

module.exports = {
  access
}
```

在 app.js 中使用：

```js
const { access } = require('./src/utils/log')
const serverHandle = (req, res) => {
  // access logs
  access(`${new Date().toGMTString()} -- ${req.method} -- ${req.url} -- ${req.headers['user-agent']}`)

  // ...
}
```

多次请求，打开 logs 下面的 access.log 文件：

```log
Sun, 10 Nov 2019 14:50:42 GMT -- GET -- /api/blog/detail?id=10 -- Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36
Sun, 10 Nov 2019 14:50:46 GMT -- GET -- /api/blog/list -- Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36
Sun, 10 Nov 2019 14:50:52 GMT -- GET -- /api/blog/list?isadmin=1 -- Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:69.0) Gecko/20100101 Firefox/69.0

```

### 日志拆分

```sh
#!/bin/sh
# cd /Users/yangtao/Documents/code/node-blog-express-koa2/node-blog/logs
# cp access.log $(date +%Y-%m-%d).access.log
# echo "" > access.log

```

### 日志分析 - readline

* [Nodejs进阶：readline实现日志分析+简易命令行工具](https://segmentfault.com/a/1190000009198417)

比如我们来分析下 chrome 浏览器的占比

创建 readline 对象：

```js
const rl = readline.createInterface({
  input: readStream
})
```

逐行读取：

```js
rl.on('line', data => {...})
```

读取结束：

```js
rl.on('close', () => {...})
```

完整内容 readline.js：

```js
const fs = require('fs')
const path = require('path')
const readline = require('readline')

function createReadStream(filename) {
  const fullFilename = path.join(__dirname, '../', '../', 'logs', filename)
  return fs.createReadStream(fullFilename)
}

const readStream = createReadStream('access.log')
let chromeNum = 0
let sum = 0

// 创建 readline 对象
const rl = readline.createInterface({
  input: readStream
})

// 逐行读取
rl.on('line', data => {
  if(!data) return
  sum++

  const arr = data.split('--')
  if(arr[arr.length - 1] && arr[arr.length - 1].indexOf('Chrome') > 0) {
    chromeNum++
  }
})

// 读取完毕
rl.on('close', () => {
  console.log('chrome 占比：' + chromeNum / sum)
})
```

然后 `node readline.js`，输出：`chrome 占比：0.6666666666666666`
