---
title: Android开发之深入Activity
---

很多人提到Activity就知道其7大生命周期，以及各个方法的使用，但是Activity到底是怎么工作的呢？
本篇文章带你学习Activity到底是什么。

### Activity相关Framework类
- ActivityThread是什么？
ActivityThread不是一个线程，在Activity中有个
>  ActivityThread mMainThread;
ActivityThread有个main方法
``` java
     public static void main(String[] args) {
        Process.setArgV0("<pre-initialized>");

        Looper.prepareMainLooper();

        ActivityThread thread = new ActivityThread();
        thread.attach(false);
        ...
        // End of event ActivityThreadMain.
        Trace.traceEnd(Trace.TRACE_TAG_ACTIVITY_MANAGER);
        Looper.loop();
    }
```


  ActivityThread先创建，创建looper，通知ActivityManagerService进行attach

### Activity与其他类的区别
### Activity的生命方法是什么时候回调的
### Activity是如何被打开的
### Service是如何被打开的
### Activity栈交互


 ----------
 ###谢谢大家阅读，如有帮助，来个喜欢或者关注吧！

 ----------
 本文作者：Anderson/Jerey_Jobs

 简书地址：[Anderson大码渣][1]

 github地址：[Jerey_Jobs][2]
  [1]: http://www.jianshu.com/users/016a5ba708a0/latest_articles
  [2]: https://github.com/Jerey-Jobs
