---
title: 简单说说ART和Dalvik区别
tags: Android
header-img: "img/post-bg-android.jpg"
preview-img: "img/preview/artjvm.png"
grammar_cjkRuby: true
catalog: true
layout:  post
---

### 什么是Dalvik？

Dalvik是Google公司自己设计用于Android平台的虚拟机。

Dalvik虚拟机是Google等厂商合作开发的Android移动设备平台的核心组成部分之一。<br>
它可以支持已转换为 .dex格式的Java应用程序的运行，.dex格式是专为Dalvik设计的一种压缩格式，适合内存和处理器速度有限的系统。

Dalvik 经过优化，允许在有限的内存中同时运行多个虚拟机的实例，并且每一个Dalvik 应用作为一个独立的Linux 进程执行。独立的进程可以防止在虚拟机崩溃的时候所有程序都被关闭。<br>
很长时间以来，Dalvik虚拟机一直被用户指责为拖慢安卓系统运行速度不如IOS的根源。<br>
2014年6月25日，Android L 正式亮相于召开的谷歌I/O大会，Android L 改动幅度较大，谷歌将直接删除Dalvik，代替它的是传闻已久的ART。

### Dalvik和JVM有啥关系？

主要区别：

Dalvik是基于寄存器的，而JVM是基于栈的。<br>
Dalvik运行dex文件，而JVM运行java字节码<br>
自Android 2.2开始，Dalvik支持JIT（just-in-time，即时编译技术）。<br>
优化后的Dalvik较其他标准虚拟机存在一些不同特性:　<br>
1.占用更少空间　
2.为简化翻译，常量池只使用32位索引　　
3.标准Java字节码实行8位堆栈指令,Dalvik使用16位指令集直接作用于局部变量。局部变量通常来自4位的“虚拟寄存器”区。这样减少了Dalvik的指令计数，提高了翻译速度。　

　当Android启动时，Dalvik VM 监视所有的程序（APK），并且创建依存关系树，为每个程序优化代码并存储在Dalvik缓存中。Dalvik第一次加载后会生成Cache文件，以提供下次快速加载，所以第一次会很慢。
　
　Dalvik解释器采用预先算好的Goto地址，每个指令对内存的访问都在64字节边界上对齐。这样可以节省一个指令后进行查表的时间。为了强化功能, Dalvik还提供了快速翻译器（Fast Interpreter）。

一般来说,基于堆栈的机器必须使用指令才能从堆栈上的加载和操作数据,因此,相对基于寄存器的机器，它们需要更多的指令才能实现相同的性能。但是基于寄存器机器上的指令必须经过编码,因此,它们的指令往往更大。

Dalvik虚拟机既不支持Java SE 也不支持Java ME类库(如：Java类,AWT和Swing都不支持)。 相反,它使用自己建立的类库（Apache Harmony Java的一个子集）。

### 什么是ART？

即Android Runtime

ART 的机制与 Dalvik 不同。在Dalvik下，应用每次运行的时候，字节码都需要通过即时编译器（just in time ，JIT）转换为机器码，这会拖慢应用的运行效率，而在ART 环境中，应用在第一次安装的时候，字节码就会预先编译成机器码，使其成为真正的本地应用。这个过程叫做预编译（AOT,Ahead-Of-Time）。这样的话，应用的启动(首次)和执行都会变得更加快速。

#### ART有什么优缺点呢？

- 优点：

1.系统性能的显著提升。
2.应用启动更快、运行更快、体验更流畅、触感反馈更及时。
3.更长的电池续航能力。
4.支持更低的硬件。

- 缺点：

1.机器码占用的存储空间更大，字节码变为机器码之后，可能会增加10%-20%（不过在应用包中，可执行的代码常常只是一部分。比如最新的 Google+ APK 是 28.3 MB，但是代码只有 6.9 MB。）
2.应用的安装时间会变长。

tips：现在智能手机大部分都可以让用户选择使用Dalvik还是ART模式。当然默认还是使用Dalvik模式。

用法：设置-辅助功能-开发者选项（开发人员工具）-选择运行环境（不同的手机设置的步骤可能不一样）。

 ----------

### 谢谢大家阅读，如有帮助，来个喜欢或者关注吧！

 ----------
 本文作者：Anderson/Jerey_Jobs

 博客地址   ： [夏敏的博客/Anderson大码渣/Jerey_Jobs][1] <br>
 简书地址   :  [Anderson大码渣][2] <br>
 CSDN地址   :  [Jerey_Jobs的专栏][3] <br>
 github地址 :  [Jerey_Jobs][4]



  [1]: http://jerey.cn/
  [2]: http://www.jianshu.com/users/016a5ba708a0/latest_articles
  [3]: http://blog.csdn.net/jerey_jobs
  [4]: https://github.com/Jerey-Jobs
