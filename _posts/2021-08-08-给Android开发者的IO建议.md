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
相信Android开发者都知道, 主线程不能进行网络操作, Android 4.0之前其实是可以操作的, 然而在主线程进行网络IO会带来卡顿问题, 因此Google在StrickMode中增加了一个主线程网络操作的检测, 抛出:NetworkOnMainThreadException异常. 

相比于网络IO, 其实在主线程进行磁盘IO也会造成卡顿, 这点Android官方确没有强制限制,全凭开发者自觉, 而Android官方也在不断的进行文件系统的“优化”与“改造”, 掌握Android的IO知识对于我们的卡顿/性能优化很重要.

## IO背景知识
### IO发生了什么
一次write的过程，从应用层出发，到达真正的写入磁盘需要经历以下的流程。（以下是Linux 通用的 I/O 架构模型，Android系统在其上又增加了诸多修改，在不正确的调用情况下，每个层级的调用都可能存在性能问题）

![IO架构模型](/img/io/androidwrite.png)

#### **VFS**
Linux为了支持多种文件系统，添加了一个VFS层，通过VFS层进行数据结构抽象，来将文件操作请求转发给具体的文件系统。

在日常开发中，写入文件到不同的文件夹从开发者角度并没有感觉到不同，大家通常都会封装一个方法，不同的文件夹只是不同的路径的区别。而实际上，在底层，有可能是不同的文件系统。如：应用内部存储（data/data） 与 外部存储（external对应的文件夹）一般情况都不是同一种文件系统。通过系统层将不同的底层硬件的差异进行差分处理，然后封装统一的接口提供给应用层开发调用，这就是VFS的意义。

#### **文件系统**
这里指的就是不同的具体文件系统实现了，每个文件系统都有其自己的特性，常见的文件系统有：EXT2，EXT4，F2FS，NTFS等。这一层关注的是具体文件系统优化，也就是更高效的索引，读取性能等。

#### **Page Cache**
PageCache是内存中的一块区域,这样做的好处是,在写入的时候不直接写入硬盘,而是写入内存,可以加速读写。内核在处理文件I/O请求时，首先到page cache中查找(page cache中的每一个数据块都设置了文件以及偏移信息)，如果未命中，则启动磁盘I/O，将磁盘文件中的数据块加载到page cache中的一个空闲块。之后再copy到用户缓冲区中。

PageCache的出现，能够很好的降低磁盘 I/O 的次数，在频繁读些的情况下，能够有较大的性能提升。

#### **Disk**
 磁盘就是具体硬件设备了。系统通过驱动程序操作一个磁盘的方式。磁盘一般分为：机械硬盘 与 固态硬盘.我们的业务的磁盘性能一般由硬件性能决定（磁盘碎片也会对性能产生一定的影响）

![闪存颗粒](/img/io/flash.png)

### 闪存介绍（Flash）
闪存属于Disk的一种，但闪存的类型分为很多种，从结构上主要能够分为AND、NAND、NOR、DiNOR等一些类型，在这之中，NAND和NOR是我们目前为止在手机中最为常见的使用的类型，这也就是底层驱动人员经常提到的 NAND Flash与 NOR Flash。

#### **NOR Flash**
NOR Flash擦写速度慢，成本高等特性，NOR Flash 主要应用于小容量、内容更新少的场景，例如 PC 主板 BIOS、路由器系统存储等

#### **NAND Flash** 
相比于 NOR Flash，NAND Flash 写入性能好，大容量下成本低。目前，绝大部分手机和平板等移动设备中所使用的 eMMC 内部的 Flash Memory 都属于 NAND Flash

![ufs](/img/io/ufs3.png)

#### 那么EMMC和UFS是什么呢？
EMMC就相当于是一个Nand Flash加上一个控制器。即：这个flash的操作由卖Flash的厂商包圆了，其他厂商负责业务就行。同样，后续的UFS2.1 UFS3.0 UFS3.1 也都是这么个概念。只不过有个特点是：没有最快，只有更快

闪存基本构成是由:页page(4K)→块block(通常64个page组成一个block,有的是128个)。而闪存还有个特点，就是无法覆盖写，已经有数据的地方写入必须先擦除，擦除完再次写入。因此一开始在使用的过程中，都会优先写入没有数据的地方。等用了过了一阵子，就会发现手机变卡了。这里面有一部分就是这个擦除导致。

这里还有一个致命的问题，NAND Flash可以写page，但是无法擦除page，需要直接擦除block。如果系统中没有空闲的page写了，必须整理出一个空间进行写入，那么这次写入需要消耗的时间远超出想象。也就是：为什么我的手机只剩1G存储空间了，就会特别卡

### 那作为开发者，我们需要意识到的问题是，一个小小的IO写入，并不一定像你在测试机上看到的那么流畅。有些用户用着你写的程序可能卡的很，非常容易ANR。


## 通过了解Android文件系统写出高效的IO
Android的文件系统,由于各目录的需求不一样，如应用的私有数据需要绝对安全，如部分目录需要作为公共目录供各个应用读写。因此在实现上，也使用了不同的文件系统方案。

### data目录沙盒原理

data分区下, 挂载能够管控权限的文件系统即可, 如:使得应用与应用间不能互相访问文件,即实现data/data下的沙盒机制, 此时可以使用owner与group均为应用自己即可. 这样应用间无法访问文件. 大家可以找一个root过的手机； adb shell ls -al data/data

可以看到如下的文件信息，这也就是为啥一个应用无法访问另一个应用的文件夹的原理，除了root用户，system用户也都没权限访问。

![ls -al ](/img/io/ls-al.png)


sdcard分区下, 也需要一个管理应用访问权限的系统,在Android R之前, 用的sdcardfs, 在这之后，用的是f2fs+Fuse. 

让我们在android 11的手机上敲下： adb shell mount 看下各个目录的挂载情况。

> /dev/fuse on /storage/emulated type fuse (rw,lazytime,nosuid,nodev,noexec,noatime,user_id=0,group_id=0,allow_other)
> 
> /data/media on /storage/emulated/0/Android/data type sdcardfs (rw,nosuid,nodev,noexec,noatime,fsuid=1023,fsgid=1023,gid=1015,multiuser,mask=6,derive_gid,default_normal,unshared_obb)

我们可以得到结论：
/storage/emulated/0/Android/data  也就是平时大家用的 'getExternalFilesDir' 在Android R上其文件系统为：f2fs （这个目录在Android Q上是 sdcardfs）

如果我们对f2fs与sdcardfs 读写测试，会得出结论：f2fs在文件创建效率方面相比于sdcardfs会快的多。因此在Android R上，此区域的IO性能其实是得到了增强的。

### sdcard路径下的权限管理

adb shell ls -al /sdcard/Android/data

adb shell ls -al /sdcard/





