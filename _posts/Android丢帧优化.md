---
title: 2020年，Android进入了高帧数时代！
tags:
  - Android
grammar_cjkRuby: true
catalog: true
layout:  post
header-img: "img/miui-fast.png"
preview-img: "/img/time.png"
categories: Android
date: 2020-03-03
---

随着2020年战火的开启，各大厂商都发布了高帧数手机，Android手机正式进入了高帧率时代，在这个新的时代下，手机的每帧时间都变了，手机会变得特别顺滑，同时也给我们带来了新的挑战，卡顿优化需要做到极致，手机都如此顺滑，我们的应用自然不能拖后腿，如何优化我们的应用，解决丢帧卡顿问题再次回到了我们面前。

### 何为丢帧？

丢帧行为就是我们的界面帧数小于系统规定的值，（比如一般Android手机为60帧），此时发生了丢帧行为。从完美代码的角度，凡是帧数低于60帧的都是丢帧，而一般丢那么一两帧用户是几乎无感知的，比如电影，其实帧数只有24帧，用户也觉得不卡，那是因为每帧之间的延迟是稳定的，用户也不会有明显感觉。

从工程的角度，当我们的应用在规定时间内无法完成绘制，即发生丢帧。
如下图所示，在60帧的手机上，没有在16.7ms下次VSYNC信号到来之前完成绘制数据的填充，即发生了丢帧行为：

![](/img/frameloss/16ms.png)

当然，在这个全新的时代，已经不是16ms了, 而是11ms、8.3ms了。

![小米10 90帧手机trance](/img/frameloss/mi10.png)

### VSYNC信号与屏幕刷新原理

大学学过单片机LCD驱动，或者Linux底层知识的同学应该听说错这个单词- VSYNC。 依稀记得那节课我第一次听说了DMA(Direct Memory Access，直接内存存取) 这个词。

我们的显示屏显示图像，是一个像素一个像素绘制的，显示屏与CPU（亦或者是单片机）通信都有其时钟同步信号，如像素绘制时钟同步信号 VCLK，行同步信号HSYNC，以及帧同步信号 VSYNC。而我们上面所说的VSYNC，就是我们手机发送给显示屏驱动器的时钟信号，60帧的手机16ms来一次，这样一秒就是刷新60次，就是60帧。

![vsync](/img/frameloss/vsync.png)

为什么要提DMA，即发送了LCD会去我们的内存某个区域去取一帧的数据显示到屏幕上，这是直接从内存获取的，这个过程是DMA，如果此时我们同时在改变这个buffer的数据，LCD又在来取数据，就会容易出现图像撕裂的现象(来自不同的两帧数据发生重叠)。

#### 双缓冲机制

为了解决单缓冲带来的撕裂甚至闪屏的不良体验，常见的计算机系统都引入了双显示缓冲机制。

系统底层开辟两个缓冲区，一个Buffer用来屏幕显示，另一个用来图形合成。如图：

![DoubleBufferDislpay](/img/frameloss/DoubleBufferDislpay.png)

屏幕上显示BufferA的时候，系统会在BufferB构建新的帧。若B完成了，新的VSYNC信号来的时候，就会显示缓冲区B的数据，同时重新构建缓冲区A的数据。

这样看上去没有什么问题，但是我们程序总不是理想状态工作的，由于各种原因，我们的填充时间变长了。绘制下一帧的时间超过了16ms，那么下一次VSYNC系统来临的时候，由于我们的数据没有准备好，系统只有显示之前缓冲区的数据了，发生了丢帧的情况，即为Jank

![DoubleBufferDislpay-丢帧](/img/frameloss/jank.png)


#### 更多的避免丢帧方案
- Android的三重缓冲机制
      即Android系统再增加一个缓冲BufferC，当A与B都被锁定着的时候，用C作为Buffer，因为数据填充CPU与GPU是流水线式的，当display占用一个Buffer，GPU也占用一个Buffer的时候，如果CPU此时是空闲的，可以使用BufferC进行下一帧的计算。
- VSYNC信号延迟绘制机制
      在VSYNC信号到来之时，延迟2ms再让显示器去读取Buffer里的数据，这样放宽填充时间，使得Jank率降低

系统优化丢帧的方案有很多，不过作为应用方，我们需要自己从源头上解决问题，了解完系统的显示原理后，我们开始着手应用优化方案

### 优化我们的App

引起应用卡顿的常见原因：

##### 过度绘制

过度绘制是引起我们无法在16ms内完成数据buffer准备的原因之一. 因为布局层数过多,可能导致我们的界面被重复绘制了五六次, 或者更多.

- 开启GPU过度绘制调试工具
1.点击进入“设置”；
2.点击进入“开发者选项”
3.选中“调试GPU过度绘制”
4.选中“显示过度绘制区域”

![](/img/frameloss/overdraw.png)

1.原色 – 没有被过度绘制 – 这部分的像素点只在屏幕上绘制了一次。
2.蓝色 – 1次过度绘制– 这部分的像素点只在屏幕上绘制了两次。
3.绿色 – 2次过度绘制 – 这部分的像素点只在屏幕上绘制了三次。
4.粉色 – 3次过度绘制 – 这部分的像素点只在屏幕上绘制了四次。
5.红色 – 4次过度绘制 – 这部分的像素点只在屏幕上绘制了五次。

我们可以根据界面的显示,优化我们的布局层次, 目标就是不要出现粉色和红色的!

- 合理的选择布局, 比如不要多层LinearLayout嵌套, 使用ViewStub等
- 去掉不必要的背景 onDraw第一步就会去drawBackuground

##### UI线程的耗时操作
HWUI呈现模式分析


##### 频繁GC



### 排查卡顿
Trace大法,即

1. TraceView
2. SystemTrace

    命令：
    python ~/software/android-sdk/android-sdk_r24.4.1-linux/android-sdk-linux/platform-tools/systrace/systrace.py -t 4 -o xiamin2.html  camera hal freq sched gfx input view wm am sm audio video res dalvik ss idle irq sync workq memreclaim binder_driver binder_lock ion pagecache



### 监控卡顿
