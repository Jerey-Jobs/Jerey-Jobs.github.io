---
title: What is DecorView and android.R.id.content?
tags:
    - View
    - Android
header-img: "img/post-bg-android.jpg"
grammar_cjkRuby: true
catalog: true
layout:  post
---

### 引言
DecorView和android.R.id.content是什么呢，我们必须从最常见的`setContentView`这个方法说起。<br>
很多人都知道android.R.id.content，那么他是哪来的呢？我们看完文章就知道了。<br>
大家都知道这个方法

> setContentView(R.layout.activity_main);

设置我们的Activity的显示布局，但是大家知道这个布局是怎么显示的呢？<br>
我们看Activity源码中的方法

``` java
  public void setContentView(@LayoutRes int layoutResID) {
      getWindow().setContentView(layoutResID);
      initWindowDecorActionBar();
  }
```

那这个 getWindow() 是什么呢 我们看源代码，在Activity的6619行和890行

``` java
 mWindow = new PhoneWindow(this, window);

 public Window getWindow() {
    return mWindow;
 }
```

所以我们拿到的是`PhoneWindow`

#### PhoneWindow.setContentView

``` java
public void setContentView(int layoutResID) {  
    if (mContentParent == null) {  
        installDecor();  
    } else {  
        mContentParent.removeAllViews();  
    }  
    mLayoutInflater.inflate(layoutResID, mContentParent);  
    final Callback cb = getCallback();  
    if (cb != null && !isDestroyed()) {  
        cb.onContentChanged();  
    }  
  }  

  private void installDecor() {  
            if (mDecor == null) {  
                mDecor = generateDecor();  
                mDecor.setDescendantFocusability(ViewGroup.FOCUS_AFTER_DESCENDANTS);  
                mDecor.setIsRootNamespace(true);  
                //...  
                }  
            }  
            if (mContentParent == null) {  
                mContentParent = generateLayout(mDecor);  
                mTitleView = (TextView)findViewById(com.android.internal.R.id.title);  
                if (mTitleView != null) {  
                   //根据FEATURE_NO_TITLE隐藏，或者设置mTitleView的值  
                    //...  
                } else {  
                    mActionBar = (ActionBarView) findViewById(com.android.internal.R.id.action_bar);  
                    if (mActionBar != null) {  
                        //设置ActionBar标题、图标神马的；根据FEATURE初始化Actionbar的一些显示  
                        //...  
                    }  
                }  
            }  
    }

  protected DecorView generateDecor() {  
        return new DecorView(getContext(), -1);  
  }  
```

mDecor是DecorView对象，为FrameLayout的子类，再通过 generateLayout(mDecor);把mDecor做为参数传入，然后获取到了我们的mContentParent；

看几行总要的代码。将layoutResource资源渲染之后，添加进了我们的decor里面了。
``` java
layoutResource = R.layout.simple;
View in = mLayoutInflater.inflate(layoutResource, null);  
decor.addView(in, new ViewGroup.LayoutParams(MATCH_PARENT, MATCH_PARENT));
ViewGroup contentParent = (ViewGroup)findViewById(ID_ANDROID_CONTENT);  
```

R.layout.simple

``` java
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"  
    android:orientation="vertical"  
    android:fitsSystemWindows="true">  
    <!-- Popout bar for action modes -->  
    <ViewStub android:id="@+id/action_mode_bar_stub"  
              android:inflatedId="@+id/action_mode_bar"  
              android:layout="@layout/action_mode_bar"  
              android:layout_width="match_parent"  
              android:layout_height="wrap_content" />  

    <FrameLayout android:id="@android:id/content"  
        android:layout_width="match_parent"   
        android:layout_height="0dip"  
        android:layout_weight="1"  
        android:foregroundGravity="fill_horizontal|top"  
        android:foreground="?android:attr/windowContentOverlay" />  
</LinearLayout>
```


我们看的是，系统将我们传过来的布局渲染了然后添加到decor里面。那么decor的作用就显示出了，是DecorView这个帧布局是存放我们的根试图的。试图里面有一个布局是存放actionbar的，另一个是大名鼎鼎的android.R.id.content。而且是个帧布局哦。

### 所以

所以我们知道了，android.R.id.content是个帧布局啊。我们以后添加view，没有必要一定要使用popWindow这类的东西，能够直接往我们的`android.R.id.content`主布局添加东西了啊。

而DecorView呢，我们平时的getDecorView:这个方法是获取顶级视图，里面是包含了我们的android.R.id.content的，而且也是个帧布局哦。我们甚至也能addView。

接下来，下一篇打算写一个低耦合的SnackView，我们已经知道往哪边添加这个View拉。


 ----------

### 谢谢大家阅读，如有帮助，来个喜欢或者关注吧！

 ----------
 本文作者：Anderson/Jerey_Jobs

 博客地址   ： [夏敏的博客/Anderson大码渣/Jerey_Jobs][1] <br>
 简书地址   :  [Anderson大码渣][2] <br>
 github地址 :  [Jerey_Jobs][4]



  [1]: http://jerey.cn/
  [2]: http://www.jianshu.com/users/016a5ba708a0/latest_articles
  [3]: http://blog.csdn.net/jerey_jobs
  [4]: https://github.com/Jerey-Jobs
