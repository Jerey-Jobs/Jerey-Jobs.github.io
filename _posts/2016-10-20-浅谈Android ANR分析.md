---
title: 浅谈Android ANR分析
tags: Android
grammar_cjkRuby: true
catalog: true
layout:  post
preview-img: "/img/preview/anr.png"
---

 -  ** 什么是ANR？**

ANR:Application Not Responding，即应用无响应

 - **ANR的类型**

1：KeyDispatchTimeout(5 seconds) --主要类型  按键或触摸事件在特定时间内无响应
2：BroadcastTimeout(10 seconds)   BroadcastReceiver在特定时间内无法处理完成
3：ServiceTimeout(20 seconds) --小概率类型   Service在特定的时间内无法处理完成

 - **KeyDispatchTimeout**

Akey or touch event was not dispatched within the specified time（按键或触摸事件在特定时间内无响应）
具体的超时时间的定义在framework/base/service/core下的
ActivityManagerService.java

``` livecodeserver
//How long we wait until we timeout on key dispatching.
staticfinal int KEY_DISPATCHING_TIMEOUT = 5*1000
```


*此参数可以修改，我看到我们公司的代码中此处被改成了8秒，可能是机器性能不行。为了减少因机器配置问题而导致的ANR问题，所以如此修改*

 - **为什么会超时呢？**

超时时间的计数一般是从按键分发给app开始。超时的原因一般有两种：
(1)当前的事件没有机会得到处理（即UI线程正在处理前一个事件，没有及时的完成或者looper被某种原因阻塞住了）
(2)当前的事件正在处理，但没有及时完成

 -  **如何避免KeyDispatchTimeout**
1：UI线程尽量只做跟UI相关的工作
2：耗时的工作（比如数据库操作，I/O，连接网络或者别的有可能阻碍UI线程的操作）把它放入单独的线程处理
3：尽量用Handler来处理UIthread和别的thread之间的交互

 - **UI线程**

说了那么多的UI线程，那么哪些属于UI线程呢？
UI线程主要包括如下：
Activity:onCreate(), onResume(), onDestroy(), onKeyDown(), onClick(),etc
AsyncTask: onPreExecute(), onProgressUpdate(), onPostExecute(), onCancel,etc
Mainthread handler: handleMessage(), post(runnable)

 - **ANR分析**
 我们知道，应用程序是由ActivityManagerService和WindowManagerService系统服务监视的，当ANR发生时，ActivityManagerService中的appNoResPonding方法，会将错误信息先写入logcat，同时，将ANR的 stack trace信息写入到trace文件中，trace文件的路径为data/anr/trace.txt


1、WindowManagerService中有一个InputDispathcherThread,该线程是个while(true)循环，始终在读取输入事件队列，分类并处理这些事件；

``` groovy
QueuedEvent ev = mQueue.getEvent((int)((!configChanged && curTime < nextKeyTime) ? (nextKeyTime-curTime) : 0));
KeyQ mQueue；
private class KeyQ extends KeyInputQueue implements KeyInputQueue.FilterCallback
```


2、输入事件被分成四类：

       键盘输入（RawInputEvent.CLASS_KEYBOARD）；
       触摸屏输入（RawInputEvent.CLASS_TOUCHSCREEN）；
       轨迹球输入（RawInputEvent.CLASS_TRACKBALL）；
       RawInputEvent.CLASS_CONFIGURATION_CHANGED，(注：不明)
3、然后各种事件处理的方法把事件传递给View或window：

            focus.mClient.dispatchKey(event);
            target.mClient.dispatchPointer(ev, eventTime, true);
            focus.mClient.dispatchTrackball(ev, eventTime, true);

分析ANR与输入事件处理流程的关联

1、当有输入事件输入并得到处理时，WindowManagerService都会记录一些状态

     输入事件的状态 由 Class com.android.server.WindowManagerService.KeyWaiter.DispatchState 实现.
     显示窗口的状态 由 Class com.android.server.WindowManagerService.WindowState 实现.
2、在每次处理输入事件之前，WindowManagerService都会检查上一次的输入事件是否处理完成，该实现就是waitForNextEventTarget方法实现的。

``` java
      private int dispatchPointer(QueuedEvent qev, MotionEvent ev, int pid, int uid) {
         Object targetObj = mKeyWaiter.waitForNextEventTarget(null, qev, ev, true, false, pid, uid);
      .......
```


3、KeyWaiter.waitForNextEventTarget方法和注释

``` applescript
        /**
         * Wait for the last event dispatch to complete, then find the next
         * target that should receive the given event and wait for that one
         * to be ready to receive it.
         */
        Object waitForNextEventTarget(KeyEvent nextKey, QueuedEvent qev,
                MotionEvent nextMotion, boolean isPointerEvent,
                boolean failIfTimeout, int callingPid, int callingUid)
```


4、在KeyWaiter.waitForNextEventTarget中，会根据Focuse的窗口和上一次输入事件的一些状态值去判断上一次的输入事件是否执行已经执行完成

5、值得关注的状态标识

>   Variable Private
> com.android.server.WindowManagerService.KeyWaiter.mFinished   Variable
> com.android.server.WindowManagerService.KeyWaiter.waitForNextEventTarget.targetWin
> Variable com.android.server.WindowManagerService.mDisplayFrozen  
> Variable com.android.server.WindowManagerService.mFocusedApp  
> Variable com.android.server.WindowManagerService.mFocusedApp  
> Variable com.android.server.WindowManagerService.mCurrentFocus


  KeyWaiter.mFinished，当一个输入事件被处理后，但该事件没有完成时 mFinished=false，事件完成后 mFinished=true；所以ANR 产生时mFinished =false；
ANR检测机制

对与按键响应不及时（keyDispatchingTimedOut）的ANR，当触发一个造成ANR的键盘事件后，如果不再有任何输入操作，无论多长时间ANR对话框是不会弹出的，只有在下一次输入事件产生后5秒才会弹出ANR。简单说就是，输入事件ANR的检测需要下一次输入事件来触发其检测机制，并触发ANR。


 - **如何调查并解决ANR**

1：首先分析log
2: 从trace.txt文件查看调用stack.
3: 看代码
4：仔细查看ANR的成因（iowait?block?memoryleak?）
 **分析logcat输出**

 log输出会包括{
 	  进程名
      application id
      reason
      CPU状态{
      						各种占用率
                            占用率统计
      				 }
 }

从LOG可以看出ANR的类型，CPU的使用情况，如果CPU使用量接近100%，说明当前设备很忙，有可能是CPU饥饿导致了ANR

如果CPU使用量很少，说明主线程被BLOCK了

如果IOwait很高，说明ANR有可能是主线程在进行I/O操作造成的，也有可能是内存不够申请不到空间


 **分析trace.txt**



``` stylus
pid 21404 at 2011-04-0113:12:14 -----
Cmdline: com.android.email
DALVIK THREADS:
(mutexes: tll=0tsl=0 tscl=0 ghl=0 hwl=0 hwll=0)
"main" prio=5 tid=1NATIVE --表示线程状态 （
/?dalvik/?vm/?Thread.h
0042 enum ThreadStatus {
0043 THREAD_UNDEFINED = -1, /* makes enum compatible with int32_t */
0045 /* these match up with JDWP values */
0046 THREAD_ZOMBIE = 0, /* TERMINATED */
0047 THREAD_RUNNING = 1, /* RUNNABLE or running now */
0048 THREAD_TIMED_WAIT = 2, /* TIMED_WAITING in Object.wait() */
0049 THREAD_MONITOR = 3, /* BLOCKED on a monitor */
0050 THREAD_WAIT = 4, /* WAITING in Object.wait() */
0051 /* non-JDWP states */
0052 THREAD_INITIALIZING = 5, /* allocated, not yet running */
0053 THREAD_STARTING = 6, /* started, not yet on thread list */
0054 THREAD_NATIVE = 7, /* off in a JNI native method */
0055 THREAD_VMWAIT = 8, /* waiting on a VM resource */
0056 THREAD_SUSPENDED = 9, /* suspended, usually by GC or debugger */
0057 };
）
| group="main" sCount=1 dsCount=0obj=0x2aad2248 self=0xcf70
| sysTid=21404 nice=0 sched=0/0cgrp=[fopen-error:2] handle=1876218976
atandroid.os.MessageQueue.nativePollOnce(Native Method)
atandroid.os.MessageQueue.next(MessageQueue.java:119)
atandroid.os.Looper.loop(Looper.java:110)
at android.app.ActivityThread.main(ActivityThread.java:3688)
at java.lang.reflect.Method.invokeNative(Native Method)
atjava.lang.reflect.Method.invoke(Method.java:507)
atcom.android.internal.os.ZygoteInit$MethodAndArgsCaller.run(ZygoteInit.java:866)
at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:624)
at dalvik.system.NativeStart.main(Native Method)

```

1. 第一行是 固定的头, 指明下面的都是 当前运行的 dvm thread ：“DALVIK THREADS:”

2. 第二行输出的是该 进程里各种线程互斥量的值。（具体的互斥量的作用在 dalvik 线程一章 单独陈述）

3. 第三行输出分别是 线程的名字（“main”），线程优先级（“prio=5”），线程id（“tid=1”） 以及线程的 类型（“NATIVE”）


通过trace文件的分析，我们可以容易分析各种死锁问题，IO问题
