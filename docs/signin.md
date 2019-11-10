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
  `username=${data.username}; path=/; httpOnly; expires=${getCookieExpires()}`
);
```

### session

cookie 的问题：会暴露 username，所以我们使用 cookie 存储 userid，server 端对应 username，即 server 端存储用户信息。

在 app.js 下：

```js
const SESSION_DATA = {};
const serverHandle = (req, res) => {
  // ...
  // 解析 session
  let needSetCookie = false;
  let userId = req.cookie.userid;
  if (userId) {
    if (!SESSION_DATA[userId]) {
      SESSION_DATA[userId] = {};
    }
  } else {
    needSetCookie = true;
    userId = `${Date.now()}_${Math.random()}`;
    SESSION_DATA[userId] = {};
  }
  req.session = SESSION_DATA[userId];

  // ...

  // 在需要设置cookie的地方设置，
  // 注意设置格式，我为了找这个格式错误，差点崩溃...
  if (needSetCookie) {
    res.setHeader(
      "Set-Cookie",
      `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`
    );
  }

  // ...
};
```

app.js 具体内容为：

```js
const querystring = require("querystring");
const handleBlogRouter = require("./src/router/blog");
const handleUserRouter = require("./src/router/user");

const SESSION_DATA = {};

// 获取 cookie 过期时间
const getCookieExpires = () => {
  const d = new Date();
  d.setTime(d.getTime() + 24 * 60 * 60 * 1000);
  return d.toGMTString();
};

// 处理 post data
const getPostData = req => {
  const promise = new Promise((resolve, reject) => {
    if (req.method !== "POST") {
      resolve({});
      return;
    }
    if (req.headers["content-type"] !== "application/json") {
      resolve({});
      return;
    }

    let postData = "";
    req.on("data", chunk => {
      postData += chunk.toString();
    });
    req.on("end", () => {
      if (!postData) {
        resolve({});
        return;
      }
      resolve(JSON.parse(postData));
    });
  });
  return promise;
};

const serverHandle = (req, res) => {
  // 设置返回格式为JSON
  res.setHeader("Content-type", "application/json");

  // 获取 path
  req.path = req.url.split("?")[0];

  // 解析 query
  req.query = querystring.parse(req.url.split("?")[1]);

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

  // 解析 session
  let needSetCookie = false;
  let userId = req.cookie.userid;
  if (userId) {
    if (!SESSION_DATA[userId]) {
      SESSION_DATA[userId] = {};
    }
  } else {
    needSetCookie = true;
    userId = `${Date.now()}_${Math.random()}`;
    SESSION_DATA[userId] = {};
  }
  req.session = SESSION_DATA[userId];

  // post data
  getPostData(req).then(postData => {
    req.body = postData;

    // 登录路由
    const userResult = handleUserRouter(req, res);
    if (userResult) {
      userResult.then(userData => {
        // 操作 cookie
        if (needSetCookie) {
          res.setHeader(
            "Set-Cookie",
            `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`
          );
        }
        res.end(JSON.stringify(userData));
      });
      return;
    }

    // 处理博客路由
    const blogResult = handleBlogRouter(req, res);
    if (blogResult) {
      blogResult.then(blogData => {
        // 操作 cookie
        if (needSetCookie) {
          res.setHeader(
            "Set-Cookie",
            `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`
          );
        }
        res.end(JSON.stringify(blogData));
      });
      return;
    }

    // 未命中路由
    res.writeHead(404, { "Content-type": "text/plain" });
    res.write("404 Not Found!\n");
    res.end();
  });
};

module.exports = serverHandle;
```

然后在 user.js 添加:

```js
// 获取username并赋值
if (data.username) {
  req.session.username = data.username;
  return new SuccessModel();
}
// 然后返回
if (req.session.username) {
  return Promise.resolve(
    new SuccessModel({
      session: req.session
    })
  );
}
```

user.js 全部内容为：

```js
const { login } = require("../controller/user");
const { SuccessModel, ErrorModel } = require("../model/resModel");

const handleUserRouter = (req, res) => {
  const method = req.method;

  // 登录 GET 测试
  if (method === "GET" && req.path === "/api/user/login") {
    const { username, password } = req.query;
    const result = login(username, password);
    return result.then(data => {
      if (data.username) {
        req.session.username = data.username;
        return new SuccessModel();
      }
      return new ErrorModel("登录失败");
    });
  }

  // 登录 cookie 测试
  if (method === "GET" && req.path === "/api/user/logintest") {
    if (req.session.username) {
      return Promise.resolve(
        new SuccessModel({
          session: req.session
        })
      );
    }
    return Promise.resolve(new ErrorModel("登录失败"));
  }
};
module.exports = handleUserRouter;
```

### redis

session 的问题：session 是一个变量存在 nodejs 进程内存中

- 进程内存有限，访问量过大，内存容易暴增
- 线上多为多进程，进程间内存无法共享

安装 redis:

```bash
brew install redis
redis-server
redis-cli

~ ❯❯❯ redis-server
...
20160:M 08 Nov 2019 15:15:59.421 * Ready to accept connections

~ ❯❯❯ redis-cli
127.0.0.1:6379> set myname yangtao
OK
127.0.0.1:6379> get myname
"yangtao"
```

测试：

```js
const redis = require("redis");

// 创建客户端
const redisClient = redis.createClient(6379, "127.0.0.1");

redisClient.on("error", err => {
  console.log(err);
});

// 测试
redisClient.set("myname", "yangtao", redis.print);

redisClient.get("myname", (err, val) => {
  if (err) return;
  console.log(val);
  redisClient.quit();
});
```

然后在 db 目录下新建 redis.js :

```js
const redis = require("redis");
const { REDIS_CONF } = require("./../conf/db.js");

// REDIS_CONF = {
//   host: '127.0.0.1',
//   port: '6379'
// }

const redisClient = redis.createClient(REDIS_CONF.port, REDIS_CONF.host);

redisClient.on("error", err => {
  console.log(err);
});

function set(key, value) {
  if (typeof value === "object") {
    value = JSON.stringify(value);
  }
  redisClient.set(key, value, redis.print);
}

function get(key) {
  return new Promise((resolve, reject) => {
    redisClient.get(key, (err, value) => {
      if (err) {
        reject(err);
        return;
      }
      if (value == null) {
        resolve(null);
        return;
      }
      try {
        // 对应 if(typeof value === 'object') {...}
        resolve(JSON.parse(value));
      } catch (ex) {
        resolve(value);
      }
    });
  });
}

module.exports = {
  set,
  get
};
```

接着更改 app.js 中的相关解析：

```js
const { set, get } = require("./src/db/redis");

// 解析 session(redis)

let needSetCookie = false;
// 获取 cookie
let userId = req.cookie.userid;
// 判断 cookie 中是否存在 userid
if (!userId) {
  // 需要设置 cookie，方便 res.setHeader('Set-Cookie', ...)
  needSetCookie = true;
  // 初始化 redis 中 key
  userId = `${Date.now()}_${Math.random()}`;
  // 初始化 value， 即 redis 中的 session 值
  set(userId, {});
}
req.sessionId = userId;
// 获取 redis 中 sessionId 的 session 值
get(req.sessionId).then(sessionData => {
  if (sessionData == null) {
    // 初始化 redis 中的 session 值
    set(req.sessionId, {});
    // 初始化 session 值
    req.session = {};
  } else {
    // 设置 session 值
    req.session = sessionData;
  }
});
```

由上可最终返回 req.sessionId, req.session，对应 redis 里的 key 与 value。

最后，在 router 下的 user.js 中同步 redis 的值：

```js
// update redis
set(req.sessionId, req.session);
```

然后测试：

```bash
127.0.0.1:6379> keys *
1) "myname"
2) "1573187225426_0.4692044468197074"
127.0.0.1:6379> get 1573187225426_0.4692044468197074
"{\"username\":\"yangtao\"}"
```

Success!

### 登录验证

```js
const loginCheck = req => {
  if (!req.session.username) {
    return Promise.resolve(new ErrorModel("未登录"));
  }
};
// 新建一篇博客
if (method === "POST" && req.path === "/api/blog/new") {
  const loginCheckResult = loginCheck(req);
  // 未登录
  if (loginCheckResult) {
    return loginCheckResult;
  }
  req.body.author = req.session.username;
  const result = newBlog(req.body);
  return result.then(data => {
    return new SuccessModel(data);
  });
}
```
