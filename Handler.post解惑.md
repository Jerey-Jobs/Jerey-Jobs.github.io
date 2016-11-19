---
title: Handler.post解惑
grammar_cjkRuby: true
---
本人今日拿到一份代码，其中网络请求方面由于很简单，就没有使用网络请求框架，ok，那按照我的想法，开启一个线程拿个数据，拿完发送handler更新UI即可了，但是代码中并不是这么写的，而是通过mNetHandler.post一个包含网络请求的runnable。mNetHandler的来源是这样的。

``` stylus
        HandlerThread handlerThread = new HandlerThread("NET");
        handlerThread.start();
        mNetHandler = new Handler(handlerThread.getLooper());
```
而当我询问原因时，解释是用mNetHandler来管理这些Runnable，在view结束时，
> mNetHandler.removeCallback

移除这些runnable，解决掉在view，或者说activity中开启线程，而当view或者activity结束时 线程仍然存活的问题。

但是目前存在一个问题，removeCallback并不是立即停止该线程，而是移除掉还未执行的callback，正在执行的是无法立即结束的。此问题我写了demo，证实的确是正在运行的程序无论通过
mNetHandler.getLooper().quit();
handlerThread.quitSafely();
都无法停止该线程，我们来看一下我的demo
功能很简单，activity1点击button进activity2，activity2一进去就开启线程干事情，然后点击finsh按钮，结束当前activity，回到activity1，无论哪种模式，activity开的那个线程都能存活。

- Activity 1的代码 没什么东西  就是跳转
``` stylus
public class MainActivity extends AppCompatActivity {

    private Button button;
    private TextView textView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        textView = (TextView) findViewById(R.id.my_text);
        button = (Button) findViewById(R.id.button);
        textView.setText("第一个界面");
        button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(MainActivity.this,SecondActivity.class);
                startActivity(intent);
            }
        });
    }
}
```

- Activity2的代码

``` stylus
/**
 * Created by xiamin on 11/19/16.
 */
public class SecondActivity extends AppCompatActivity {
    private Button button;
    private TextView textView;
    private Handler mNetHandler;
    HandlerThread handlerThread;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        textView = (TextView) findViewById(R.id.my_text);
        button = (Button) findViewById(R.id.button);
        textView.setText("第2个界面");
        button.setText("finish()");
        button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                finish();
            }
        });

        handlerThread = new HandlerThread("NET");
        handlerThread.start();
        mNetHandler = new Handler(handlerThread.getLooper());
        mNetHandler.post(mRunnable);
    }

    private static int count = 0;
    private Runnable mRunnable = new Runnable() {
        @Override
        public void run() {
            while (true) {
                Log.i("iii"," count = " + count++);
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }
    };

    @Override
    protected void onDestroy() {
        Log.i("iii","mNetHandler.removeCallbacks(mRunnable);");
        mNetHandler.removeCallbacksAndMessages(null);
        mNetHandler.getLooper().quit();
        handlerThread.quitSafely();
        super.onDestroy();
    }
}

```




- ### handler回顾

Android程序员都知道不能在UI线程执行耗时的操作，Android引入handler就是为了解决这个问题，当然实现异步更新UI不仅仅只有这一种方法，还有AsyncTask也可以实现。

Android有一个 Handler类，使用该类可以对运行在不同线程中的多个任务进行排队，并使用Message和Runnable对象安排这些任务。在javadoc中，对Handler是这样解释的：Handler可以发送和处理消息对象或Runnable对象，这些消息对象和Runnable对象与一个线程相关联。每个Handler的实例都关联了一个线程和线程的消息队列。当创建了一个Handler对象时，一个线程或消息队列同时也被创建，该Handler对象将发送和处理这些消息或Runnable对象。

a、如果new一个无参构造函数的Handler对象，那么这个Handler将自动与当前运行线程相关联，也就是说这个Handler将与当前运行的线程使用同一个消息队列，并且可以处理该队列中的消息。
    我做过这样一个实验，在主用户界面中创建一个带有无参构造函数的Handler对象，该Handler对象向消息队列推送一个Runnable对象，在Runnable对象的run函数中打印当前线程Id，主用户界面线程ID和Runnable线程ID均为1。
    
b、如果new一个带参构造函数的Handler对象，那么这个Handler对象将与参数所表示的Looper相关联。注意：此时线程类应该是一个特殊类HandlerThread类，一个Looper类的Thread类，它继承自Thread类。

c、如果需要Handler对象去处理消息，那么就要重载Handler类的handleMessage函数。

 ----------
 ###谢谢大家阅读，如有帮助，来个喜欢或者关注吧！

 ----------
 本文作者：Anderson/Jerey_Jobs

 简书地址：[Anderson大码渣][1]

 github地址：[Jerey_Jobs][2]
  [1]: http://www.jianshu.com/users/016a5ba708a0/latest_articles
  [2]: https://github.com/Jerey-Jobs
