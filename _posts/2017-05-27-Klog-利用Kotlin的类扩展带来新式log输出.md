---
title: Klog-利用Kotlin的类扩展带来新式log输出
tags:
  - Kotlin
grammar_cjkRuby: true
header-img: "img/bg-sansung.jpg"
preview-img: "/img/preview/klog.png"
layout:  post
categories: Kotlin
date: 2017-05-27
---


本着踩坑Kotlin的态度, 写了一个Kotlin的log库.使用起来很方便. 大家学习Kotlin的可以看一下.
Github: [https://github.com/Jerey-Jobs/Klog](https://github.com/Jerey-Jobs/Klog)

无论什么语言, 程序员都需要输出log, Kotlin的语法扩展功能可为我们带来更新奇的输出log模式.

输出log的目的,无非两种情况<br>
1.用来表明程序执行到哪了<br>
2.打印数据处理前后的值<br>

那么Klog带来了数据边处理边打印的模式.

### Klog简介 (what is Klog?)

Klog是用Kotlin所写的,利用其类扩展,实现了链式调用时,在不破坏其代码整体性的情况下,能够实现数据打印跟踪的log库.<br>

- 优点:<br>
1.链式打印<br>
2.自动识别调用方类名为TAG<br>
3.打印线程号,代码行 (默认不开启,需要开启请 `Klog.getSettings().setBorderEnable(true)`)<br>
4.打印等级控制

- 缺点:<br>
 由于Kotlin对于伴生类方法的惰性加载优化, 在kt中调用可以使用 `Klog.d("hello")`,但是在java中,其使用的是内部类的方式实现惰性加载.<br>
 因此在java中, 调用方式变为了 `Klog.Companion.i("test");`<br>

*有更好的实现方式的欢迎pr or issues*

获取
------
project's build.gradle

``` gradle
  	allprojects {
  		repositories {
              ...
              maven { url 'https://jitpack.io' }
  		}
  	}
```

module's build.gradle (模块的build.gradle)

``` gradle
	dependencies {
	        compile 'com.github.Jerey-Jobs:Klog:v0.2'
	}
```


说明(Explanation)
------

这种边处理字符串边打印的模式.
``` kotlin
    str.log()                   //直接输出该对象toString
       .toUpperCase()
       .log("upper")             //输出带提示的处理结果
       .toLowerCase()            //继续处理
       .log("lower")
```

![](/img/preview/klog.png)


又比如在lambda时,我们调试时需要跟踪数据被处理的情况

``` kotlin
    var list = arrayListOf<String>("aaa", "bb", "cccc", "ddddd")
    list.log("init")
        .map { it -> it.toUpperCase() }
        .log("after map")
        .filter { it -> it.length > 2 }
        .log("after filter")
```
![klog3.png](http://upload-images.jianshu.io/upload_images/2305881-75b998a6f0a4eb00.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

又或者,我们需要直接打印

``` kotlin
    //修改Klog设置, 开启边框打印
    Klog.getSettings()
            .setBorderEnable(true)

    Klog.a("aaaaaaa")            //普通log输出方式1
    Klog.a(contents = "bbbbb")   //普通log输出方式2
    Klog.i("jerey", "aaaaaaa")    //带tag输出
```
![](http://upload-images.jianshu.io/upload_images/2305881-4f2545ca095b735c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

so, Kotlin的类扩展为我们带来无限遐想,我们可以干的事情还有很多很多

欢迎Star!!
Github: [https://github.com/Jerey-Jobs/Klog](https://github.com/Jerey-Jobs/Klog)



----------
本文作者：Anderson/Jerey_Jobs

博客地址   ： [http://jerey.cn/](http://jerey.cn/)<br>
简书地址   :  [Anderson大码渣](http://www.jianshu.com/users/016a5ba708a0/latest_articles)<br>
github地址 :  [https://github.com/Jerey-Jobs](https://github.com/Jerey-Jobs)
