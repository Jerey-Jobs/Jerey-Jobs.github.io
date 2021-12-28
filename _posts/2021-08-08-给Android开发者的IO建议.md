---
title: 给 Android 开发者的IO建议
subtitle: "新时代Android存储知识"
tags:
  - Android
grammar_cjkRuby: true
catalog: true
layout:  post
header-img: "img/miui-fast.png"
preview-img: "/img/time.png"
categories: Android
date: 2021-08-08
---

## 性能优化容易忽视的点：IO
Android开发者都知道, 在主线程进行磁盘IO也会造成卡顿, 这点Android官方确没有强制限制, 全凭开发者“自觉”, 而Android官方也在不断的进行文件系统的“优化”与“改造”, 在平时的ANR以及卡顿分析中，发现很多耗时都因为主线程的IO，为此，IO知识为平时开发必须学习的内容。

从其他角度来看，即使非Android开发者，也需要注意IO带来的影响。因为往往IO的耗时是不受重视的，其也往往能成为整个程序性能的瓶颈，因此我们在设计程序架构的时候，需要更多考虑IO的影响。（Android 在主线程Inflate布局这种设计，就是不是一个优秀的设计，为此后面Google也一直在想取消掉xml布局这个事情，或者异步加载布局等）

## IO背景知识

写出高效的IO，需要明白一次IO都发生了什么。


### IO流程
一次write的过程，从应用层出发，到达真正的写入磁盘需要经历以下的流程。（以下是Linux 通用的 I/O 架构模型，Android系统在其上又增加了诸多修改，在不正确的调用情况下，每个层级的调用都可能存在性能问题）

![IO架构模型](/img/io/androidwrite.png)

#### **VFS**

write数据，首先会到达这一层。

Linux为了支持多种文件系统，添加了一个VFS层，通过VFS层进行数据结构抽象，来将文件操作请求转发给具体的文件系统。

在日常开发中，写入文件到不同的文件夹从开发者角度并没有感觉到不同，大家通常都会封装一个方法，不同的文件夹只是不同的路径的区别。而实际上，在底层，有可能是不同的文件系统。如：应用内部存储（data/data） 与 外部存储（external对应的文件夹）一般情况都不是同一种文件系统。通过系统层将不同的底层硬件的差异进行差分处理，然后封装统一的接口提供给应用层开发调用，这就是VFS的意义。


#### **具体文件系统**
这里指的就是不同的具体文件系统实现了，每个文件系统都有其自己的特性，常见的文件系统有：EXT2，EXT4，F2FS，NTFS等。这一层关注的是具体文件系统优化，也就是更高效的索引，读取性能等。

在经过系统的VFS映射后，我们的write数据会到达具体的文件系统层。但即使这样，我们也不会直接写到磁盘中。因为有page的存在，我们正常使用的都是`缓冲式IO（标准IO）`

如何查看我们目录对应的具体文件系统?<br>
`adb shell mount`


#### **Page Cache**
PageCache是内存中的一块区域,这样做的好处是,在写入的时候不直接写入硬盘,而是写入内存pages中，稍后写入硬盘。（由多个变量条件控制何时写入，如空闲内存低于某个阈值，pages驻留时间超时等）

在读取数据时候也一样，首先到page cache中查找(page cache中的每一个数据块都设置了文件以及偏移信息)，如果未命中，则启动磁盘I/O，将磁盘文件中的数据块加载到page cache中的一个空闲块。之后再copy到用户缓冲区中。

PageCache的出现，可以降低磁盘 I/O 的次数，在频繁读写的场景中，会带来较大的性能提升。

这种Page cache的缓存IO也有其缺点：数据在传输过程中需要进行多次copy，带来了较大的额外CPU和内存开销

#### **Disk**
 磁盘指具体硬件设备。系统通过驱动程序操作磁盘。磁盘一般分为：机械硬盘 与 固态硬盘.我们的业务的磁盘性能一般由硬件性能决定（磁盘碎片也会对性能产生一定的影响）

![闪存颗粒](/img/io/flash.png)

### 闪存介绍（Flash）
闪存属于Disk的一种，但闪存的类型分为很多种，从结构上主要能够分为AND、NAND、NOR、DiNOR等一些类型，在这之中，NAND和NOR是我们目前为止在手机中最为常见的使用的类型 (在这之前存储用 EEPROM ，单片机书上提过这个东西， flash属于这广义的EEPROM一种)

#### **NOR Flash**

`NOR Flash 最大的特点是可以直接在芯片内运行代码，这样不需要把代码读取到RAM中在运行。也就是它既能像ram一样工作，又能像flash一下擦写，这一特性使其拥有很多应用场景`

 苹果的AirPods就是使用了Nor FLash，该器件由国内的`兆易创新`供应。

 Intel于1988年首先开发出NOR flash技术。NOR Flash擦写速度慢，成本高等特性，NOR Flash 主要应用于小容量、内容更新少的场景，例如 PC 主板 BIOS、路由器系统存储等。

 但对于大存储容量，以及考虑成本的情况下NAND flash往往是更优的方案。

#### **NAND Flash**
相比于 NOR Flash，NAND Flash 写入性能好，大容量下成本低。目前，绝大部分手机和平板等移动设备中所使用的 eMMC 内部的 Flash Memory 都属于 NAND Flash

![ufs](/img/io/ufs3.png)

#### 什么是EMMC和UFS
EMMC就相当于是一个Nand Flash加上一个控制器。即：这个flash的操作由卖Flash的厂商给全包了（有点像总成的意思），其他厂商负责业务就行。同样，后续的UFS2.1 UFS3.0 UFS3.1 也都是这么个概念。只不过是随着硬件与软件的进步，我们的存储速度越来越快。

闪存基本构成是由:页page(4K)→块block(通常64个page组成一个block,有的是128个)。而闪存还有个特点，就是无法覆盖写，已经有数据的地方写入必须先擦除，擦除完再次写入。因此一开始在使用的过程中，都会优先写入没有数据的地方。等用了过了一阵子，就会发现手机变卡了。这里面有一部分就是这个擦除导致。

![擦写流程](/img/io/flash_pages.png)

这里还有一个致命的问题，NAND Flash可以写page，但是无法擦除page，需要直接擦除block。如果系统中没有空闲的page写了，必须整理出一个空间进行写入，那么这次写入需要消耗的时间远超出想象。也就是：为什么手机只剩1G存储空间了，就会特别卡

这便是`写入放大`,一次写入的实际写入数量超出本次写入数据的很多倍。

从本质上来讲，我们很难解决写入放大现象，比较好的一个方案是整理磁盘碎片，比如在用户睡眠+充电的情况下，进行整理。而作为开发者，我们只能接受存在这种情况的可能，也就是难以避免IO的异常耗时，但这必须引起我们的重视，主线程尽量不要IO。

<font color=red>一个小小的IO写入，并不一定像你在测试机上看到的或者测试到的那么流畅。有些用户用着你写的程序可能非常容易出现ANR。</font>

## 了解Android文件系统
Android的文件系统,由于各目录的需求不一样，如应用的私有数据需要绝对安全，如部分目录需要作为公共目录供各个应用读写。因此在实现上，也使用了不同的文件系统方案。

Android系统从应用层角度来看分为：
- 内部存储空间，即`data/data` 目录下的应用文件夹
- 外部存储空间，即`sdcard` 或者称之为 `/storage/emulated/{userID}` 下的文件夹
（根目录下的`sdcard` 只是一个软链接）

下面我们从这两个分类分析下这两个存储空间的区别。

### 内部存储空间（data/data）沙盒原理

内部存储空间的设计希望严控沙盒机制，即：每个应用都只能访问自己的文件夹，且该文件夹会随着应用的卸载而删除。

那么从设计角度来说，data分区下, 挂载能够管控权限的文件系统即可, 如:使得应用与应用间不能互相访问文件,即实现data/data下的沙盒机制, 此时可以使用owner与group均为应用自己即可. 这样应用间无法访问文件. 大家可以找一个root过的手机；

> adb shell ls -al data/data

可以看到如下的文件信息，文件夹权限通过uid来管控，每个文件夹的权限都是 `700` 这也就是Android 系统上应用间数据无法共享访问的原理。除了root用户，其他用户都无权限访问（甚至部分root用户因为SE权限的设定，也无法访问该目录）

![ls -al ](/img/io/ls-al.png)

如果希望其他第三方应用能够访问应用内数据，可以使用`FileProvider` 或者索性将数据写入到sdcard中。

### 外部存储空间下的权限管理

sdcard分区下, 也需要一个管理应用访问权限的系统,在Android R之前, 用的sdcardfs, 在这之后，用的是f2fs+Fuse.

让我们在android 11的手机上敲下： adb shell mount 看下各个目录的挂载情况。

> /dev/fuse on /storage/emulated type fuse (rw,lazytime,nosuid,nodev,noexec,noatime,user_id=0,group_id=0,allow_other)
>
> /data/media on /storage/emulated/0/Android/data type sdcardfs (rw,nosuid,nodev,noexec,noatime,fsuid=1023,fsgid=1023,gid=1015,multiuser,mask=6,derive_gid,default_normal,unshared_obb)

我们可以得到结论：
/storage/emulated/0/Android/data  也就是平时大家用的 'getExternalFilesDir' 在Android R上其文件系统为：f2fs （这个目录在Android Q上是 sdcardfs）

如果我们对f2fs与sdcardfs 读写测试，会得到以下结论：f2fs在文件创建效率方面相比于sdcardfs会快的多。因此<font color=red>在Android R上，此区域的IO性能其实是得到了增强的。</font>

sdcard的情况比较特殊，在Android R之前，使用Google的sdcardfs对目录进行权限管理。

> 注：sdcardfs实现的较为简单，而且有其弊端，在深层次目录的大量文件情况下，IO效率下降非常厉害，直接使用 f2fs 没有这个问题

adb shell ls -al /sdcard/Android/data
adb shell ls -al /sdcard/


从上面的分析，可以得出结论是，开发者应用尽量减少IO的使用，或者说：非必要不写IO，能够内存中解决的，在内存中完成即可。如果实在需要IO，我们应尝试以下办法。

## 降低主线程IO
- 持久化 key-value
在开发中，我们经常需要本地存储下一些持久化的记录，同时这些记录可能需要不断的存到本地。 甚至有些情况，我们需要多进程访问这一个值。

若不需要多进程访问，常用的一个方案是使用


MMKV - https://zhuanlan.zhihu.com/p/47420264


- 加载布局文件的IO


- 加载本地图片的IO


## 避免主线程IO的痛苦
- 持久化 key-value
在开发中，我们经常需要本地存储下一些

MMKV - https://zhuanlan.zhihu.com/p/47420264


- 加载布局文件的IO


- 加载本地图片的IO


## 为了解决IO的耗时，大家都做了哪些？
- 类加载耗时
zipAlign

-


---
-- 夏敏，写于2021年末 <br>
-- 感谢我的爱人李白云女士对我一直以来的支持。
