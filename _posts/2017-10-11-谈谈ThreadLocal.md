---
title: 谈谈那个听起来挺高大上的ThreadLocal
tags:
  - Java
grammar_cjkRuby: true
header-img: "img/post-bg-digital-native.jpg"
preview-img: "/img/preview/threadlocal.png"
catalog: true
layout:  post
categories: Java
date: 2017-10-12
---

`ThreadLocal`估计很多人都没听过,因为说实话平时写代码很少用到,我第一次看到代码里用`ThreadLocal`是在`Looper`的源码,`Looper`的源码中有下面这样的一个定义:
```
    static final ThreadLocal<Looper> sThreadLocal = new ThreadLocal<Looper>();
```

### 定义

大家可以百度看,都说的很高大上,普通的解释是:当使用ThreadLocal维护变量时，ThreadLocal为每个使用该变量的线程提供独立的变量副本，所以每一个线程都可以独立地改变自己的副本，而不会影响其它线程所对应的副本。

看完了感觉没看一样, 要想了解它其实去看他的源码一看便知,因为`ThreadLocal`代码也就几百行而已.

`ThreadLocal`类主要提供set与get方法, 我们一起来看看get与set是如何与线程关联起来的.

普通的大家想把一个类与线程关联起来,我们会采用线程号作为ID,该数据作为value,可以存进一个线程安全的map里.但是ThreadLocal不是这么干的.

### ThreadLocal

我们开启源码模式,JDK6与JDK7实现有些区别,不过思想是一样的.这边使用JDK7的源码

```
    /**
     * Sets the current thread's copy of this thread-local variable
     * to the specified value.  Most subclasses will have no need to
     * override this method, relying solely on the {@link #initialValue}
     * method to set the values of thread-locals.
     *
     * @param value the value to be stored in the current thread's copy of
     *        this thread-local.
     */
    public void set(T value) {
        Thread t = Thread.currentThread();
        ThreadLocalMap map = getMap(t);
        if (map != null)
            map.set(this, value);
        else
            createMap(t, value);
    }
```

我们看到,我们存储的数据就被map这个变量set进去了.


那么map来自于以下代码.
```
    /**
     * Get the map associated with a ThreadLocal. Overridden in
     * InheritableThreadLocal.
     *
     * @param  t the current thread
     * @return the map
     */
    ThreadLocalMap getMap(Thread t) {
        return t.threadLocals;
    }

        /**
     * Create the map associated with a ThreadLocal. Overridden in
     * InheritableThreadLocal.
     *
     * @param t the current thread
     * @param firstValue value for the initial entry of the map
     * @param map the map to store.
     */
    void createMap(Thread t, T firstValue) {
        t.threadLocals = new ThreadLocalMap(this, firstValue);
    }
```

大家发现了,这个map竟然是Thread这个类的一个变量,初始时为空,拿不到map会自动给它创建一个map.

### ThreadLocalMap

可以再看看,这个`ThreadLocalMap`类:
``` java
    static class ThreadLocalMap {

        /**
         * The entries in this hash map extend WeakReference, using
         * its main ref field as the key (which is always a
         * ThreadLocal object).  Note that null keys (i.e. entry.get()
         * == null) mean that the key is no longer referenced, so the
         * entry can be expunged from table.  Such entries are referred to
         * as "stale entries" in the code that follows.
         */
        static class Entry extends WeakReference<ThreadLocal> {
            /** The value associated with this ThreadLocal. */
            Object value;

            Entry(ThreadLocal k, Object v) {
                super(k);
                value = v;
            }
        }

        /**
         * The initial capacity -- MUST be a power of two.
         */
        private static final int INITIAL_CAPACITY = 16;

                /**
         * Set the value associated with key.
         *
         * @param key the thread local object
         * @param value the value to be set
         */
        private void set(ThreadLocal key, Object value) {

            // We don't use a fast path as with get() because it is at
            // least as common to use set() to create new entries as
            // it is to replace existing ones, in which case, a fast
            // path would fail more often than not.

            ...
            if (!cleanSomeSlots(i, sz) && sz >= threshold)
                rehash();
        }

```

常看源码的同学会发现了,这个类没有实现Map的接口,但是有相似的设计,我们看到了`INITIAL_CAPACITY`,看到了`Entry`这些在HashMap源码中常见的命名方式,我们还看到了set方法中`rehash`这个重新hash的方法,那么总体而言,我们可以把这个类当做这个是一个K为`ThreadLocal`的map.

### 总结
知道上面两点后,我们知道了.Thread这个线程类中含有一个`ThreadLocalMap`变量,我们的`ThreadLocal`只是帮助你存对象的,真正你使用`ThreadLocal`存储一个与线程相关的对象时,其实这个对象已经交给了这个线程.

什么 还不相信? 那我们看Thread类的代码:
``` java
public class Thread implements Runnable {
     188行处...
    /* ThreadLocal values pertaining to this thread. This map is maintained
     * by the ThreadLocal class. */
    ThreadLocal.ThreadLocalMap threadLocals = null;
}
```

好了,的确Thread类有这么一个变量.

再看定义: 每一个线程都可以独立地改变自己的副本，而不会影响其它线程所对应的副本。

这次都该明白了,就是每个Thread都存储着自己的局部变量,当然不会影响另一个Thread的threadLocals变量拉.

因此我们可以使用`ThreadLocal`,来存储与线程绑定的数据.我们必须记住,ThreadLocal存储的变量是属于每个线程的,并不是表面上看起来只有一个.
