---
title: No SQL, Realm轻量级，现代化数据库入门
tags:
    - Android
    - 数据库
subtitle: "让你的应用迅速带上存储的翅膀"
header-img: "img/post-bg-android.jpg"
preview-img: "/img/preview/realm.png"
grammar_cjkRuby: true
catalog: true
layout:  post
---


### 简介

 Realm是一个可以替代SQLite以及ORMlibraries的轻量级数据库。相比SQLite，Realm更快并且具有很多现代数据库的特性，比如支持JSON，流式api，数据变更通知，以及加密支持，这些都为安卓开发者带来了方便。

准确来说，它是专门为移动应用所设计的数据持久化解决方案之一。

Realm 可以轻松地移植到您的项目当中，并且绝大部分常用的功能（比如说插入、查询等等）都可以用一行简单的代码轻松完成！

Realm 并不是对 Core Data 的简单封装，相反地， Realm 并不是基于 Core Data ，也不是基于 SQLite 所构建的。它拥有自己的数据库存储引擎，可以高效且快速地完成数据库的构建操作。

### 优点

- 跨平台 ：现在绝大多数的应用开发并不仅仅只在 iOS 平台上进行开发，还要兼顾到 Android 平台的开发。为两个平台设计不同的数据库是愚蠢的，而使用 Realm 数据库， iOS 和 Android 无需考虑内部数据的架构，调用 Realm 提供的 API 就可以完成数据的交换，实现 “ 一个数据库，两个平台无缝衔接 ” 。
- 简单易用 ： Core Data 和 SQLite 冗余、繁杂的知识和代码足以吓退绝大多数刚入门的开发者，而换用 Realm ，则可以极大地减少学习代价和学习时间，让应用及早用上数据存储功能。
- 可视化 ： Realm 还提供了一个轻量级的数据库查看工具，借助这个工具，开发者可以查看数据库当中的内容，执行简单的插入和删除数据的操作。毕竟，很多时候，开发者使用数据库的理由是因为要提供一些所谓的 “ 知识库 ” 。

### 使用

CURD操作
Realm规定所有改动操作必须在事务中进行, 即改动操作必须在Realm的beginTransaction()和commitTransaction()方法之间进行 或者在executeTransaction方法的参数的回调中执行. 改动操作有: createObject/copyXxx/insert/deleteXxx 等


引入

``` gradle
dependencies {
    compile 'io.realm:realm-android:0.87.0'
}
```

#### 初始化

``` java
        /*初始化*/
        RealmConfiguration realmConfiguration = new RealmConfiguration.Builder(this)
                .name("test1.realm")// 存储文件名称，类似db文件名
                .migration(new RealmMigration() { // 当本地已经存在的数据版本跟当前运行的不一致会调用此方法
                    @Override
                    public void migrate(DynamicRealm realm, long oldVersion, long newVersion) {
                        newVersion = oldVersion + 1;
                    }
                })
                .build();
        final Realm myRealm = Realm.getInstance(realmConfiguration);// 设置配置
```

#### 类的定义

我们定义的类，必须继承于RealmObject。看下我们定义的Person类<br>
加了@PrimaryKey 的为主键，当然，我们也可以不加

``` java

public class Person extends RealmObject {

    @PrimaryKey               
    private int id;
    private String name;
    private int age;

    public Person() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

}
```

#### 清空表

``` java
//清空表
        myRealm.beginTransaction();
        myRealm.clear(Person.class);
        myRealm.commitTransaction();
```

#### 增

``` java
       //两种添加方式
        myRealm.beginTransaction();
        Person person = myRealm.createObject(Person.class);
        person.setId(10);
        person.setAge(10);
        person.setName("xiamin");
        myRealm.commitTransaction();    //有主键的表，这种操作要是主键重复了可是会报异常的

        person = new Person();
        person.setId(13);
        person.setAge(13);
        person.setName("xiamin");

        myRealm.beginTransaction();
        myRealm.copyToRealmOrUpdate(person);  // 若是没有主键的表，则不能执行该操作哦 通过主键查询它的对象，如果查询到了，则更新它，否则新建一个对象来代替。
        myRealm.commitTransaction();
```

#### 删

``` java
        //删
        Log.i("xiamin", "删除第一个");
        final RealmResults<Person> list=  myRealm.where(Person.class).findAll();
        myRealm.beginTransaction();
        list.get(0).removeFromRealm();
        myRealm.commitTransaction();
```



#### 改

``` java
        //改
        Log.i("xiamin", "修改age = 7的名字为xiamin2");
        myRealm.beginTransaction();
        person = myRealm.where(Person.class).equalTo("age",7).findFirst();
        person.setName("xiamin2");
        myRealm.commitTransaction();

```



#### 查

``` java
        //查 + 排序
        Log.i("xiamin", "查询结果");
        RealmResults<Person> results =
        myRealm.where(Person.class).findAllSorted("age");
        for (Person s: results) {
            Log.i("xiamin", "id:" + s.getId() + " name:" + s.getName() + " age:" + s.getAge());
        }
```

常见的条件如下（详细资料请查官方文档）：

between(), greaterThan(), lessThan(), greaterThanOrEqualTo() & lessThanOrEqualTo()<br>
equalTo() & notEqualTo() <br>
contains(), beginsWith() & endsWith() <br>
isNull() & isNotNull() <br>
isEmpty() & isNotEmpty()


### 常见问题

-  A RealmObject with no @PrimaryKey cannot be updated: class com.jerey.realmdemo.Person
一个没有主键的类是不使用copyToRealmOrUpdate的

-  Android Realm: Primary key constraint broken. Value already exists: 0
有主键的类，主键重复了

-  the xxx RealmMigration must be provided
出现这个问题的时候是因为，没有初始化时没有提供migration

- 没有在beginTransaction();与commitTransaction(); 就进行了事物修改等



 ----------

### 谢谢大家阅读，如有帮助，来个喜欢或者关注吧！

 ----------
 本文作者：Anderson/Jerey_Jobs

 博客地址   ： [夏敏的博客/Anderson大码渣/Jerey_Jobs][1] <br>
 简书地址   :  [Anderson大码渣][2] <br>
 CSDN地址   :  [Jerey_Jobs的专栏][3] <br>
 github地址 :  [Jerey_Jobs][4]



  [1]: http://jerey.cn/
  [2]: http://www.jianshu.com/users/016a5ba708a0/latest_articles
  [3]: http://blog.csdn.net/jerey_jobs
  [4]: https://github.com/Jerey-Jobs
