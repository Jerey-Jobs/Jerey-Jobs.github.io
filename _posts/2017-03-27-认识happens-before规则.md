---
title: 认识happens-before规则与指令的重排序
subtitle: "从happen—before分析DCL的volatile"
tags:
  - Java
grammar_cjkRuby: true
header-img: "img/bg-java.png"
preview-img: "/img/bg-java.png"
catalog: true
layout:  post
---

### 为什么要有happens-before规则
最简单的，我们写了一个程序循环打印1000w次i的值，而i没有其他地方改变这个值，那么我们的程序会去读取1000w次i的值么。若你没有指定volatile, 程序肯定不会蠢到去读取一千万次。为什么呢？ 那就是编译器的优化了。<br>

我们编写的程序都要经过优化后（编译器和处理器会对我们的程序进行优化以提高运行效率）才会被运行，优化分为很多种，其中有一种优化叫做重排序，重排序需要遵守happens-before规则，不能说你想怎么排就怎么排，如果那样岂不是乱了套。

### happens-before规则
下面是Java内存模型中的八条可保证happen—before的规则，它们无需任何同步器协助就已经存在，可以在编码中直接使用。如果两个操作之间的关系不在此列，并且无法从下列规则推导出来的话，它们就没有顺序性保障，虚拟机可以对它们进行随机地重排序。

1、程序次序规则：在一个单独的线程中，按照程序代码的执行流顺序，（时间上）先执行的操作happen—before（时间上）后执行的操作。<br>
2、管理锁定规则：一个unlock操作happen—before后面（时间上的先后顺序，下同）对同一个锁的lock操作。<br>
3、volatile变量规则：对一个volatile变量的写操作happen—before后面对该变量的读操作。<br>
4、线程启动规则：Thread对象的start（）方法happen—before此线程的每一个动作。<br>
5、线程终止规则：线程的所有操作都happen—before对此线程的终止检测，可以通过Thread.join（）方法结束、Thread.isAlive（）的返回值等手段检测到线程已经终止执行。<br>
6、线程中断规则：对线程interrupt（）方法的调用happen—before发生于被中断线程的代码检测到中断时事件的发生。<br>
7、对象终结规则：一个对象的初始化完成（构造函数执行结束）happen—before它的finalize（）方法的开始。<br>
8、传递性：如果操作A happen—before操作B，操作B happen—before操作C，那么可以得出A happen—before操作C。

### 操作A在时间上先与操作B发生，是否意味着操作A happen—before操作B？

在多线程模型中，若A与B操作在分别的线程中调用。虽然A在时间上比B先发生，在没有同步的情况下，由于线程调度等原因，A是有可能在B后执行的。 这点相信大家都知道。

### 操作A happen—before操作B，是否意味着操作A在时间上先与操作B发生？

``` java
x = 1; //操作A
y = 2; //操作B
```

在上面的代码中，由于happen-before规则第一条，操作A happen—before 操作B。

但是由于编译器的指令重排序（Java语言规范规定了JVM线程内部维持顺序化语义，也就是说只要程序的最终结果等同于它在严格的顺序化环境下的结果，那么指令的执行顺序就可能与代码的顺序不一致。这个过程通过叫做指令的重排序。令重排序存在的意义在于：JVM能够根据处理器的特性（CPU的多级缓存系统、多核处理器等）适当的重新排序机器指令，使机器指令更符合CPU的执行特点，最大限度的发挥机器的性能。在没有同步的情况下，编译器、处理器以及运行时等都可能对操作的执行顺序进行一些意想不到的调整）等原因，操作A在时间上有可能后于操作B被处理器执行，但这并不影响happen—before原则的正确性。
即：y = 2；先被执行了， x = 1，后被执行。这也不影响什么。都一样给xy赋值了。

 因此，”一个操作happen—before另一个操作“并不代表”一个操作时间上先发生于另一个操作“。


### 从happen—before分析DCL

``` java
public class Singleton {

    private static Singleton instance;
    public int num；
    private Singleton() {
       num = 100；
    }

    public static Singleton getInstanceSingleton() {
        if (instance == null) {                              //1
            synchronized (Singleton.class) {                 //2
                if (instance == null) {                      //3
                    instance = new Singleton();              //4
                }
            }
        }
        return instance;
    }
}
```

我们采用DCL，即双重检查加锁（Double Check Lock）的方法来实现单列模式。

从上面看，与标准的DCL其实漏了一个`volatile`，为什么呢？ 等会说。我们先看不加`volatile`会发生什么。

假设现在有2个线程A和B同时间调用了获取这个单列的方法。getInstanceSingleton几乎同时执行。<br>
假设线程A执行到instance = new LazySingleton()这句，这里看起来是一句话，但实际上它并不是一个原子操作，我们只要看看这句话被编译后在JVM执行的对应汇编代码就发现，这句话被编译成8条汇编指令，大致做了3件事情：

1.给LazySingleton的实例分配内存。<br>
2.初始化LazySingleton()的构造器 <br>
3.将instance对象指向分配的内存空间（注意到这步instance就非null了）<br>

但这三件事情中，第二和第三步的顺序是不一定顺序执行的，在指令的重排序下，我们的操作顺序会发生颠倒。即：有可能是先将instance对象指向该空间，再去执行初始化构造器的工作。那这就危险了，若A线程先执行了3步骤，在2步骤还没走之前，B线程开始执行，这个时候instance ！= null了。 它认为已经拿到了该单列，这个时候去获取对象中的num，是未初始化的num。我们的程序便没起到单列的效果，且可能引起很多奇奇怪怪的问题。而且这种难以跟踪难以重现的错误很可能会隐藏很久。

DCL的写法来实现单例是很多技术书、教科书（包括基于JDK1.4以前版本的书籍）上推荐的写法，实际上是不完全正确的。这时候我们再看 volatile 的作用，对于`volatile`的变量。volatile的其中一条语义：禁止指令重排序。这样在使用`instance`时候，便不会出现上述重排序引起的问题了。



----------
本文作者：Anderson/Jerey_Jobs

博客地址   ： [夏敏的博客/Anderson大码渣/Jerey_Jobs][1] <br>
简书地址   :  [Anderson大码渣][2] <br>
github地址 :  [Jerey_Jobs][4]



[1]: http://jerey.cn/
[2]: http://www.jianshu.com/users/016a5ba708a0/latest_articles
[3]: http://blog.csdn.net/jerey_jobs
[4]: https://github.com/Jerey-Jobs
