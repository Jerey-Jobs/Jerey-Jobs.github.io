---
title: 来自B站的开源的MagicaSakura源码解析
subtitle: "目前看来,这只是一个改变颜色的框架,而不是一个主题框架"
tags:
  - Android
grammar_cjkRuby: true
header-img: "img/pixel.jpg"
preview-img: "/img/preview/magicaSakuraPre.jpg"
catalog: true
layout:  post
categories: Android
date: 2017-06-04
---

### 简介
`MagicaSakura`是Bilibili开源的一套主题切换框架,其功能是在不重启Activity的情况下,能够无闪屏的对程序中的控件进行更换主题颜色.之所以能做到这一点,是因为其实现方式是切换主题时,设置主题颜色,通过其提供的`ThemeUtils.refreshUI`方法让每个控件进行改变颜色.

关于该框架的使用可以看原作者介绍[http://www.xyczero.com/blog/article/31/](http://www.xyczero.com/blog/article/31/)

### 初步使用

我们需要完成 `switchColor` 接口.
```
public interface switchColor {
    @ColorInt int replaceColorById(Context context, @ColorRes int colorId);

    @ColorInt int replaceColor(Context context, @ColorInt int color);
}
```
在该接口里面, 有两个方法返回的均是colorId, 我们就是在这个切换器接口里进行根据主题变换返回不同的颜色值即可.

并将该接口设置为全局变量,因此建议在Application中实现该接口,并设置,设置其为全局切换器

> ThemeUtils.setSwitchColor(this);

``` java
    public static switchColor mSwitchColor;
    public static void setSwitchColor(switchColor switchColor) {
        mSwitchColor = switchColor;
    }
```

### ThemeUtils.refreshUI原理

在初始化接口后, 我们可以使用`public static void refreshUI(Context context, ExtraRefreshable extraRefreshable)`方法进行主题的切换.

我们看一看该方法的源码.其先拿到界面的rootview,再调用了`refreshView方法进行刷新.
``` java
public static void refreshUI(Context context, ExtraRefreshable extraRefreshable) {
    TintManager.clearTintCache();
    Activity activity = getWrapperActivity(context);
    if (activity != null) {
        if (extraRefreshable != null) {
            extraRefreshable.refreshGlobal(activity);
        }
        //拿到界面的根目录.
        View rootView = activity.getWindow().getDecorView().findViewById(android.R.id.content);
        refreshView(rootView, extraRefreshable);
    }
}
```

再来看`refreshView`方法, 可以看到,如果该view 完成了`Tintable`接口, 让其执行`((Tintable) view).tint()`方法, 若是viewGroup, 则不断递归进行该操作. 若是ListView(GridView)或者RecylerView就notify一下.若是RecyclerView，也是刷新一下。


``` java
private static void refreshView(View view, ExtraRefreshable extraRefreshable) {
    if (view == null) return;

    view.destroyDrawingCache();
    if (view instanceof Tintable) {
        ((Tintable) view).tint();
        if (view instanceof ViewGroup) {
            for (int i = 0; i < ((ViewGroup) view).getChildCount(); i++) {
                refreshView(((ViewGroup) view).getChildAt(i), extraRefreshable);
            }
        }
    } else {
        if (extraRefreshable != null) {
            extraRefreshable.refreshSpecificView(view);
        }
        if (view instanceof AbsListView) {
            try {
                if (sRecyclerBin == null) {
                    sRecyclerBin = AbsListView.class.getDeclaredField("mRecycler");
                    sRecyclerBin.setAccessible(true);
                }
                if (sListViewClearMethod == null) {
                    sListViewClearMethod = Class.forName("android.widget.AbsListView$RecycleBin")
                            .getDeclaredMethod("clear");
                    sListViewClearMethod.setAccessible(true);
                }
                sListViewClearMethod.invoke(sRecyclerBin.get(view));
            }
            ...
            ListAdapter adapter = ((AbsListView) view).getAdapter();
            while (adapter instanceof WrapperListAdapter) {
                adapter = ((WrapperListAdapter) adapter).getWrappedAdapter();
            }
            if (adapter instanceof BaseAdapter) {
                ((BaseAdapter) adapter).notifyDataSetChanged();
            }
        }
        if (view instanceof RecyclerView) {
            try {
                if (sRecycler == null) {
                    sRecycler = RecyclerView.class.getDeclaredField("mRecycler");
                    sRecycler.setAccessible(true);
                }
                if (sRecycleViewClearMethod == null) {
                    sRecycleViewClearMethod = Class.forName("android.support.v7.widget.RecyclerView$Recycler")
                            .getDeclaredMethod("clear");
                    sRecycleViewClearMethod.setAccessible(true);
                }
                sRecycleViewClearMethod.invoke(sRecycler.get(view));
            }
            ...
            ((RecyclerView) view).getRecycledViewPool().clear();
            ((RecyclerView) view).invalidateItemDecorations();
        }
        if (view instanceof ViewGroup) {
            for (int i = 0; i < ((ViewGroup) view).getChildCount(); i++) {
                refreshView(((ViewGroup) view).getChildAt(i), extraRefreshable);
            }
        }
    }
}
```

### view.tint()是怎么做的?

我们来看`tint()`方法源码。发现其是通过三个helper的tint来做的。其抽象出三个`Helper`,分别控制的是文本颜色变换，背景颜色变换以及复合绘图变换。

``` java
@Override
private AppCompatBackgroundHelper mBackgroundHelper;
private AppCompatCompoundDrawableHelper mCompoundDrawableHelper;
private AppCompatTextHelper mTextHelper;

public void tint() {
    if (mTextHelper != null) {
        mTextHelper.tint();
    }
    if (mBackgroundHelper != null) {
        mBackgroundHelper.tint();
    }
    if (mCompoundDrawableHelper != null) {
        mCompoundDrawableHelper.tint();
    }
}
```

我们从`TintTextView`源码来看。

先看其构造函数，直接调用几个Helper的void loadFromAttribute(AttributeSet attrs, int defStyleAttr)方法,也就是说在这些`View`的加载时，便去从配置的属性中进行加载颜色，这解决了在刷新UI时,那些未出现的控件颜色无法更改的问题。

``` java
public TintTextView(Context context, AttributeSet attrs, int defStyleAttr) {
    super(context, attrs, defStyleAttr);
    if (isInEditMode()) {
        return;
    }
    TintManager tintManager = TintManager.get(getContext());

    mTextHelper = new AppCompatTextHelper(this, tintManager);
    mTextHelper.loadFromAttribute(attrs, defStyleAttr);

    mBackgroundHelper = new AppCompatBackgroundHelper(this, tintManager);
    mBackgroundHelper.loadFromAttribute(attrs, defStyleAttr);

    mCompoundDrawableHelper = new AppCompatCompoundDrawableHelper(this, tintManager);
    mCompoundDrawableHelper.loadFromAttribute(attrs, defStyleAttr);
}
```

来看一个Helper的load方法

``` java
void loadFromAttribute(AttributeSet attrs, int defStyleAttr) {
    TypedArray array = mView.getContext().obtainStyledAttributes(attrs, ATTRS, defStyleAttr, 0);

    int textColorId = array.getResourceId(0, 0);
    if (textColorId == 0) {
        setTextAppearanceForTextColor(array.getResourceId(2, 0), false);
    } else {
        setTextColor(textColorId);
    }

    if (array.hasValue(1)) {
        setLinkTextColor(array.getResourceId(1, 0));
    }
    array.recycle();
}
```

其实里面就是获取颜色，设置颜色这些事情。


### 为什么需要复写那些控件?

`MagicaSakura`的原理我们知道是遍历Tintable类View, 其会自动根据主题颜色换色,但是对于还未出现的那些View, 之后再出现,若是原生的,其不会更新自己的主题色的.我本想避免使用复写控件的方式通过其他属性进行主题变换的，发现根本没法解决未出现的控件的主题问题。

### 缺点
1. `MagicaSakura`多主题框架是针对的换色而言,其设计就是为换色而生,而对于其他的明星皮肤等换肤需求,则做不了该需求
2. 使用该框架,我们的xml文件需要大改,很多需要改色的控件都需要使用其提供的`Tint`工具包的类替换原来的控件,有写Tint包里面没有类比如`Toolbar`则需要自己处理.


----------
本文作者：Anderson/Jerey_Jobs

博客地址   ： [http://jerey.cn/](http://jerey.cn/)<br>
简书地址   :  [Anderson大码渣](http://www.jianshu.com/users/016a5ba708a0/latest_articles)<br>
github地址 :  [https://github.com/Jerey-Jobs](https://github.com/Jerey-Jobs)
