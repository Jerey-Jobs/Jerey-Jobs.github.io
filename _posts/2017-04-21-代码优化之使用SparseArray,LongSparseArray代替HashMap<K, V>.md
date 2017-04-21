---
title: 代码优化之使用SparseArray系列代替HashMap<K, V>
subtitle: "使用HashMap<K, V>时,若K为整数类型, 是时候考虑提升性能,减少hashCode时间消耗了"
tags:
  - Android
  - 代码优化
grammar_cjkRuby: true
header-img: "img/post-bg-unix-linux.jpg"
catalog: true
layout:  post
categories: 代码优化
date: 2017-04-21
---

- ### 引言

HashMap是一种很重要的数据存储结构。很多人在Android开发中多数都会用HashMap来存储这种映射形式的数据。然而当我们的键为int型时,若不通过HashMap可以实现映射么? 当然,最简单的就是数组了, key就是数组下标, 但是这种方法会让我们去开辟很大的一个数组, 严重浪费空间<br>

因此Java给我们提供了稀疏数组-`SparseArray` 以及它的兄弟们: `SparseBooleanArray` 、`SparseIntArray`、`SparseLongArray`以及Android提供的`LongSparseArray`， 它与前者的区别在于，前者Value为Long，后者是Key属性为long，而且前者与它的兄弟们来自于`package android.util;` 后者不是亲生的。来自于亲戚家的 `android.support.v4.util`

``` java
  HashMap<Integer, E> hash = new HashMap<Integer, E>();
```
当我们写出以上程序时, AS会报出如下警告:

![](/img/post1/sparseArrayWarning.png)

其意思就是告诉我们, 建议使用`SparseArray`代替它, 这将会带来更好的性能.

变为
``` java
    SparseArray<E> sparseArray = new SparseArray<E>();
```
- ### 原理

和HashMap类似，`SparseArray` 建立整数索引和对象的关系。和简单的对象数组相比，`SparseArray` 允许索引之间有间隔。

SparseArray 支持和 HashMap 类似的 put 和 get 方法。在其内部，维护着两个数组，一个用于存储索引，一个用于存储对象。

``` java
public class SparseArray<E> implements Cloneable {
    private static final Object DELETED = new Object();
    private boolean mGarbage = false;

    private int[] mKeys;
    private Object[] mValues;
    private int mSize;
    ...
}
```
整数索引被从小到大映射到 mKeys 数组中。

- ### 如何映射

key的传入,通过伟大的源代码开发人员一个巧妙的计算,会使得我们的key以从小到大的顺序放在内部的keys集合里面.
具体算法就不看了.


- ### put
put是一个计算下标，然后插入的过程。

``` java
public void put(int key, E value) {

    // 1. 计算索引
    int i = binarySearch(mKeys, 0, mSize, key);

    // 2. key已经有对应槽位，更新值
    if (i >= 0) {
        mValues[i] = value;
    } else {
        i = ~i;

        // 3. 扩容
        if (mSize >= mKeys.length) {
        }

        // 4. 移动区段
        if (mSize - i != 0) {
            // Log.e("SparseArray", "move " + (mSize - i));
            System.arraycopy(mKeys, i, mKeys, i + 1, mSize - i);
            System.arraycopy(mValues, i, mValues, i + 1, mSize - i);
        }

        // 4. 设置值，长度加 1
        mKeys[i] = key;
        mValues[i] = value;
        mSize++;
    }
}
```

- ### get

get是通过二分法查找, 找到key的下标后, 然后通过values[下标] , 返回给我们.

``` java
public E get(int key, E valueIfKeyNotFound) {
    int i = ContainerHelpers.binarySearch(mKeys, mSize, key);

    if (i < 0 || mValues[i] == DELETED) {
        return valueIfKeyNotFound;
    } else {
        return (E) mValues[i];
    }
}
```

- ### SparseArray 是针对HashMap做的优化。

HashMap 内部的存储结构，导致一些内存的浪费。<br>
在刚扩容完，SparseArray 和 HashMap 都会存在一些没被利用的内存。






----------
本文作者：Anderson/Jerey_Jobs

博客地址   ： [http://jerey.cn/](http://jerey.cn/)<br>
简书地址   :  [Anderson大码渣](http://www.jianshu.com/users/016a5ba708a0/latest_articles)<br>
github地址 :  [https://github.com/Jerey-Jobs](https://github.com/Jerey-Jobs)
