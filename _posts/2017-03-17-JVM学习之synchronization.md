---
title: JVM学习之 线程同步背后的原理
tags:
    - JVM
header-img: "img/post-bg-unix-linux.jpg"
preview-img: "/img/post-bg-unix-linux.jpg"
grammar_cjkRuby: true
catalog: true
layout:  post
---

本文来自[How the Java virtual machine performs thread synchronization](http://www.javaworld.com/article/2076971/java-concurrency/how-the-java-virtual-machine-performs-thread-synchronization.html)

## 前言
所有的 Java 程序都会被翻译为包含字节码的 class 文件，字节码是 JVM 的机器语言。这篇文章将阐述 JVM 是如何处理线程同步以及相关的字节码。

## 线程和共享数据
Java 的一个优点就是在语言层面支持多线程，这种支持集中在协调多线程对数据的访问上。

JVM 将运行时数据划分为几个区域：一个或多个栈，一个堆，一个方法区。

在 JVM 中，每个线程拥有一个栈，其他线程无法访问，里面的数据包括：局部变量，函数参数，线程调用的
方法的返回值。栈里面的数据只包含原生数据类型和对象引用。在 JVM 中，不可能将实际对象的拷贝放入栈。
所有对象都在堆里面。

JVM 只有一个堆，所有线程都共享它。堆中只包含对象，把单独的原生类型或者对象引用放入堆也是不可能的，
除非它们是对象的一部分。数组也在堆中，包括原生类型的数组，因为在 Java 中，数组也是对象。

除了栈和堆，另一个存放数据的区域就是方法区了，它包含程序中使用到的所有类（静态）变量。方法区类似于栈，也只包含原生类型和对象引用，但是又跟栈不同，方法区中类变量是线程共享的。

## 对象锁和类锁
正如前面所说，JVM 中的两个区域包含线程共享的数据，分别是：

1. **堆**：包含所有对象
2. **方法区**：包含所有类变量

如果多个线程需要同时使用同一个对象或者类变量，它们对数据的访问必须被恰当地控制。否则，程序会产生不可预测的行为。

为了协调多个线程对共享数据的访问，JVM 给每个对象和类关联了一个锁。锁就像是任意时间点只有一个线程能够拥有的特权。如果一个线程想要锁住一个特定的对象或者类，它需要向 JVM 请求锁。线程向 JVM 请求锁之后，可能很快就拿到，或者过一会就拿到，也可能永远拿不到。当线程不需要锁之后，它把锁还给 JVM。如果其他线程需要这个锁，JVM 会交给该线程。

类锁的实现其实跟对象锁是一样的。当 JVM 加载类文件的时候，它会创建一个对应类`java.lang.Class`对象。当你锁住一个类的时候，你实际上是锁住了这个类的`Class`对象。

线程访问对象实例或者类变量的时候不需要获取锁。但是如果一个线程获取了一个锁，其他线程不能访问被锁住的数据，直到拥有锁的线程释放它。

## 管程
JVM 使用锁和管程协作。管程监视一段代码，保证一个时间点内只有一个线程能执行这段代码。

每个管程与一个对象引用关联。当线程到达管程监视代码段的第一条指令时，线程必须获取关联对象的锁。线程不能执行这段代码直到它得到了锁。一旦它得到了锁，线程可以进入被保护的代码段。

当线程离开被保护的代码块，不管是如何离开的，它都会释放关联对象的锁。

## 多次锁定
一个线程被允许锁定一个对象多次。对于每个对象，JVM 维护了一个锁的计数器。没有被锁的对象计数为 0。当一个线程第一次获取锁，计数器自增变为 1。每次这个线程（已经得到锁的线程）请求同一个对象的锁，计数器都会自增。每次线程释放锁，计数器都会自减。当计数器变为 0 时，锁才被释放，可以给别的线程使用。

## 同步块
在 Java 语言的术语中，协调多个线程访问共享数据被称为**同步（synchronization）**。Java 提供了两种内建的方式来同步对数据的访问：

1. 同步语句
2. 同步方法

### 同步语句
为了创建同步语句，你需要使用`synchronized`关键字，括号里面是同步的对象引用，如下所示：

``` java
    class KitchenSync {
        private int[] intArray = new int[10];
        void reverseOrder() {
            synchronized (this) {
                int halfWay = intArray.length / 2;
                for (int i = 0; i < halfWay; ++i) {
                    int upperIndex = intArray.length - 1 - i;
                    int save = intArray[upperIndex];
                    intArray[upperIndex] = intArray[i];
                    intArray[i] = save;
                }
            }
        }
    }
```

在上面的例子中，被同步块包含的语句不会被执行，直到线程得到`this`引用的对象锁。如果不是锁住`this`引用，而是锁住其他对象，在线程执行同步块语句之前，它需要获得该对象的锁。

有两个字节码`monitorenter`和`monitorexit`，被用来**同步方法中的同步块**。

| 字节码 | 操作数 | 描述 |
| - | - | - |
| monitorenter | 无 | 取出对象引用，请求与对象引用关联的锁
| monitorexit | 无 | 取出对象引用，释放与对象引用关联的锁

当`monitorenter`被 JVM 执行时，它请求栈顶对象引用关联的锁。如果该线程已经拥有该对象的锁，计数器自增。每次`monitorexit`被执行，计数器自减。当计数器变为 0 时，该锁被释放。

**注意：**当同步块中抛出异常时，`catch`语句保证对象锁被释放。不管同步块是如何退出的，JVM 保证线程会释放锁。

### 同步方法
为了同步整个方法，你只需要在方法声明前面加上`synchronized`关键字。

``` java
    class HeatSync {
        private int[] intArray = new int[10];
        synchronized void reverseOrder() {
            int halfWay = intArray.length / 2;
            for (int i = 0; i < halfWay; ++i) {
                int upperIndex = intArray.length - 1 - i;
                int save = intArray[upperIndex];
                intArray[upperIndex] = intArray[i];
                intArray[i] = save;
            }
        }
    }
```

JVM 不会使用特殊的字节码来调用同步方法。当 JVM 解析方法的符号引用时，它会判断方法是不是同步的。如果是，JVM 要求线程在调用之前请求锁。对于实例方法，JVM 要求得到该实例对象的锁。对于类方法，JVM 要求得到类锁。在同步方法完成之后，不管它是正常返回还是抛出异常，锁都会被释放。



 ----------

 谢谢大家阅读，如有帮助，来个喜欢或者关注吧！

 ----------
 本文作者：Anderson/Jerey_Jobs

 博客地址   ： [夏敏的博客/Anderson大码渣/Jerey_Jobs][1] <br>
 简书地址   :  [Anderson大码渣][2] <br>
 github地址 :  [Jerey_Jobs][4]



  [1]: http://jerey.cn/
  [2]: http://www.jianshu.com/users/016a5ba708a0/latest_articles
  [3]: http://blog.csdn.net/jerey_jobs
  [4]: https://github.com/Jerey-Jobs
