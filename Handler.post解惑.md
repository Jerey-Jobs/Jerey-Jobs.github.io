---
title: Handler.post解惑
grammar_cjkRuby: true
---
本人今日拿到一份代码，其中网络请求方面由于很简单，就没有使用网络请求框架，ok，那按照我的想法，开启一个线程拿个数据，拿完发送handler更新UI即可了，但是代码中并不是这么写的，而是通过mNetHandler.post一个包含网络请求的runnable。mNetHandler的来源是这样的。

``` stylus
        HandlerThread handlerThread = new HandlerThread("NET");
        handlerThread.start();
        mNetHandler = new Handler(handlerThread.getLooper());
```
而当我询问原因时，解释是用mNetHandler来管理这些Runnable，在view结束时，
> mNetHandler.removeCallback

移除这些runnable，解决掉在view，或者说activity中开启线程，而当view或者activity结束时 线程仍然存活的问题。

但是目前存在一个问题，removeCallback并不是立即停止该线程，而是移除掉还未执行的callback，正在执行的是无法立即结束的。


Android程序员都知道不能在UI线程执行耗时的操作，Android引入handler就是为了解决这个问题，当然实现异步更新UI不仅仅只有这一种方法，还有AsyncTask也可以实现。

Android有一个 Handler类，使用该类可以对运行在不同线程中的多个任务进行排队，并使用Message和Runnable对象安排这些任务。在javadoc中，对Handler是这样解释的：Handler可以发送和处理消息对象或Runnable对象，这些消息对象和Runnable对象与一个线程相关联。每个Handler的实例都关联了一个线程和线程的消息队列。当创建了一个Handler对象时，一个线程或消息队列同时也被创建，该Handler对象将发送和处理这些消息或Runnable对象。

a、如果new一个无参构造函数的Handler对象，那么这个Handler将自动与当前运行线程相关联，也就是说这个Handler将与当前运行的线程使用同一个消息队列，并且可以处理该队列中的消息。
    我做过这样一个实验，在主用户界面中创建一个带有无参构造函数的Handler对象，该Handler对象向消息队列推送一个Runnable对象，在Runnable对象的run函数中打印当前线程Id，主用户界面线程ID和Runnable线程ID均为1。
    
b、如果new一个带参构造函数的Handler对象，那么这个Handler对象将与参数所表示的Looper相关联。注意：此时线程类应该是一个特殊类HandlerThread类，一个Looper类的Thread类，它继承自Thread类。

c、如果需要Handler对象去处理消息，那么就要重载Handler类的handleMessage函数。

 ----------
 ###谢谢大家阅读，如有帮助，来个喜欢或者关注吧！

 ----------
 本文作者：Anderson/Jerey_Jobs

 简书地址：[Anderson大码渣][1]

 github地址：[Jerey_Jobs][2]
  [1]: http://www.jianshu.com/users/016a5ba708a0/latest_articles
  [2]: https://github.com/Jerey-Jobs
