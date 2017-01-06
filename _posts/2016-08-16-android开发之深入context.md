---
title: android开发之深入context
tags: Android
grammar_cjkRuby: true
---

今天研究了一下Context类，对于context发现即熟悉又陌生。一个我们天天打交道的东西到底是什么呢，这篇文章将带大家了解context。

**简介**

我们先看google官方的说明

``` stylus
/**
 * Interface to global information about an application environment.  This is
 * an abstract class whose implementation is provided by
 * the Android system.  It
 * allows access to application-specific resources and classes, as well as
 * up-calls for application-level operations such as launching activities,
 * broadcasting and receiving intents, etc.
 */
public abstract class Context
```


  从上可知一下三点,即：
        1、它描述的是一个应用程序环境的信息，即上下文。<br>
        2、该类是一个抽象(abstract class)类，Android提供了该抽象类的具体实现类(后面我们会讲到是ContextIml类)。<br>
        3、通过它我们可以获取应用程序的资源和类，也包括一些应用级别操作，例如：启动一个Activity，发送广播，接受Intent 信息 等。。

那么我们明确第一点，context是一个抽象类，而我们平时用的context，均是其实现，而更伟大的是， 我们的application，我们的activity，service，均在context的继承关系树的。
让我们看一张类图，相信看完这个类图大家就知道context在我们的应用中是什么样子的地位：<br>
![context继承关系图][1]


同时我们知道了，一个应用程序App共有的Context数目公式为：
 
                     总Context实例个数 = Service个数 + Activity个数 + 1（Application对应的Context实例）
可见，我们的每个Activity，Service，Application都有自己的context，那么context是什么时候传入的呢?

**Context的传入**

   1、创建Application对象的时机
 
       每个应用程序在第一次启动时，都会首先创建Application对象。如果对应用程序启动一个Activity(startActivity)流程比较
清楚的话，创建Application的时机在创建handleBindApplication()方法中，该函数位于 ActivityThread.java类中 ，如下：

``` stylus
//创建Application时同时创建的ContextIml实例  
private final void handleBindApplication(AppBindData data){  
    ...  
    ///创建Application对象  
    Application app = data.info.makeApplication(data.restrictedBackupMode, null);  
    ...  
}  
  
public Application makeApplication(boolean forceDefaultAppClass, Instrumentation instrumentation) {  
    ...  
    try {  
        java.lang.ClassLoader cl = getClassLoader();  
        ContextImpl appContext = new ContextImpl();    //创建一个ContextImpl对象实例  
        appContext.init(this, null, mActivityThread);  //初始化该ContextIml实例的相关属性  
        ///新建一个Application对象   
        app = mActivityThread.mInstrumentation.newApplication(  
                cl, appClass, appContext);  
       appContext.setOuterContext(app);  //将该Application实例传递给该ContextImpl实例           
    }   
    ...  
}  
```

  2、创建Activity对象的时机
 
       通过startActivity()或startActivityForResult()请求启动一个Activity时，如果系统检测需要新建一个Activity对象时，就会
  回调handleLaunchActivity()方法，该方法继而调用performLaunchActivity()方法，去创建一个Activity实例，并且回调
 onCreate()，onStart()方法等， 函数都位于 ActivityThread.java类 ，如下：

``` java
//创建一个Activity实例时同时创建ContextIml实例  
private final void handleLaunchActivity(ActivityRecord r, Intent customIntent) {  
    ...  
    Activity a = performLaunchActivity(r, customIntent);  //启动一个Activity  
}  
private final Activity performLaunchActivity(ActivityRecord r, Intent customIntent) {  
    ...  
    Activity activity = null;  
    try {  
        //创建一个Activity对象实例  
        java.lang.ClassLoader cl = r.packageInfo.getClassLoader();  
        activity = mInstrumentation.newActivity(cl, component.getClassName(), r.intent);  
    }  
    if (activity != null) {  
        ContextImpl appContext = new ContextImpl();      //创建一个Activity实例  
        appContext.init(r.packageInfo, r.token, this);   //初始化该ContextIml实例的相关属性  
        appContext.setOuterContext(activity);            //将该Activity信息传递给该ContextImpl实例  
        ...  
    }  
    ...      
}  
 
```


 

3、创建Service对象的时机

 
       通过startService或者bindService时，如果系统检测到需要新创建一个Service实例，就会回调handleCreateService()方法，
 完成相关数据操作。handleCreateService()函数位于 ActivityThread.java类，如下：

``` java
//创建一个Service实例时同时创建ContextIml实例  
private final void handleCreateService(CreateServiceData data){  
    ...  
    //创建一个Service实例  
    Service service = null;  
    try {  
        java.lang.ClassLoader cl = packageInfo.getClassLoader();  
        service = (Service) cl.loadClass(data.info.name).newInstance();  
    } catch (Exception e) {  
    }  
    ...  
    ContextImpl context = new ContextImpl(); //创建一个ContextImpl对象实例  
    context.init(packageInfo, null, this);   //初始化该ContextIml实例的相关属性  
    //获得我们之前创建的Application对象信息  
    Application app = packageInfo.makeApplication(false, mInstrumentation);  
    //将该Service信息传递给该ContextImpl实例  
    context.setOuterContext(service);  
    ...  
}  
```
需要强调一点的是，通过对ContextImp的分析可知，其方法的大多数操作都是直接调用其属性mPackageInfo(该属性类型为PackageInfo)的相关方法而来。这说明ContextImp是一种轻量级类，而PackageInfo才是真正重量级的类。而一个App里的所有ContextIml实例，都对应同一个packageInfo对象


  [1]: ./images/context.png "context.png"
