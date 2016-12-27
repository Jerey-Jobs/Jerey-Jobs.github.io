---
title: Android开发优化之的强引用、软引用、弱引用、虚引用使用
---


- ### 引言

早在JDK1.2，Java就把对象的引用分为四种级别，从而使程序能更加灵活的控制对象的生命周期。这四种级别由高到低依次为：强引用、软引用、弱引用和虚引用。
但是平时我们的代码中似乎很少出现这些, 而之前还看到过一份代码中, 一个Activity中有一个静态变量持有对自己的弱引用,来达到类似的singleTask的效果.

so, 是时候系统的学习一下软引用、弱引用这些,并对我们的代码进行优化了.

强引用
软引用
弱引用
什么时候使用软引用，什么时候使用弱引用？
虚引用



 ----------
 ### 谢谢大家阅读，如有帮助，来个喜欢或者关注吧！

 ----------
 本文作者：Anderson/Jerey_Jobs

 简书地址   :  [Anderson大码渣][1]
 CSDN地址   :  [Jerey_Jobs的专栏][2]
 github地址 :  [Jerey_Jobs][3]
 

  [1]: http://www.jianshu.com/users/016a5ba708a0/latest_articles
  [2]: http://blog.csdn.net/jerey_jobs
  [3]: https://github.com/Jerey-Jobs