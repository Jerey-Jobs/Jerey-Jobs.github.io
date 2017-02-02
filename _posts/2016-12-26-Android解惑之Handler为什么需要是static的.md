---
title: Android解惑之Handler为什么需要是static的
tags: Android
grammar_cjkRuby: true
catalog: true
layout:  post
---

我们先来看一张Android Studio中的warning截图

![warning](/img/post1/handler_leak.png)

``` java
public class HandlerTestActivity extends Activity {
    private final Handler mHandler = new Handler() {
        @Override
        public void handleMessage(Message msg) {
            // ... do something
        }
    }
}
```
上面这段代码会引起内存泄漏（Memory Leak）。

- ### 为什么会引起内存泄漏？
我们都知道，非static的内部类会持有外部类的引用，举个类子来说，我们经常在一些内部类中显示跳转activity的时候，给Intent赋值的时候，第一个参数会写 外部类名.this ，这就是持有外部类的引用的很好表现。 同样，其他地方需要用到这个内部类的时候，也不能是直接new出来，因为为非static的，必须先通过new出外部类才能。

那么，现在的情况就是，这个非static的handler内部类，无论是否是匿名的，便会持有外部的activity的引用。

若此时你的handler的消息队列中有未处理的Message，在Activity finish之后，Message仍然存在，那么Handler也仍然存在。由于Handler中有Context的引用，那么Context也就存在也就存在。而该Context就是我们的Activity，也就是Activity依然纯在，那么我们便是发生了内存泄露。

- ### 那么为什么要写成静态内部类呢？或者写成其他单独的类呢？
隐性匿名类Handler变成static的内部类，由于static的内部类，使用的使用不需要外部类的实例，所以static的内部类和外部类是没有联系的，从而不持有外部类的引用，通过这种方法，我们可以避免该种情况的发生。
将隐性匿名类写成一个单独的类（top-level-class），这样Handler和Context之间就没有联系了。

- ### 如何写？
大家都知道，写成静态类后，由于其类似于单独成为了一个类，便不能直接调用我们Activity中的一些控件了，难不成要把所有的控件都写成static的么，当然不是 

我们通过使Handler持有Activity的一个弱引用来解决这个问题，直接持有Activity的话，我们便与之前的匿名内部类直接持有外部类的引用没区别了，而持有了弱引用，在Activity有用的情况下，其会被AMS持有强引用，GC不会回收，而当其finish了，便没有强引用对象持有了，此时GC时便会回收该Activity，我们的Handler由于是持有的弱引用，也不会导致其回收不成功。

来看一个简单的demo，我们写一个静态handler，实现5秒后修改我们布局中的textview的text。

``` java
package applock.anderson.com.statichandler;

import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.support.v7.app.AppCompatActivity;
import android.widget.TextView;

import java.lang.ref.WeakReference;

public class MainActivity extends AppCompatActivity {

    private TextView mTextView;
    private Handler mHandler;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        mTextView = (TextView) findViewById(R.id.tv_1);
        mHandler = new MyHandler(this);
        mHandler.sendEmptyMessageDelayed(0,5000);
    }

    public void setTextViewText(String str) {
        if(mTextView != null) {
            mTextView.setText(str);
        }
    }

    private static class MyHandler extends Handler {
        WeakReference<MainActivity> mainActivityWeakReference;

        public MyHandler(MainActivity activity) {
            mainActivityWeakReference = new WeakReference<MainActivity>(activity);
        }

        @Override
        public void handleMessage(Message msg) {
            super.handleMessage(msg);
            //若Avtivity被回收，此时activity便为空
            MainActivity activity = mainActivityWeakReference.get();
            if(activity != null) {
                activity.setTextViewText("修改成功");
            }
        }
    }
}

```
可以看到，我们的Activity中的TextView被修改了。


- ### 进阶
其实我们为什么要持有我们的Activity的弱引用呢，完全可以使用MVP大法，持有我们Activity实现的接口对象的弱引用，也就是多态的方式持有我们的Activity弱引用，多么美好的事情。



 ----------
 ### 谢谢大家阅读，如有帮助，来个喜欢或者关注吧！

 ----------
 本文作者：Anderson/Jerey_Jobs

 简书地址   :  [Anderson大码渣][1]
 CSDN地址   :  [Jerey_Jobs的专栏][2]
 github地址 :  [Jerey_Jobs][3]
 

  [1]: http://www.jianshu.com/users/016a5ba708a0/latest_articles
  [2]: http://blog.csdn.net/jerey_jobs
  [3]: https://github.com/Jerey-Jobs