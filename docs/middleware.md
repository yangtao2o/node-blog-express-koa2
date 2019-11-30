# 中间件原理

Koa 和 Express 的设计风格非常类似，底层也都是共用的同一套 HTTP 基础库，但是有几个显著的区别，除了上面提到的默认异步解决方案之外，主要的特点还有下面几个。

## Middleware

Koa 的中间件和 Express 不同，Koa 选择了洋葱圈模型。

![中间件洋葱图](https://ae01.alicdn.com/kf/H6d60d151712d4e1e8dfc887f5839c7ecz.png)

所有的请求经过一个中间件的时候都会执行两次，对比 Express 形式的中间件，Koa 的模型可以非常方便的实现后置处理逻辑，对比 Koa 和 Express 的 Compress 中间件就可以明显的感受到 Koa 中间件模型的优势。

## Context

和 Express 只有 Request 和 Response 两个对象不同，Koa 增加了一个 Context 的对象，作为这次请求的上下文对象（在 Koa 1 中为中间件的 this，在 Koa 2 中作为中间件的第一个参数传入）。

我们可以将一次请求相关的上下文都挂载到这个对象上。类似 traceId 这种需要贯穿整个请求（在后续任何一个地方进行其他调用都需要用到）的属性就可以挂载上去。相较于 request 和 response 而言更加符合语义。

同时 Context 上也挂载了 Request 和 Response 两个对象。和 Express 类似，这两个对象都提供了大量的便捷方法辅助开发，例如

- get request.query
- get request.hostname
- set response.body
- set response.status

## 异常处理

通过同步方式编写异步代码带来的另外一个非常大的好处就是异常处理非常自然，使用 `try catch` 就可以将按照规范编写的代码中的所有错误都捕获到。这样我们可以很便捷的编写一个自定义的错误处理中间件。

```js
async function onerror(ctx, next) {
  try {
    await next();
  } catch (err) {
    ctx.app.emit("error", err);
    ctx.body = "server error";
    ctx.status = err.status || 500;
  }
}
```

只需要将这个中间件放在其他中间件之前，就可以捕获它们所有的同步或者异步代码中抛出的异常了。

注：以上所有皆来自[Egg.js 与 Koa](https://eggjs.org/zh-cn/intro/egg-and-koa.html)

## 中间件模拟

### Express

```js
const http = require("http");
const slice = Array.prototype.slice;

class LikeExpress {
  constructor() {
    // 存放中间件的列表
    this.routes = {
      all: [], // app.use(...)
      get: [], // app.get(...)
      post: [] // app.post(...)
    };
  }

  register(path) {
    const info = {};
    if (typeof path === "string") {
      info.path = path;
      // 从第二个参数开始，转换为数组，存入 stack
      info.stack = slice.call(arguments, 1);
    } else {
      info.path = "/";
      // 从第一个参数开始，转换为数组，存入 stack
      info.stack = slice.call(arguments, 0);
    }
    return info;
  }

  use() {
    const info = this.register.apply(this, arguments);
    this.routes.all.push(info);
  }

  get() {
    const info = this.register.apply(this, arguments);
    this.routes.get.push(info);
  }

  post() {
    const info = this.register.apply(this, arguments);
    this.routes.post.push(info);
  }

  match(method, url) {
    let stack = [];
    if (url === "/favicon.ico") {
      return stack;
    }

    // 获取 routes
    let curRoutes = [];
    curRoutes = curRoutes.concat(this.routes.all);
    curRoutes = curRoutes.concat(this.routes[method]);

    curRoutes.forEach(routeInfo => {
      if (url.indexOf(routeInfo.path) === 0) {
        // url === '/api/get-cookie' 且 routeInfo.path === '/'
        // url === '/api/get-cookie' 且 routeInfo.path === '/api'
        // url === '/api/get-cookie' 且 routeInfo.path === '/api/get-cookie'
        stack = stack.concat(routeInfo.stack);
      }
    });
    return stack;
  }

  // 核心的 next 机制
  handle(req, res, stack) {
    const next = () => {
      // 拿到第一个匹配的中间件
      const middleware = stack.shift();
      if (middleware) {
        // 执行中间件函数
        middleware(req, res, next);
      }
    };
    next();
  }

  callback() {
    return (req, res) => {
      res.json = data => {
        res.setHeader("Content-type", "application/json");
        res.end(JSON.stringify(data));
      };
      const url = req.url;
      const method = req.method.toLowerCase();

      const resultList = this.match(method, url);
      this.handle(req, res, resultList);
    };
  }

  listen(...args) {
    const server = http.createServer(this.callback());
    server.listen(...args);
  }
}

// 工厂函数
module.exports = () => {
  return new LikeExpress();
};
```

### Koa

```js
const http = require("http");

// 组合中间件
function compose(middlewareList) {
  return function(ctx) {
    function dispatch(i) {
      const fn = middlewareList[i];
      try {
        return Promise.resolve(
          fn(ctx, dispatch.bind(null, i + 1)) // promise
        );
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return dispatch(0);
  };
}

class LikeKoa2 {
  constructor() {
    this.middlewareList = [];
  }

  use(fn) {
    this.middlewareList.push(fn);
    return this;
  }

  createContext(req, res) {
    const ctx = {
      req,
      res
    };
    ctx.query = req.query;
    return ctx;
  }

  handleRequest(ctx, fn) {
    return fn(ctx);
  }

  callback() {
    const fn = compose(this.middlewareList);

    return (req, res) => {
      const ctx = this.createContext(req, res);
      return this.handleRequest(ctx, fn);
    };
  }

  listen(...args) {
    const server = http.createServer(this.callback());
    server.listen(...args);
  }
}

module.exports = LikeKoa2;
```
