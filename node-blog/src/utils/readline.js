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

