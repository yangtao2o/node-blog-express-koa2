## nginx

- 高性能的 web 服务器，开源免费
- 一般用于做静态服务、负载均衡
- 反向代理

### nginx 下载

Windows：[http://nginx.org/en/download.html](http://nginx.org/en/download.html)

Mac: brew install nginx

### nginx 配置

Windows: C:\nginx\conf\nginx.conf

Mac: /usr/local/etc/nginx/nginx.conf

### nginx 命令

```bash
# 测试配置文件格式是否正确
nginx -t
nginx: the configuration file /usr/local/etc/nginx/nginx.conf syntax is ok
nginx: configuration file /usr/local/etc/nginx/nginx.conf test is successful

# 启动
nginx

# 重启
nginx -s reload

# 停止
nginx -s stop
```

修改 nginx.conf:

```bash
cd /usr/local/etc/nginx

open nginx.conf
# 或者 nano nginx.conf
# 或者 vi nginx.conf
```

vim 的基本三种模式：命令模式、插入模式、底行模式

- 进入 vim：`vim test.c` （刚进入是命令模式，不可输入文字）
- 命令模式 --> 插入模式

```bash
1.输入a   （进入后，是从目前光标所在位置的下一位置开始输入文字）
2.输入i    （进入后，是从光标当前所在位置开始输入文字）
3.输入o   （进入后，是插入新的一行，从行首开始输入文字）
```

- 命令模式 --> 底行模式：输入 `：`
- 不管当前是插入模式，还是底行模式，都要按 Esc 退入到命令模式才能进入其它模式
- 退出 vim 切换到底行模式 输入 q 退出

```bash
1.输入：w（保存当前文件）
2.输入：wq（保存并退出）
3.输入：q!（强制退出）
```

### nginx.conf 修改

首先，启动我们的接口服务：

```bash
cd node-blog
npm run dev

# http://localhost:8000
```

接着，启动我们的前端资源服务：

```bash
cd html-test
http-server -p 8001
# Available on:
#   http://127.0.0.1:8001
```

这样，我们要访问的是 `localhost:8080`，首页下的内容我们需要代理到 `http://localhost:8000`，而接口处于另一个端口：`http://localhost:8001`，所以：

打开 `nginx.conf` 文件，设置：

```conf
#user  nobody;
worker_processes  2;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    #tcp_nopush     on;

    #keepalive_timeout  0;
    keepalive_timeout  65;

    #gzip  on;

    server {
        listen       8080;
        server_name  localhost;

        #charset koi8-r;

        #access_log  logs/host.access.log  main;

        # location / {
        #     root   html;
        #     index  index.html index.htm;
        # }

        location / {
            proxy_pass http://localhost:8001;
        }

        location /api/ {
            proxy_pass http://localhost:8000;
            proxy_set_header Host $host;
        }

    }

    include servers/*;
}
```

主要修改：

```conf
location / {
    proxy_pass http://localhost:8001;
}

location /api/ {
    proxy_pass http://localhost:8000;
    proxy_set_header Host $host;
}
```

然后访问：`http://localhost:8080`，确保redis、mysql 已开启
