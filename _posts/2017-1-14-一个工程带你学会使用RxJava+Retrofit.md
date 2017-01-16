---
title: 2017-1-14-一个工程带你学会使用RxJava+Retrofit
tags: Android
grammar_cjkRuby: true
---

写了一个工程，大概分六个demo.java带你学习如何使用,通熟易懂，很明显，是我这个菜鸟写的。


## RxJava是什么？

RxJava 在 GitHub 主页上的自我介绍是 "a library for composing asynchronous and event-based programs using observable sequences for the Java VM"（一个在 Java VM 上使用可观测的序列来组成异步的、基于事件的程序的库）。这就是 RxJava。
简单的来说， RxJava 的本质可以压缩为异步这一个词。说到根上，它就是一个实现异步操作的库，而别的定语都是基于这之上的。

## RxJava的好处

简洁、美观

异步操作很关键的一点是程序的简洁性，因为在调度过程比较复杂的情况下，异步代码经常会既难写也难被读懂。 Android 的framework为我们创造的 AsyncTask 和Handler ，其实都是为了让异步代码更加简洁。RxJava 的优势也是简洁，但它的简洁的与众不同之处在于，随着程序逻辑变得越来越复杂，它依然能够保持简洁。
而美观呢，说实话，我是一个喜欢写程序的人，对于写完的程序，很喜欢自己去看整体的代码，如果在业务逻辑很复杂的情况下，代码会变得多层嵌套，还有多层的if else，这样看起来是很复杂的，且逻辑也容易出现漏洞。而RxJava所写出来的程序是很美观的。真的美观！不信点击demo中的代码就知道了，若加上RxBinding，那会更加美观。

## 逻辑原理

RxJava是一套基于观察者模式的工具库。众所周知，观察者模式在Android中使用的是相当的多的。
不懂观察者模式的可以移步至[观察者模式](http://jerey.cn/2016/07/23/Android%E4%B8%AD%E7%9A%84%E8%A7%82%E5%AF%9F%E8%80%85%E6%A8%A1%E5%BC%8F/)

RxJava 有四个基本概念：Observable (可观察者，即被观察者)、 Observer (观察者)、 subscribe (订阅)、事件。Observable 和 Observer 通过 subscribe() 方法实现订阅关系，从而 Observable 可以在需要的时候发出事件来通知 Observer。

其实详细的说还有很多，本文只做初步介绍。

与观察者模式不同， RxJava 的事件回调方法除了普通事件 onNext() （相当于 onClick() / onEvent()）之外，还定义了两个特殊的事件：onCompleted() 和 onError()。

RxJava 的观察者模式如下图：


## 使用

通过阅读以下代码链接，会一步一步的知道RxJava是如何使用的。

 
 * 第一章：数据的发射与接收<br>
 [第一章代码：数据的发射与接收](https://github.com/Jerey-Jobs/RxJavaDemos/blob/master/app/src/main/java/com/jerey/rxjavademo/Demo1.java)
 ton

 	
 * 第二章：通过filter 控制筛选 通过map转换格式<br>
 [第二章代码：通过filter 控制筛选 通过map转换格式](https://github.com/Jerey-Jobs/RxJavaDemos/blob/master/app/src/main/java/com/jerey/rxjavademo/Demo2.java)
 

 * 第三章：Scheduler 线程控制<br>
 [第三章代码：Scheduler 线程控制](https://github.com/Jerey-Jobs/RxJavaDemos/blob/master/app/src/main/java/com/jerey/rxjavademo/Demo3.java)
 	
 * 第四章：学会使用lift转变类型<br>
 [第四章代码：学会使用lift转变类型](https://github.com/Jerey-Jobs/RxJavaDemos/blob/master/app/src/main/java/com/jerey/rxjavademo/Demo4.java)
	
* 第五章：学会使用Observable.Transformer 改变自身属性<br>
[第五章代码：学会使用Observable.Transformer 改变自身属性](https://github.com/Jerey-Jobs/RxJavaDemos/blob/master/app/src/main/java/com/jerey/rxjavademo/Demo5.java)
	
* 第六章：学会简单使用Retrofit<br>
[第六章代码：学会使用Retrofit](https://github.com/Jerey-Jobs/RxJavaDemos/blob/master/app/src/main/java/com/jerey/rxjavademo/RetrofitDemo.java)


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
