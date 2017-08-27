sqlite命令行操作时命令：
.table 查看所有表名字
.schema [tbname] 查看表结构(主要看列信息)。
.exit 退出

其他执行sql语句即可，注意结尾分号，不要输入特殊符合，若输入会进入...命令模式，要输完对称的以及';'才可退出


### SQL约束：
NOT NULL 约束：确保某列不能有 NULL 值。
DEFAULT 约束：当某列没有指定值时，为该列提供默认值。
UNIQUE 约束：确保某列中的所有值是不同的。
PRIMARY Key 约束：唯一标识数据库表中的各行/记录。
CHECK 约束：CHECK 约束确保某列中的所有值满足一定条件。

``` sql
CREATE TABLE COMPANY(
   ID INT PRIMARY KEY     NOT NULL,
   NAME           TEXT    NOT NULL,
   AGE            INT     NOT NULL UNIQUE,
   ADDRESS        CHAR(50),
   SALARY         REAL    DEFAULT 50000.00 CHECK(SALARY > 0)
);
```

### LIKE语句
百分号 "%" 代表零个、一个或多个数字或字符。下划线 "_" 代表一个单一的数字或字符。这些符号可以被组合使用。

1. `WHERE SALARY LIKE '_2%3'`  查找第二位为 2，且以 3 结尾的任意值
2. `select * from system where name like '%robot%';`  查询表中name中含有robot的记录
3. `SELECT * FROM COMPANY WHERE AGE  LIKE '2%';` 显示 COMPANY 表中 AGE 以 2 开头的所有记录

### Glob 子句
与 LIKE 运算符不同的是，GLOB 是大小写敏感的

1. `SELECT * FROM COMPANY WHERE AGE  GLOB '2*';`   COMPANY 表中 AGE 以 2 开头的所有记录：
2. `SELECT * FROM COMPANY WHERE ADDRESS  GLOB '*-*';` 显示 COMPANY 表中 ADDRESS 文本里包含一个连字符（-）的所有记录：


SQL语句解析：
1. `select  *  from  <table_name>;` 查询表中所有字段的记录。
2. `select * from system order by _id desc limit 5;` 从system表中取出根据 _id 倒序排序的5个数据
    order by 代表以什么排序， desc代表逆序， limit代表个数
3. `SELECT * FROM COMPANY LIMIT 3 OFFSET 2;`  从第三位（即偏移两个）开始提取 3 个记录

---
#### <font color="#004B97">作者:Anderson大码渣，欢迎关注我的简书:  </font><a target="_blank" href="http://www.jianshu.com/u/016a5ba708a0"><font color="#f57e42"> Anderson大码渣 </strong></font>
</a>
---
