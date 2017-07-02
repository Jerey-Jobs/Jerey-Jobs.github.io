---
title: 使用ScrollView滚动事件打造动画框架ScrollAnimationSherlock
subtitle: "全xml配置动画解耦"
tags:
  - Android
grammar_cjkRuby: true
header-img: "img/pixel.jpg"
preview-img: "/img/preview/sherlockscrollanimation_preview.png"
catalog: true
layout:  post
categories: Android
date: 2017-07-02
---


--------

![1](http://upload-images.jianshu.io/upload_images/2305881-d887b10fc5fce89e.gif?imageMogr2/auto-orient/strip)

一个用来打造上述引导界面动画效果的Scroll框架, 集成进[https://github.com/Jerey-Jobs/KeepGank](https://github.com/Jerey-Jobs/KeepGank)中，作为首次启动的欢迎界面。

工程源码：[https://github.com/Jerey-Jobs/ScrollAnimationSherlock](https://github.com/Jerey-Jobs/ScrollAnimationSherlock)

目前支持：
- 透明度动画与平移动画(四种方向),支持混合调用
- 背景色渐变设置
- SherlockLinearLayout与SherlockRelativeLayout提供动画界面的线性布局与相对布局支持
- SherlockAnimationCallBack提供自定义扩展

如何使用


如何使用

project's build.gradle (工程下的 build.gradle)
``` gradle
  allprojects {
    repositories {
      ...
      maven { url 'https://jitpack.io' }
    }
  }
```

module's build.gradle (模块的build.gradle)
``` gradle
  dependencies {
          compile 'com.github.Jerey-Jobs:ScrollAnimationSherlock:1.0'
  }
```

项目中：
---
顶层布局:cn.jerey.animationlib.SherlockScrollView，内嵌一个`SherlockLinearLayout`
``` xml

    <cn.jerey.animationlib.SherlockScrollView
        android:layout_width="match_parent"
        android:layout_height="match_parent">
        <cn.jerey.animationlib.SherlockLinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:gravity="center"
            android:orientation="vertical">

            <include layout="@layout/splash_layout"></include>

        </cn.jerey.animationlib.SherlockLinearLayout>
    </cn.jerey.animationlib.SherlockScrollView>

```

`SherlockLinearLayout`的第一个子View会被默认设置为全屏，因此
```
<include layout="@layout/splash_layout"></include>
```

在`splash_layout`中完成第一个界面的搭建

这是上图的`splash_layout`


![](/img/preview/sherlockscrollanimation_preview.png)


接下来就是使用`SherlockLinearLayout`与`SherlockRelativeLayout`进行其他界面搭建。demo中使用的是`SherlockRelativeLayout`其中放置了四个子View，并设置了相应动画。

``` xml
<cn.jerey.animationlib.SherlockRelativeLayout
     android:layout_width="match_parent"
     android:layout_height="300dp">


     <ImageView
         android:id="@+id/moon"
         android:layout_width="100dp"
         android:layout_height="100dp"
         android:layout_marginLeft="30dp"
         android:layout_marginTop="30dp"
         android:background="@drawable/moon"
         app:animation_alpha="true"
         app:animation_translation="left"/>

     <ImageView
         android:id="@+id/astronaut"
         android:layout_width="50dp"
         android:layout_height="50dp"
         android:layout_marginLeft="120dp"
         android:layout_marginTop="28dp"
         android:background="@drawable/astronaut"
         app:animation_alpha="true"
         app:animation_translation="right|bottom"/>

     <ImageView
         android:id="@+id/imageView"
         android:layout_width="200dp"
         android:layout_height="180dp"
         android:layout_alignParentRight="true"
         android:layout_marginTop="100dp"
         android:background="@drawable/planet_earth_1"
         app:animation_alpha="true"
         app:animation_translation="right|bottom"/>

     <ImageView
         android:layout_width="100dp"
         android:layout_height="100dp"
         android:layout_alignParentBottom="true"
         android:layout_marginLeft="30dp"
         android:background="@drawable/rocket_1"
         app:animation_alpha="true"/>

 </cn.jerey.animationlib.SherlockRelativeLayout>

```

原理
---
总的原理一句话：赋予每个需要进行动画变换的View动画属性，并根据位置改变属性。

如何做到
---
我们需要做的事情有
1. 如何确定某个View需要进行动画变换
2. 确定后如何赋予动画属性
3. 如何分发动画变换事件，让子View进行变换

### 确定是否需要动画变换
ViewGroup的addView方法，该方法是添加子View的时候调用的。
```
 public void addView(View child, int index, ViewGroup.LayoutParams params)
```
我们需要在这边进行子View的判断，如何判断呢，我们可以参照support包的设计，添加app属性，

我们去定义几个属性
``` xml
       <attr name="animation_alpha" format="boolean" />//是否支持透明度动画；
       <attr name="animation_scaleX" format="boolean" />//是否支持X轴缩放动画；
       <attr name="animation_scaleY" format="boolean" />//是否支持Y轴缩放动画；
       <attr name="bgColorStart" format="color" />//背景渐变颜色的开始颜色值；
       <attr name="bgColorEnd" format="color" />//背景渐变颜色的结束颜色值，与bgColorStart成对出现；
       <attr name="animation_translation">//移动动画，是一个枚举类型，支持上下左右四种值。
           <flag name="left" value="0x01" />
           <flag name="top" value="0x02" />
           <flag name="right" value="0x04" />
           <flag name="bottom" value="0x08" />
       </attr>
```

在addView时候，通过layoutParams参数来判断，那么这里的LayoutParams是我们自定义的，继承于系统的LayoutParams，
不过在其构造方法时追加参数解析。

``` java
/**
 * 不能将此LayoutParams抽象出来, 其继承的是自己内部类的Params
 */
public class RelativeLayoutParams extends LayoutParams {
    //是否支持透明度；
    public boolean mAlphaSupport;
    //是否支持X Y轴缩放；
    public boolean mScaleXSupport;
    public boolean mScaleYSupport;

    //颜色变化的起始值；
    public int mBgColorStart;
    public int mBgColorEnd;
    //移动值；
    public int mTranslationValue;

    public RelativeLayoutParams(Context c, AttributeSet attrs) {
        super(c, attrs);
        TypedArray typedArray = c.obtainStyledAttributes(attrs, R.styleable.MyFrameLayout);
        mAlphaSupport = typedArray.getBoolean(R.styleable.MyFrameLayout_animation_alpha, false);
        mBgColorStart = typedArray.getColor(R.styleable.MyFrameLayout_bgColorStart, -1);
        mBgColorEnd = typedArray.getColor(R.styleable.MyFrameLayout_bgColorEnd, -1);
        mScaleXSupport = typedArray.getBoolean(R.styleable.MyFrameLayout_animation_scaleX, false);
        mScaleYSupport = typedArray.getBoolean(R.styleable.MyFrameLayout_animation_scaleY, false);
        mTranslationValue = typedArray.getInt(R.styleable.MyFrameLayout_animation_translation, -1);
        typedArray.recycle();
    }

    /**
     * 判断当前params是否包含自定义属性；
     *
     * @return
     */
    public boolean isHaveMyProperty() {
        if (mAlphaSupport || mScaleXSupport || mScaleYSupport || (mBgColorStart != -1 && mBgColorEnd != -1) || mTranslationValue != -1) {
            return true;
        }
        return false;
    }
}
```

这样我们在addView时能够拿到这个params，并且里面已经解析了是否支持动画了。

```
@Override
public void addView(View child, int index, ViewGroup.LayoutParams params) {
    RelativeLayoutParams myLayoutParams = (RelativeLayoutParams) params;
    if (myLayoutParams.isHaveMyProperty())
```

### 赋予动画变换属性

我们的View是不大可能自己动的，而且我们也没法去改view的代码。这些view都是系统的view，
这样我们只能说让view有一个父类，去操作它了。或者说。给View“伪增加”一个方法，使其接收到我们的移动事件后，能够进行动画变换。

如何增加呢？

我们在解析view的属性时，即`addView`时，在其外面包裹一层父View，我称之为 Frame。 使用FrameView去包裹它，
当然需要注意的是，为了让view能够直接完整的进行动画显示。我们需要设置各个父类的`ClipChildren`属性为false。

因此封装了`SherlockFrame`，其继承于FrameLayout，并实现我们的位移callback接口的，注意只有实现了我们的位移回调接口的。我们分发事件时才会分发。
同样，这个接口提供了自定义扩展，可以自己编写实现这个接口的自定义view，同样会接收到位移分发。

``` java
public class SherlockFrame extends FrameLayout implements SherlockAnimationCallBack{
    //从哪个方向开始动画；
    private static final int TRANSLATION_LEFT = 0x01;
    private static final int TRANSLATION_TOP = 0x02;
    private static final int TRANSLATION_RIGHT = 0x04;
    private static final int TRANSLATION_BOTTOM = 0x08;

    //是否支持透明度；
    private boolean mAlphaSupport;
    //颜色变化的起始值；
    private int mBgColorStart;
    private int mBgColorEnd;

    //是否支持X Y轴缩放；
    private boolean mScaleXSupport;
    private boolean mScaleYSupport;
    //移动值；
    private int mTranslationValue;
    //当前View宽高；
    private int mHeight, mWidth;
}
```

`SherlockFrame`的这些属性，会在addview的时候进行赋值。

`SherlockAnimationCallBack`回调`excuteanimation`方法时，`SherlockFrame`就根据自身的属性情况进行动画变换。

### 事件分发

作为scrollView，滚动事件的分发肯定是在`onScrollChanged`了。在这里面进行滚动事件分发

parseViewGroup方法有点讲究了，这是一个递归遍历子view，看其是否实现了`SherlockAnimationCallBack`接口，若没有则去判断是否是ViewGroup，若是的话则继续递归遍历其子view。

若是实现了`SherlockAnimationCallBack`接口的view。我们要根据其距离顶部的高度来计算动画应该执行百分之多少。我们可以通过view的getTop方法，这个方法是得到view距离其父view的顶部的距离。
因此我们还要进行递归传递。

``` java
@Override
protected void onScrollChanged(int l, int t, int oldl, int oldt) {
    super.onScrollChanged(l, t, oldl, oldt);
    parseViewGroup(mLinearLayout, l, t, oldl, oldt, true, 0);
}

/**
 * @param linearLayout
 * @param l
 * @param t
 * @param oldl
 * @param oldt
 * @param isRootLinearLayout 是否是顶层布局
 * @param getTop             距离顶部高度
 */
private void parseViewGroup(ViewGroup linearLayout,
                            int l, int t, int oldl, int oldt,
                            boolean isRootLinearLayout, int getTop) {
    int scrollViewHeight = getHeight();
    Log.w(TAG, "linearLayout.getChildCount()" + linearLayout.getChildCount());
    for (int i = 0; i < linearLayout.getChildCount(); i++) {
        //如果子控件不是MyFrameLayout则循环下一个子控件；
        View child = linearLayout.getChildAt(i);

        // 若不是动画控件,则进入判断是否是ViewGroup,是的话递归其子view.不是的话则判断下一个
        if (!(child instanceof SherlockAnimationCallBack)) {
            if (child instanceof ViewGroup) {
                Log.d(TAG, "parseViewGroup: 该View不是FrameLayout,是ViewGroup: " + child
                        .getClass().getName());
                parseViewGroup((ViewGroup) child, l, t, oldl, oldt, false,
                        child.getTop() + getTop);
            }
            continue;
        }
        //以下为执行动画逻辑；
        SherlockAnimationCallBack myCallBack = (SherlockAnimationCallBack) child;
        //获取子View高度；
        int childHeight = child.getHeight();
        //子控件到父控件的距离；
        int childTop = child.getTop();
        if (!isRootLinearLayout) {
            childTop += getTop;
        }
        //滚动过程中，子View距离父控件顶部距离；
        int childAbsluteTop = childTop - t;
        //进入了屏幕
        if (childAbsluteTop <= scrollViewHeight) {
            //当前子控件显示出来的高度；
            int childShowHeight = scrollViewHeight - childAbsluteTop - 100 ;
            float moveRadio = childShowHeight / (float) childHeight;//这里一定要转化成float类型；
            //执行动画；
            myCallBack.excuteanimation(getMiddleValue(moveRadio, 0, 1));
        } else {
            //没在屏幕内,恢复数据；
            myCallBack.resetViewanimation();
        }
    }
}

```

### 动画执行

有了事件的分发了。我们只需要在`excuteanimation`的回调中实现我们的动画即可了。默认的SherlockFrame已经实现了一些了。若要强大的自定义动画效果，实现这个接口即可。

``` java
public interface SherlockAnimationCallBack {
    /**
     * 执行自定义动画方法；
     */
    void excuteanimation(float moveRadio);

    /**
     * 恢复初始状态；
     */
    void resetViewanimation();
}

```
 ### 优化

有了上面的几步，我们的动画已经能正常跑起来了，不过由于从最下面一开始就执行动画，有点感觉过快了。因此在分发位置移动事件的时候，在计算当前子控件显示出来的高度时减少了100， 这样动画就能延迟，看起来更加自然
``` java
      int childShowHeight = scrollViewHeight - childAbsluteTop - 100 ;
```

### 总结

还有很多不完善的地方，大家多多指教。

欢迎star [https://github.com/Jerey-Jobs/ScrollAnimationSherlock](https://github.com/Jerey-Jobs/ScrollAnimationSherlock)

----------
本文作者：Anderson/Jerey_Jobs

博客地址   ： [http://jerey.cn/](http://jerey.cn/)<br>
简书地址   :  [Anderson大码渣](http://www.jianshu.com/users/016a5ba708a0/latest_articles)<br>
github地址 :  [https://github.com/Jerey-Jobs](https://github.com/Jerey-Jobs)
