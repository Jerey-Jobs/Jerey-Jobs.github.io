---
title: Android音频知识介绍-从AndroidRecord看起
tags:
  - 音频
  - Android
grammar_cjkRuby: true
header-img: "img/post-bg-unix-linux.jpg"
preview-img: "/img/post1/pcm-theory.png"
catalog: true
layout:  post
categories: 音频
date: 2017-08-09
---

### 前言
从一个初始化AudioRecord的构造传参看起：

``` java
        RecorderHelper.getInstance().initRecoder(
                this,
                MediaRecorder.AudioSource.MIC,  //麦克风数据
                16000,                          //采样率16k
                AudioFormat.CHANNEL_CONFIGURATION_MONO,  //单声道
                AudioFormat.ENCODING_PCM_16BIT);// 16bit的采样精度
```
上面一个初始化麦克风的调用，涉及到了很多知识，大概是大学时数字信号处理课程或者是信号与系统学的。相关觉得有必要科普一下，不然大家永远是在复制代码，遇到相关问题的时候如果不了解会一头雾水，优化效果更提不上了。

这篇文章不是用来介绍API的，介绍AndroidRecord API很简单，无非初始化然后读取。如果只是这么简单的需求，甚至这个类都用不到，直接用`MediaRecorder`即可录音等。本文主要介绍相关的参数是什么意思。比如什么是16Bit采样，什么是44100采样率。

### 简介
Google API地址
[https://developer.android.google.cn/reference/android/media/AudioRecord.html](https://developer.android.google.cn/reference/android/media/AudioRecord.html)

从网页的右上角我们可以看到，这是从API3等级开始就有的类。`AndroidRecord`是一个比`MediaRecorder`更加底层的类，根据谷歌介绍，有点相当于是直接从音频设备拉数据的意思，并且我们拿到的也直接是PCM流。

从API23开始 多了个`AudioRecord.Builder`类来帮助我们初始化`AndroidRecord`，可惜这个类还不如不用，用了我23以下的还得用老方法初始化，这不仅没优化代码，还冗余了代码。

### 构造方法
``` java
AudioRecord(int audioSource, int sampleRateInHz, int channelConfig, int audioFormat, int bufferSizeInBytes)
```

参数 | 介绍
--- | ---
audioSource | [MediaRecorder.AudioSource](https://developer.android.google.cn/reference/android/media/MediaRecorder.AudioSource.html#CAMCORDER)类里面的各种类型，有`MIC`、`VOICE_CALL`等
sampleRateInHz | 采样率，44100Hz是唯一可以工作于所有手机上的采样率，22050, 16000, and 11025 可能只有部分机型能工作,我之前就因为设置的采样率为16000导致在我的手机上工作正常，而在努比亚手机上Buffer满的时间变短导致了些问题。
channelConfig |  CHANNEL_IN_MONO 和 CHANNEL_IN_STEREO.即单声道和立体声也叫双声道，双声道可以有保证的作于所有手机上
audioFormat | ENCODING_PCM_8BIT, ENCODING_PCM_16BIT, and ENCODING_PCM_FLOAT. 有8bit，16bit，32bit的采样精度
bufferSizeInBytes | Record的内部记录缓冲区大小，可以通过getMinBufferSize(int, int, int) 方法得到。

### 什么是PCM
脉冲编码调制(Pulse Code Modulation,PCM)，这是在信号与系统里面接触过的编码格式，脉冲编码调制是数字通信的编码方式之一。主要过程是将话音、图像等模拟信号每隔一定时间进行取样，使其离散化，同时将抽样值按分层单位四舍五入取整量化，同时将抽样值按一组二进制码来表示抽样脉冲的幅值。

PCM通过抽样、量化、编码三个步骤将连续变化的模拟信号转换为数字编码
从一张图来看PCM，也可以看到什么叫采样率与采样精度。

### 什么是采样率？
 采样率又叫抽样，由于声音其实是一种能量波，因此也有频率和振幅的特征，频率对应于时间轴线，振幅对应于电平轴线。波是无限光滑的，弦线可以看成由无数点组成，由于存储空间是相对有限的，数字编码过程中，必须对弦线的点进行采样。采样的过程就是抽取某点的频率值，很显然，在一秒中内抽取的点越多，获取得频率信息更丰富，为了复原波形，一次振动中，必须有2个点的采样，人耳能够感觉到的最高频率为20kHz，因此要满足人耳的听觉要求，则需要至少每秒进行40k次采样，用40kHz表达，这个40kHz就是采样率。我们常见的CD，采样率为44.1kHz。

 44.1kHz意味着什么呢？假设我们有2段正弦波信号，分别为20Hz和20KHz，长度均为一秒钟，以对应我们能听到的最低频和最高频，分别对这两段信号进行 40KHz的采样，我们可以得到一个什么样的结果呢？结果是：20Hz的信号每次振动被采样了40K/20=2000次，而20K的信号每次振动只有2次采样。显然，在相同的采样率下，记录低频的信息远比高频的详细。这也是为什么有些音响发烧友指责CD有数码声不够真实的原因，CD的44.1KHz采样也无法保证高频信号被较好记录。要较好的记录高频信号，看来需要更高的采样率，于是有些朋友在捕捉CD音轨的时候使用48KHz的采样率，这是不可取的！这其实对音质没有任何好处，对抓轨软件来说，保持和CD提供的44.1KHz一样的采样率才是最佳音质的保证之一，而不是去提高它。较高的采样率只有相对模拟信号的时候才有用，如果被采样的信号是数字的，请不要去尝试提高采样率。

 常用的采样率为：44.1KHz与48KHz

### 什么是采样精度？

1 字节(也就是8bit) 只能记录 256 个数, 也就是只能将振幅划分成 256 个等级;
2 字节(也就是16bit) 可以细到 65536 个数, 这已是 CD 标准了;
4 字节(也就是32bit) 能把振幅细分到 4294967296 个等级, 实在是没必要了.

如果是双声道(stereo), 采样就是双份的, 文件也差不多要大一倍.

我们来看一张图就能明白：
![](/img/post1/pcm-theory.png)

上述的模拟数据模拟就好比人的声音是有振幅有频率的波，假设上面的模拟数据时长为1秒。<br>
那么采样，可以看到我们采样了10根线，那采样率就是10Hz。（44100Hz是多高自己体会）<br>
再看量化，分为了8个等级，也就是采样进度是3bit。（可以想象16bit是多么精确了）<br>
最后1秒钟的数据，被编码成了3bit×10 即30个二进制数据。

### 单声道和立体声与采样精度
对于单声道声音文件，采样数据为八位的短整数（short int 00H-FFH）；

而对于双声道立体声声音文件，每次采样数据为一个16位的整数（int），高八位(左声道)和低八位(右声道)分别代表两个声道。

### 码率计算

算一个PCM音频流的码率是一件很轻松的事情，采样率值×采样大小值×声道数bps。一个采样率为44.1KHz，采样大小为16bit，双声道的PCM编码的WAV文件，它的数据速率则为 44.1K×16×2 =1411.2 Kbps。我们常说128K的MP3，对应的WAV的参数，就是这个1411.2 Kbps，这个参数也被称为数据带宽，它和ADSL中的带宽是一个概念。将码率除以8,就可以得到这个WAV的数据速率，即176.4KB/s。这表示存储一秒钟采样率为44.1KHz，采样大小为16bit，双声道的PCM编码的音频信号，需要176.4KB的空间，1分钟则约为10.34M，这对大部分用户是不可接受的，尤其是喜欢在电脑上听音乐的朋友，要降低磁盘占用，只有2种方法，降低采样指标或者压缩。降低指标是不可取的，因此专家们研发了各种压缩方案。

### WAV文件

PCM流我们可以直接保存为文件，但是这就是PCM格式了，正常播放器都没有播放pcm的功能，我们可以把PCM转成WAV。WAV文件是一种一种无损的音频文件格式，里面还是PCM的编码，只不过是在我们原有的pcm文件上加上一个WAV规定的协议头而已。这个头是44个byte大小。所以一个0bit的pcm文件转成wav大小是44B。

因为WAV并没有进行压缩，所以WAV占用的空间是最大的。因此为了传输以及存储的需求后来人们设计了很多的音频压缩格式，mp3就是一种有损的压缩音频，至于怎么压缩的那是


----------
本文作者：Anderson/Jerey_Jobs

博客地址   ： [http://jerey.cn/](http://jerey.cn/)<br>
简书地址   :  [Anderson大码渣](http://www.jianshu.com/users/016a5ba708a0/latest_articles)<br>
github地址 :  [https://github.com/Jerey-Jobs](https://github.com/Jerey-Jobs)
