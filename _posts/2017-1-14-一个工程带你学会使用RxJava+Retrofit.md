---
title: 2017-1-14-一个工程带你学会使用RxJava+Retrofit
tags: Android
grammar_cjkRuby: true
---

写了一个工程，大概分六个demo.java带你学习如何使用,通熟易懂，很明显，是我这个菜鸟写的。

 * 代码链接：
 
 	* [第一章代码：数据的发射与接收](https://github.com/Jerey-Jobs/RxJavaDemos/blob/master/app/src/main/java/com/jerey/rxjavademo/Demo1.java)
 	
 	* [第二章代码：通过filter 控制筛选 通过map转换格式](https://github.com/Jerey-Jobs/RxJavaDemos/blob/master/app/src/main/java/com/jerey/rxjavademo/Demo2.java)
 	
 	* [第三章代码：Scheduler 线程控制](https://github.com/Jerey-Jobs/RxJavaDemos/blob/master/app/src/main/java/com/jerey/rxjavademo/Demo3.java)
 	
	* [第四章代码：学会使用lift转变类型](https://github.com/Jerey-Jobs/RxJavaDemos/blob/master/app/src/main/java/com/jerey/rxjavademo/Demo4.java)
	
	* [第五章代码：学会使用Observable.Transformer 改变自身属性](https://github.com/Jerey-Jobs/RxJavaDemos/blob/master/app/src/main/java/com/jerey/rxjavademo/Demo5.java)
	
	* [第六章代码：学会使用Retrofit](https://github.com/Jerey-Jobs/RxJavaDemos/blob/master/app/src/main/java/com/jerey/rxjavademo/RetrofitDemo.java)

## RxJava是什么？

RxJava 在 GitHub 主页上的自我介绍是 "a library for composing asynchronous and event-based programs using observable sequences for the Java VM"（一个在 Java VM 上使用可观测的序列来组成异步的、基于事件的程序的库）。这就是 RxJava。
简单的来说， RxJava 的本质可以压缩为异步这一个词。说到根上，它就是一个实现异步操作的库，而别的定语都是基于这之上的。

## RxJava的好处

简洁、美观

异步操作很关键的一点是程序的简洁性，因为在调度过程比较复杂的情况下，异步代码经常会既难写也难被读懂。 Android 的framework为我们创造的 AsyncTask 和Handler ，其实都是为了让异步代码更加简洁。RxJava 的优势也是简洁，但它的简洁的与众不同之处在于，随着程序逻辑变得越来越复杂，它依然能够保持简洁。
而美观呢，说实话，我是一个喜欢写程序的人，对于写完的程序，很喜欢自己去看整体的代码，如果在业务逻辑很复杂的情况下，代码会变得多层嵌套，还有多层的if else，这样看起来是很复杂的，且逻辑也容易出现漏洞。而RxJava所写出来的程序是很美观的。真的美观！不信点击demo中的代码就知道了，若加上RxBinding，那会更加美观。



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
