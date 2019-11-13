## 安全

### SQL 注入

> SQL 注入（SQLi）是一种注入攻击，，可以执行恶意 SQL 语句。它通过将任意 SQL 代码插入数据库查询，使攻击者能够完全控制 Web 应用程序后面的数据库服务器。

犯罪分子可能会利用它来未经授权访问用户的敏感数据：客户信息，个人数据，商业机密，知识产权等。SQL 注入攻击是最古老，最流行，最危险的 Web 应用程序漏洞之一。

_如何防止 SQL 注入攻击？_

- 不要使用动态 SQL
  避免将用户提供的输入直接放入 SQL 语句中；最好使用准备好的语句和参数化查询，这样更安全。

- 不要将敏感数据保留在纯文本中
  加密存储在数据库中的私有/机密数据；这样可以提供了另一级保护，以防攻击者成功地排出敏感数据。

- 限制数据库权限和特权
  将数据库用户的功能设置为最低要求；这将限制攻击者在设法获取访问权限时可以执行的操作。

- 避免直接向用户显示数据库错误
  攻击者可以使用这些错误消息来获取有关数据库的信息。

- 对访问数据库的 Web 应用程序使用 Web 应用程序防火墙（WAF）
  这为面向 Web 的应用程序提供了保护，它可以帮助识别 SQL 注入尝试；根据设置，它还可以帮助防止 SQL 注入尝试到达应用程序（以及数据库）。

- 定期测试与数据库交互的 Web 应用程序
  这样做可以帮助捕获可能允许 SQL 注入的新错误或回归。

- 将数据库更新为最新的可用修补程序

原文：[什么是 SQL 注入？如何防止 SQL 注入攻击？](https://www.php.cn/mysql-tutorials-416424.html)

比如 node 博客里使用 mysql.escape()来防止注入：

```js
const sql = `
  select username, realname from users where username=${mysql.escape(
    username
  )} and password=${mysql.escape(password)};
`;
```

### XSS

> XSS（Cross Site Script，跨站脚本攻击）是向网页中注入恶意脚本（CSS 代码、JavaScript 代码等），用户浏览网页时在用户浏览器中执行恶意脚本的一种攻击方式。如盗取用户 cookie，破坏页面结构、重定向到其他网站等。

防范 XSS（永远不要相信用户的输入，必须对输入的数据作过滤处理）主要有两方面：

- 消毒：对危险字符进行转义
- HttpOnly：防范 XSS 攻击者窃取 Cookie 数据

比如 node 博客里：新建文章的时候，标题里输入`<script>alert('我是一段js代码')</script>`，然后点击提交，就会直接弹出来。

node 使用 xss：

```js
const title = xss(blogData.title);

// title
// &lt;script&gt;alert('我是一段js代码')&lt;/script&gt;
```

### CSRF 攻击

> CSRF 攻击（Cross Site Request Forgery，跨站请求伪造）是攻击者通过跨站请求，以合法的用户身份进行非法操作（如转账或发帖等）。

这里先说一下，http 是无状态的。服务器端和浏览器端的身份判断一般是通过 cookie。 后端会根据请求者传递的 cookie 信息判断请求者的身份。 攻击者的请求只要是带上了目标用户的 cookie，就可以合法请求。

- 跨站：
  请求来源很可能来自其他网站，也有可能来自本站

- 伪造：
  请求并非用户的意愿

- 实现：
  利用跨域标签 img iframe 等在 b 网站发送往 a 网站 get 请求，会带上 a 网站的 cookie，由此可见对于数据修改的请求最好不要用 get。

  如果你在 a 站登录了，又访问了恶意网站 b，而 b 上面有一个恶意 img 标签的 get 请求，那你的数据可能就被删除了。 而跨域的 ajax 请求因为同源策略，不会带上 cookie，但是也能请求到结果，后端会处理这个请求，不过因为没有携带 cookie 信息，后端拿 不到登录状态，很多操作不会成功。跨域请求的结果也会发到客户端，不过由于同源策略的限制，浏览器读取不到这个响应结果。

  伪造 form 表单提交。那么，post 请求就安全了吗？form 表单是跨域的。并且可以提交 post 请求。我们在 b 网站伪造一个 form 表单自动提交到 a 网站。

- 预防：
  最好的办法是带 token，任何请求都带上 token，这样伪站可以发请求，但是无法拿到 token，后端收到的就不带 token 就可以判定非法了。

原文：[常见的 web 攻击方式及预防](https://blog.csdn.net/liusaint1992/article/details/80865350)

### 密码加密

- 文档：[crypto（加密）](nodejs.cn/api/crypto.html)

crypto 模块提供了加密功能，包括对 OpenSSL 的哈希、HMAC、加密、解密、签名、以及验证功能的一整套封装。

```js
const crypto = require("crypto");

const secret = "abcdefg";
const hash = crypto
  .createHmac("sha256", secret)
  .update("I love cupcakes")
  .digest("hex");
console.log(hash);
// 打印:
//   c0fa1bc00531bd78ef38c628449c5102aeabd49b5dc3a2a516ea6ea959d6658e
```

#### MD5

md5：不是一种加密算法，是用来做文件校验的

作用：让大容量信息在数字签名软件签署私人秘钥前被"压缩"成一种保密格式，也就是把一个任意长度的字节串变换成一定长度的十六进制数字串（32个字符）

```js
const crypto = require('crypto')

const SECRET_KEY = 'WJiol_8776#'

// md5 加密
function md5(content) {
  return crypto.createHash('md5').update(content).digest('hex')
}

// 加密函数
function genPassword(password) {
  return md5(`password=${password}&key=${SECRET_KEY}`)
}
console.log(genPassword('123456'))
// 4d4994bde299f6168c65f24c852897b7
```

#### HMAC

进一步提升MD5加密安全性：是一个"秘钥"，对明文进行加密，并做"两次散列"，但使用它得到的还是32个字符

利用哈希算法，以一个秘钥和一个信息为输入，生成一个消息摘要作为输出

```js
const crypto = require('crypto')

const SECRET_KEY = 'WJiol_8776#'

// Hmac 加密
function hmac(content) {
  return crypto.createHmac('md5', SECRET_KEY).update(content).digest('hex')
}

console.log('hamc: ', hmac('123456'))
// 7d37b577bcd2a492820846e475b933f9
```

### 参考资料

- [sql 攻击](https://cloud.tencent.com/developer/information/sql%E6%94%BB%E5%87%BB)
- [SQL 注入和 XSS 攻击](https://cloud.tencent.com/developer/article/1455178)
- [什么是 SQL 注入？如何防止 SQL 注入攻击？](https://www.php.cn/mysql-tutorials-416424.html)
- [什么是 XSS 攻击？什么是 SQL 注入攻击？什么是 CSRF 攻击？](https://cloud.tencent.com/developer/article/1198977)
- [如何预防 SQL 注入和 XSS 攻击](https://blog.csdn.net/qq_41033290/article/details/91381962) - 代码讲解更直观
- [前端加密 JS 库--CryptoJS 使用指南 ](http://www.sosout.com/2018/09/05/cryptojs-tutorial.html)
- [nodeJS：MD5加密](https://www.jianshu.com/p/92195252c2e0)
