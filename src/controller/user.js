const loginCheck = (username, password) => {
  if(username === 'yangtao' && password === '123456') {
    return true
  }
  return false
}

module.exports = { loginCheck }