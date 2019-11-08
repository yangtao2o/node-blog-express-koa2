## 登录

### cookie

#### 什么是 cookie

- 存储在浏览器的一段字符串（5kb）
- 跨域不共享
- 可以存储结构化数据，格式为：`"k1=v1; k2=v2; k3=v3"`
- 每次发送 http 请求，都将请求域的 cookie 一起发给 server
- server 可以修改 cookie，并返给浏览器
- 浏览器可以使用 JavaScript 修改 cookie（有限制）

#### server 端 nodejs 操作 cookie

app.js 文件里增加 cookie 的解析，然后在浏览器里设置：`document.cookie="age=18"`信息进行测试

```js
// 解析 cookie
req.cookie = {};
const cookieStr = req.headers.cookie || ""; // "k1=v1; k2=v2; k3=v3"
cookieStr.split(";").forEach(item => {
  if (!item) {
    return;
  }
  const str = item.split("=");
  const key = str[0].trim();
  const val = str[1].trim();

  req.cookie[key] = val;
});

console.log(req.cookie); // { name: 'yangr', age: '18' }
```

然后 router 下的 user.js 添加测试路由，配合 query 及 cookie 设置，即可看到是否登录成功状态：

```js
// 登录 cookie 测试
if (method === "GET" && req.path === "/api/user/logintest") {
  if (req.cookie.username) {
    return Promise.resolve(new SuccessModel());
  }
  return Promise.resolve(new ErrorModel("登录失败"));
}

// 登录 GET 测试
if (method === "GET" && req.path === "/api/user/login") {
  const { username, password } = req.query;
  const result = login(username, password);
  return result.then(data => {
    if (data.username) {
      return new SuccessModel();
    }
    return new ErrorModel("登录失败");
  });
}
```

server 端设置 cookie：`Set-Cookie`

```js
if (method === "GET" && req.path === "/api/user/login") {
  const { username, password } = req.query;
  const result = login(username, password);
  return result.then(data => {
    if (data.username) {
      // 操作 cookie
      res.setHeader(
        "Set-Cookie",
        `username=${data.username}; path='/'; httpOnly`
      ); // httpOnly 仅 server端修改
      return new SuccessModel();
    }
    return new ErrorModel("登录失败");
  });
}
```

设置时间 expire：

```js
// 获取 cookie 过期时间
const getCookieExpires = () => {
  const d = new Date();
  d.setTime(d.getTime() + 24 * 60 * 60 * 1000);
  return d.toGMTString();
};

// 设置
res.setHeader(
  "Set-Cookie",
  `username=${data.username}; path='/'; httpOnly; expire=${getCookieExpires()}`
);
```

### session

cookie 的问题：会暴露 username，所以我们使用cookie存储userid，server端对应username，即server端存储用户信息。

在 app.js 下：

```js
const SESSION_DATA = {}
const serverHandle = (req, res) => {
  // ...
  // 解析 session
  let needSetCookie = false
  let userId = req.cookie.userid
  if(userId) {
    if(!SESSION_DATA[userId]) {
      SESSION_DATA[userId] = {}
    }
  } else {
    needSetCookie = true
    userId = `${Date.now()}_${Math.random()}`
    SESSION_DATA[userId] = {}
  }
  req.session = SESSION_DATA[userId]

  // ... 

  // 在需要设置cookie的地方设置
  if(needSetCookie) {
    res.setHeader('Set-Cookie', `userid=${userId}; path='/'; httpOnly; expire=${getCookieExpires()}`) 
  }

  // ...
}
```

然后在 user.js 添加:

```js
// 获取username并赋值
if(data.username) {
  req.session.username = data.username
  return new SuccessModel()
}
// 然后返回
if(req.session.username) {
  return Promise.resolve(
    new SuccessModel({
      session: req.session
    })
  )
}
```