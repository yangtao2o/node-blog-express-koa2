### 下载安装

* [Mysql](https://dev.mysql.com/downloads/mysql/)
* [Mysql Workbench](https://dev.mysql.com/downloads/workbench/)

### 数据库操作

* pk（Y） - 主键
* nn - 不为空
* AI - 自动增加
* datatype（int、varchar、longtext、bigint(20)） - 数据类型
* Default - 默认值

Workbench的使用操作：

```bash
use myblog;  

show tables; 

# 插入
insert into users(username,`password`,realname) values ('zhangsan','123','张三');

# 查询
-- select * from users;  # -- 表示这一行语句被注释
select id,username from users;
select * from users where username='zhangsan' and `password`=123
select * from users where username='zhangsan' or `password`=123
select * from users where username like '%zhang%';
select * from users where `password` like '%1%' order by id desc;

# 更新
SET SQL_SAFE_UPDATES = 0;  # 取消安全模式
update users set realname='李四2' where username='lisi';

# 删除
delete from users where username='lisi';

# 软删除，可恢复(<>不等于)
select * from users where state='1'; 
select * from users where state<>'0';
update users set state='0' where username='李四'; 
update users set state='1' where username='李四';
```

Nodejs 操作 MySQL