## 安全

### SQL 注入

> SQL注入（SQLi）是一种注入攻击，，可以执行恶意SQL语句。它通过将任意SQL代码插入数据库查询，使攻击者能够完全控制Web应用程序后面的数据库服务器。

犯罪分子可能会利用它来未经授权访问用户的敏感数据：客户信息，个人数据，商业机密，知识产权等。SQL注入攻击是最古老，最流行，最危险的Web应用程序漏洞之一。

*如何防止SQL注入攻击？*

* 不要使用动态SQL

避免将用户提供的输入直接放入SQL语句中；最好使用准备好的语句和参数化查询，这样更安全。

* 不要将敏感数据保留在纯文本中

加密存储在数据库中的私有/机密数据；这样可以提供了另一级保护，以防攻击者成功地排出敏感数据。

* 限制数据库权限和特权

将数据库用户的功能设置为最低要求；这将限制攻击者在设法获取访问权限时可以执行的操作。

* 避免直接向用户显示数据库错误

攻击者可以使用这些错误消息来获取有关数据库的信息。

* 对访问数据库的Web应用程序使用Web应用程序防火墙（WAF）

这为面向Web的应用程序提供了保护，它可以帮助识别SQL注入尝试；根据设置，它还可以帮助防止SQL注入尝试到达应用程序（以及数据库）。

* 定期测试与数据库交互的Web应用程序

这样做可以帮助捕获可能允许SQL注入的新错误或回归。

* 将数据库更新为最新的可用修补程序

原文：[什么是SQL注入？如何防止SQL注入攻击？](https://www.php.cn/mysql-tutorials-416424.html)

比如node博客里使用 mysql.escape()来防止注入：

```js
const sql = `
  select username, realname from users where username=${mysql.escape(username)} and password=${mysql.escape(password)};
`
```

### XSS

> XSS（Cross Site Script，跨站脚本攻击）是向网页中注入恶意脚本（CSS代码、JavaScript代码等），用户浏览网页时在用户浏览器中执行恶意脚本的一种攻击方式。如盗取用户cookie，破坏页面结构、重定向到其他网站等。

防范XSS（永远不要相信用户的输入，必须对输入的数据作过滤处理）主要有两方面：

* 消毒 - 对危险字符进行转义
* HttpOnly -防范XSS攻击者窃取Cookie数据

比如node博客里：新建文章的时候，标题里输入`<script>alert('我是一段js代码')</script>`，然后点击提交，就会直接弹出来。

node 使用 xss：

```js
const title = xss(blogData.title)

// title
// &lt;script&gt;alert('我是一段js代码')&lt;/script&gt;
```

### CSRF攻击

> CSRF攻击（Cross Site Request Forgery，跨站请求伪造）是攻击者通过跨站请求，以合法的用户身份进行非法操作（如转账或发帖等）。

这里先说一下，http是无状态的。服务器端和浏览器端的身份判断一般是通过cookie。 后端会根据请求者传递的cookie信息判断请求者的身份。 攻击者的请求只要是带上了目标用户的cookie，就可以合法请求。

* 跨站：请求来源很可能来自其他网站，也有可能来自本站
* 伪造：请求并非用户的意愿。
* 实现：利用跨域标签img iframe等在b网站发送往a网站get请求，会带上a网站的cookie，由此可见对于数据修改的请求最好不要用get。如果你在a站登录了，又访问了恶意网站b，而b上面有一个恶意img标签的get请求，那你的数据可能就被删除了。 而跨域的ajax请求因为同源策略，不会带上cookie，但是也能请求到结果，后端会处理这个请求，不过因为没有携带cookie信息，后端拿 不到登录状态，很多操作不会成功。跨域请求的结果也会发到客户端，不过由于同源策略的限制，浏览器读取不到这个响应结果。

伪造form表单提交。那么，post请求就安全了吗？form表单是跨域的。并且可以提交post请求。我们在b网站伪造一个form表单自动提交到a网站。

* 预防：最好的办法是带token，任何请求都带上token，这样伪站可以发请求，但是无法拿到token，后端收到的就不带token就可以判定非法了。

原文：[常见的web攻击方式及预防](https://blog.csdn.net/liusaint1992/article/details/80865350)

### 参考资料
* [sql攻击](https://cloud.tencent.com/developer/information/sql%E6%94%BB%E5%87%BB)
* [SQL注入和XSS攻击](https://cloud.tencent.com/developer/article/1455178)
* [什么是SQL注入？如何防止SQL注入攻击？](https://www.php.cn/mysql-tutorials-416424.html)
* [什么是XSS攻击？什么是SQL注入攻击？什么是CSRF攻击？](https://cloud.tencent.com/developer/article/1198977)
* [如何预防SQL注入和XSS攻击](https://blog.csdn.net/qq_41033290/article/details/91381962) - 代码讲解更直观