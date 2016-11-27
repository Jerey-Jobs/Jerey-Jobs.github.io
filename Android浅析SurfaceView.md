---
title: Android浅析SurfaceView
---


 - ### 为什么要用SurfaceView
我们知道使用它可以做一些简单的动画效果。它通过不断循环的执行View.onDraw方法，每次执行都对内部显示的图形做一些调整，我们假设onDraw方法每秒执行20次，这样就会形成一个20帧的补间动画效果。但是现实情况是你无法简单的控制View.onDraw的执行帧数，这边说的帧数是指每秒View.onDraw方法被执行多少次，这是为什么呢？首先我们知道，onDraw方法是由系统帮我们调用的，我们是通过调用View的invalidate方法通知系统需要重新绘制View，然后它就会调用View.onDraw方法。这些都是由系统帮我们实现的，所以我们很难精确去定 义View.onDraw的执行帧数，这个就是为什么我们这边要了解SurfaceView了，它能弥补View的一些不足。

 - ### SurfaceView与View有什么不同？
对于一个View的onDraw方法，不能从后台线程修改一个GUI元素。
当需要快速地更新View的UI，或者当渲染代码阻塞GUI线程的时间过长的时候，SurfaceView就是解决上述问题的最佳选择。 SurfaceView封装了一个Surface对象，而不是Canvas。这一点很重要，因为Surface可以使用后台线程绘制。对于那些资源敏感的操作，或者那些要求快速更新或者高速帧率的地方，例如，使用3D图形，创建游戏，或者实时预览摄像头

 - ### 让我们来看一看Google文档
 Provides a dedicated drawing surface embedded inside of a view hierarchy. You can control the format of this surface and, if you like, its size; the SurfaceView takes care of placing the surface at the correct location on the screen

The surface is Z ordered so that it is behind the window holding its SurfaceView; the SurfaceView punches a hole in its window to allow its surface to be displayed. The view hierarchy will take care of correctly compositing with the Surface any siblings of the SurfaceView that would normally appear on top of it. This can be used to place overlays such as buttons on top of the Surface, though note however that it can have an impact on performance since a full alpha-blended composite will be performed each time the Surface changes.

The transparent region that makes the surface visible is based on the layout positions in the view hierarchy. If the post-layout transform properties are used to draw a sibling view on top of the SurfaceView, the view may not be properly composited with the surface.

Access to the underlying surface is provided via the SurfaceHolder interface, which can be retrieved by calling getHolder().

The Surface will be created for you while the SurfaceView's window is visible; you should implement surfaceCreated(SurfaceHolder) and surfaceDestroyed(SurfaceHolder) to discover when the Surface is created and destroyed as the window is shown and hidden.

One of the purposes of this class is to provide a surface in which a secondary thread can render into the screen. If you are going to use it this way, you need to be aware of some threading semantics:

All SurfaceView and SurfaceHolder.Callback methods will be called from the thread running the SurfaceView's window (typically the main thread of the application). They thus need to correctly synchronize with any state that is also touched by the drawing thread.
You must ensure that the drawing thread only touches the underlying Surface while it is valid -- between SurfaceHolder.Callback.surfaceCreated() and SurfaceHolder.Callback.surfaceDestroyed().

这段话的意思是：

> SurfaceView是视图(View)的继承类，这个视图里内嵌了一个专门用于绘制的Surface。你可以控制这个Surface的格式和尺寸。Surfaceview控制这个Surface的绘制位置。 
        surface是纵深排序(Z-ordered)的，这表明它总在自己所在窗口的后面。surfaceview提供了一个可见区域，只有在这个可见区域内 的surface部分内容才可见，可见区域外的部分不可见。surface的排版显示受到视图层级关系的影响，它的兄弟视图结点会在顶端显示。这意味者 surface的内容会被它的兄弟视图遮挡，这一特性可以用来放置遮盖物(overlays)(例如，文本和按钮等控件)。注意，如果surface上面 有透明控件，那么它的每次变化都会引起框架重新计算它和顶层控件的透明效果，这会影响性能。 
        你可以通过SurfaceHolder接口访问这个surface，getHolder()方法可以得到这个接口。
        surfaceview变得可见时，surface被创建；surfaceview隐藏前，surface被销毁。这样能节省资源。如果你要查看 surface被创建和销毁的时机，可以重载surfaceCreated(SurfaceHolder)和 surfaceDestroyed(SurfaceHolder)。
        surfaceview的核心在于提供了两个线程：UI线程和渲染线程。这里应注意：
        1> 所有SurfaceView和SurfaceHolder.Callback的方法都应该在UI线程里调用，一般来说就是应用程序主线程。渲染线程所要访问的各种变量应该作同步处理。 
        2> 由于surface可能被销毁，它只在SurfaceHolder.Callback.surfaceCreated()和 SurfaceHolder.Callback.surfaceDestroyed()之间有效，所以要确保渲染线程访问的是合法有效的surface。

 ----------
 ### 谢谢大家阅读，如有帮助，来个喜欢或者关注吧！

 ----------
 本文作者：Anderson/Jerey_Jobs

 简书地址：[Anderson大码渣][1]

 github地址：[Jerey_Jobs][2]
  [1]: http://www.jianshu.com/users/016a5ba708a0/latest_articles
  [2]: https://github.com/Jerey-Jobs
