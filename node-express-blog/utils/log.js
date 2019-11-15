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
