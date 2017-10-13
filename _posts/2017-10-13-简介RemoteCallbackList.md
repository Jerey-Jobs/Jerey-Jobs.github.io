---
title: RemoteCallbackList简介
subtitle: "一个重要的辅助工具类"
tags:
  - Android
grammar_cjkRuby: true
header-img: "img/post-bg-digital-native.jpg"
preview-img: "/img/preview/remotecallbacklist.png"
catalog: true
layout:  post
categories: Android
date: 2017-10-13
---


项目中有一个继承于`RemoteCallbackList`的类已经很久了,我知道它是用来维护服务端回调客户端的回调接口的.但是网上少有这个类的介绍,今天我便写文章介绍一下.

其官方API介绍在:[https://developer.android.google.cn/reference/android/os/RemoteCallbackList.html](https://developer.android.google.cn/reference/android/os/RemoteCallbackList.html)

`RemoteCallbackList`位于android.os包下.顾名思义,是Android系统提供的用于管理远程回调列表的类.有人会问,为什么回调接口要特定维护:
1. 你的远程回调接口因为是有可能多个客户端来调用,因此你需要将每个接口与每个客户端的key进行绑定,这里我们的key可以使用远程客户端的`IBinder`.
2. 你的回调接口因为远程客户端会死掉, 你需要及时将死去的客户端回调接口清除掉,当然,这点我们自己写程序也可以实现
3. 你的回调接口尽可能要线程安全, 而AIDL是在binder线程池调用的. 其间可能存在诸多线程同步引起的问题

So.`RemoteCallbackList`就是帮助我们解决这些问题的一个类.

### 原理

`RemoteCallbackList`内部使用了ArrayMap
> ArrayMap<IBinder, Callback> mCallbacks = new ArrayMap<IBinder, Callback>();

来维护每个IBinder与Callback的对应,并给每个IBinder都设置了死亡监听

>binder.linkToDeath(cb, 0);

并且在死亡时,还能收到死亡的通知.如需要接收死亡通知,进行服务端部分状态的切换,继承该`RemoteCallbackList`, 复写以下方法即可.
``` java
    public void onCallbackDied(E callback, Object cookie) {
        onCallbackDied(callback);
    }
```

### 使用

- 如何注册?
在我们的服务里定义一个`RemoteCallbackList`成员变量即可. 在注册回调接口时,调用`RemoteCallbackList`的`register`方法, 在销毁注册时,调用`unregister`即可.

- 如何回调?

我们看个方法

``` java
int beginBroadcast()
```

>Prepare to start making calls to the currently registered callbacks. This creates a copy of the callback list, which you can retrieve items from using getBroadcastItem(int). Note that only one broadcast can be active at a time, so you must be sure to always call this from the same thread (usually by scheduling with Handler) or do your own synchronization. You must call finishBroadcast() when done.

意思就是: 凡是回调之前,都要调用该方法,进行回调前的准备,它会返回当前注册回调的个数.并且这个因为一次只能有一个回调在发生,因此要注意所有的回调放在同一线程,或者自己进行同步.回调完了还要记得调用`finishBroadcast()`

同时谷歌官方给出了经典的回调示例:
``` java
 int i = callbacks.beginBroadcast();
 while (i > 0) {
     i--;
     try {
         callbacks.getBroadcastItem(i).somethingHappened();
     } catch (RemoteException e) {
         // The RemoteCallbackList will take care of removing
         // the dead object for us.
     }
 }
 callbacks.finishBroadcast();
```

也就是说 `callbacks.getBroadcastItem(i)`即拿到了我们自定义的callback, 然后我们回调即可.

### 扩展

对于上面这种回调方式, 每次回调都要进行相同的操作,而且要放在同一线程, 建议这种的情况使用[Android多进程稳定性优化](http://www.jianshu.com/p/21bad3c0412e)里面的编程模式,进行统一处理.


