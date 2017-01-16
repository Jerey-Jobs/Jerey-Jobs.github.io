---
title: 2017-1-14-一个工程带你学会使用RxJava+Retrofit
tags: Android
grammar_cjkRuby: true
---

写了一个工程，大概分六个demo.java带你学习如何使用,通熟易懂，很明显，是我这个菜鸟写的。


## RxJava是什么？

RxJava 在 GitHub 主页上的自我介绍是 "a library for composing asynchronous and event-based programs using observable sequences for the Java VM"（一个在 Java VM 上使用可观测的序列来组成异步的、基于事件的程序的库）。这就是 RxJava。
简单的来说， RxJava 的本质可以压缩为异步这一个词。说到根上，它就是一个实现异步操作的库，而别的定语都是基于这之上的。

## RxJava的好处

简洁、美观

异步操作很关键的一点是程序的简洁性，因为在调度过程比较复杂的情况下，异步代码经常会既难写也难被读懂。 Android 的framework为我们创造的 AsyncTask 和Handler ，其实都是为了让异步代码更加简洁。RxJava 的优势也是简洁，但它的简洁的与众不同之处在于，随着程序逻辑变得越来越复杂，它依然能够保持简洁。
而美观呢，说实话，我是一个喜欢写程序的人，对于写完的程序，很喜欢自己去看整体的代码，如果在业务逻辑很复杂的情况下，代码会变得多层嵌套，还有多层的if else，这样看起来是很复杂的，且逻辑也容易出现漏洞。而RxJava所写出来的程序是很美观的。真的美观！不信点击demo中的代码就知道了，若加上RxBinding，那会更加美观。

## 逻辑原理

RxJava是一套基于观察者模式的工具库。众所周知，观察者模式在Android中使用的是相当的多的。
不懂观察者模式的可以移步至[观察者模式](http://jerey.cn/2016/07/23/Android%E4%B8%AD%E7%9A%84%E8%A7%82%E5%AF%9F%E8%80%85%E6%A8%A1%E5%BC%8F/)

RxJava 有四个基本概念：Observable (可观察者，即被观察者)、 Observer (观察者)、 subscribe (订阅)、事件。Observable 和 Observer 通过 subscribe() 方法实现订阅关系，从而 Observable 可以在需要的时候发出事件来通知 Observer。

其实详细的说还有很多，本文只做初步介绍。

与观察者模式不同， RxJava 的事件回调方法除了普通事件 onNext() （相当于 onClick() / onEvent()）之外，还定义了两个特殊的事件：onCompleted() 和 onError()。

RxJava 的观察者模式如下图：

![RxJava 的观察者模式](/img/post1/rxjava1.jpg)

## 使用

通过阅读以下代码链接，会一步一步的知道RxJava是如何使用的。
个人建议把我工程拉下来看，直接运行看log比较有感觉。
[工程链接：https://github.com/Jerey-Jobs/RxJavaDemos](https://github.com/Jerey-Jobs/RxJavaDemos)
 
 * 第一章：数据的发射与接收<br>
 [第一章代码：数据的发射与接收](https://github.com/Jerey-Jobs/RxJavaDemos/blob/master/app/src/main/java/com/jerey/rxjavademo/Demo1.java)
 通过创建observable与observer <br>
 再通过 observable.subscribe(observer); 进行数据发布,实现简单的订阅关系。
 具体见代码。
 

``` java
/**
 * 第一章：
 * 数据的发射与接收
 * Created by Xiamin on 2017/1/14.
 */

public class Demo1 {
    public static final String TAG = "Demo1";

    public static void test() {
        /**
         * bong，数据发射
         */
        observable.subscribe(observer);

        /**
         * 写法二
         */
        Observable.just("第一章")
                .subscribe(new Action1<String>() {
                    @Override
                    public void call(String s) {
                        Log.d(TAG, s);
                    }
                });
    }

    /**
     * Observable：发射源，英文释义“可观察的”，在观察者模式中称为“被观察者”或“可观察对象”；
     */
    static Observable<String> observable = Observable.create(new Observable.OnSubscribe<String>() {
        @Override
        public void call(Subscriber<? super String> subscriber) {
            subscriber.onNext("xiamin");
        }
    });

    /**
     * Observer：接收源，英文释义“观察者”，没错！就是观察者模式中的“观察者”，可接收Observable、Subject发射的数据；
     */
    static Observer<String> observer = new Observer<String>() {
        @Override
        public void onCompleted() {
        }

        @Override
        public void onError(Throwable e) {
        }

        @Override
        public void onNext(String s) {
            Log.d(TAG, s);
        }
    };
}
```


 	
 * 第二章：通过filter 控制筛选 通过map转换格式

 [第二章代码：通过filter 控制筛选 通过map转换格式](https://github.com/Jerey-Jobs/RxJavaDemos/blob/master/app/src/main/java/com/jerey/rxjavademo/Demo2.java)
 通过Observable.just(1, 2, 3, 4, 5)，然后使用.filter进行数据筛选 .map进行数据的格式转换的demo。

``` java
/**
 * 第二章：通过filter 控制筛选 通过map转换格式
 * Created by Xiamin on 2017/1/14.
 */
public class Demo2 {
    public static final String TAG = "Demo2";

    public static void test() {
        Observable.just(1, 2, 3, 4, 5)
                /**
                 * 筛选出偶数
                 */
                .filter(new Func1<Integer, Boolean>() {
                    @Override
                    public Boolean call(Integer integer) {
                        return integer % 2 == 0;
                    }
                })
                /**
                 * 除10转double
                 */
                .map(new Func1<Integer, Double>() {
                    @Override
                    public Double call(Integer integer) {
                        return integer / 10.0;
                    }
                })
                .subscribe(new Subscriber() {
                    @Override
                    public void onCompleted() {
                        Log.d(TAG, "onCompleted");
                    }

                    @Override
                    public void onError(Throwable e) {
                    }

                    @Override
                    public void onNext(Object o) {
                        Log.d(TAG, o.toString());
                    }
                });

    }
}


 /** 打印结果
  * 01-14 20:50:47.569 3113-3113/com.jerey.rxjavademo D/Demo2: 0.2
  * 01-14 20:50:47.569 3113-3113/com.jerey.rxjavademo D/Demo2: 0.4
  * 01-14 20:50:47.569 3113-3113/com.jerey.rxjavademo D/Demo2: onCompleted
  */
```


 * 第三章：Scheduler 线程控制

 [第三章代码：Scheduler 线程控制](https://github.com/Jerey-Jobs/RxJavaDemos/blob/master/app/src/main/java/com/jerey/rxjavademo/Demo3.java)
 *
	 * Schedulers.immediate(): 直接在当前线程运行，相当于不指定线程。这是默认的 Scheduler。
	 
	 * Schedulers.newThread(): 总是启用新线程，并在新线程执行操作。
	
	 * Schedulers.io(): I/O 操作（读写文件、读写数据库、网络信息交互等）所使用的 Scheduler
	 
	 * 行为模式和 newThread() 差不多，区别在于 io() 的内部实现是是用一个无数量上限的线程池，可以重用空闲的线程，因此多数情况下 io() 比 newThread() 更有效率。不要把计算工作放在 io() 中，可以避免创建不必要的线程。
	 
	 * Schedulers.computation(): 计算所使用的 Scheduler。这个计算指的是 CPU 密集型计算，即不会被 I/O 等操作限制性能的操作，例如图形的计算。这个 Scheduler 使用的固定的线程池，大小为 CPU 核数。不要把 I/O 操作放在 computation() 中，否则 I/O 操作的等待时间会浪费 CPU。
	 
	 * 另外， Android 还有一个专用的 AndroidSchedulers.mainThread()，它指定的操作将在 Android 主线程运行。 

``` java

import android.util.Log;

import rx.Observable;
import rx.Subscriber;
import rx.android.schedulers.AndroidSchedulers;
import rx.functions.Func1;
import rx.schedulers.Schedulers;

/**
 * Log结果：
 * 01-14 21:52:34.823 11566-11616/com.jerey.rxjavademo D/Demo3: OnSubscribe Threadid: 1423
 * 01-14 21:52:34.867 11566-11566/com.jerey.rxjavademo D/Demo3: map Threadid: 1
 * 01-14 21:52:34.867 11566-11566/com.jerey.rxjavademo D/Demo3: onNext Threadid: 1
 * 01-14 21:52:34.867 11566-11566/com.jerey.rxjavademo D/Demo3:  test:1
 */

public class Demo3 {
    public static final String TAG = "Demo3";

    public static void test() {
        Observable.create(new Observable.OnSubscribe<Integer>() {
            @Override
            public void call(Subscriber<? super Integer> subscriber) {
                subscriber.onNext(1);
                Log.d(TAG, "OnSubscribe Threadid: " + Thread.currentThread().getId());
            }
        })
                .subscribeOn(Schedulers.io()) // 指定 subscribe() 发生在 IO 线程
                .observeOn(AndroidSchedulers.mainThread()) // 指定 Subscriber 的回调发生在主线程
                .map(new Func1<Integer, String>() {
                    @Override
                    public String call(Integer integer) {
                        Log.d(TAG, "map Threadid: " + Thread.currentThread().getId());
                        return " test:" + integer;
                    }
                })
                .lift(new Observable.Operator<String, String>() {
                    @Override
                    public Subscriber<? super String> call(final Subscriber<? super String> subscriber) {
                        return new Subscriber<String>() {
                            @Override
                            public void onCompleted() {
                                subscriber.onCompleted();
                            }

                            @Override
                            public void onError(Throwable e) {
                                subscriber.onError(e);
                            }

                            @Override
                            public void onNext(String s) {
                                subscriber.onNext("lift->" + s);
                            }
                        };
                    }
                })
                .subscribe(new Subscriber<String>() {
                    @Override
                    public void onCompleted() {

                    }

                    @Override
                    public void onError(Throwable e) {

                    }

                    @Override
                    public void onNext(String s) {
                        Log.d(TAG, "onNext Threadid: " + Thread.currentThread().getId());
                        Log.d(TAG, s);
                    }
                });
    }

}
```


 	
 * 第四章：学会使用lift转变类型

 [第四章代码：学会使用lift转变类型](https://github.com/Jerey-Jobs/RxJavaDemos/blob/master/app/src/main/java/com/jerey/rxjavademo/Demo4.java)

``` java
/**
 * 第四章：学会使用left转变类型
 * Log is:
 * 01-14 22:21:01.866 29758-29758/com.jerey.rxjavademo I/Demo4: in left :1
 * 01-14 22:21:01.867 29758-29758/com.jerey.rxjavademo I/Demo4: arter left: had left: 1
 */
public class Demo4 {
    public static final String TAG = "Demo4";

    public static void test() {
        Observable.just(1)
                /**
                 * Integer转换为String
                 */
                .lift(new Observable.Operator<String, Integer>() {

                    @Override
                    public Subscriber<? super Integer> call(final Subscriber<? super String> subscriber) {
                        return new Subscriber<Integer>() {
                            @Override
                            public void onCompleted() {
                                subscriber.onCompleted();
                            }

                            @Override
                            public void onError(Throwable e) {
                                subscriber.onError(e);
                            }

                            @Override
                            public void onNext(Integer integer) {
                                Log.i(TAG, "in left :" + integer);
                                subscriber.onNext("had left: " + integer);
                            }
                        };
                    }
                })
                .subscribe(new Subscriber<String>() {
                    @Override
                    public void onCompleted() {
                    }

                    @Override
                    public void onError(Throwable e) {
                    }

                    @Override
                    public void onNext(String s) {
                        Log.i(TAG, "arter left: " + s);
                    }
                });
    }
}

```

	
* 第五章：学会使用Observable.Transformer 改变自身属性

[第五章代码：学会使用Observable.Transformer 改变自身属性](https://github.com/Jerey-Jobs/RxJavaDemos/blob/master/app/src/main/java/com/jerey/rxjavademo/Demo5.java)

``` java
/**
 * 第五章：学会使用Observable.Transformer 改变自身属性
 * Log:
 * 01-14 22:29:30.179 3753-3753/com.jerey.rxjavademo D/Demo5: xiamni10
 */
public class Demo5 {
    public static final String TAG = "Demo5";

    public static void test() {
        Observable observable = Observable.create(new Observable.OnSubscribe<Integer>() {
            @Override
            public void call(Subscriber<? super Integer> subscriber) {
                subscriber.onNext(10);
            }
        });
        Observable.Transformer<Integer, String> transformer = new Observable.Transformer<Integer, String>() {
            @Override
            public Observable<String> call(Observable<Integer> integerObservable) {
                return integerObservable.map(new Func1<Integer, String>() {
                    @Override
                    public String call(Integer integer) {
                        return "xiamni" + integer;
                    }
                });
            }
        };
        observable.compose(transformer)
                .subscribe(new Subscriber() {
                    @Override
                    public void onCompleted() {
                    }

                    @Override
                    public void onError(Throwable e) {
                    }

                    @Override
                    public void onNext(Object o) {
                        Log.d(TAG, o.toString());
                    }
                });
    }
}
```


	
* 第六章：学会简单使用Retrofit

[第六章代码：学会使用Retrofit](https://github.com/Jerey-Jobs/RxJavaDemos/blob/master/app/src/main/java/com/jerey/rxjavademo/RetrofitDemo.java)

``` java

/**
 * 第六章：学会使用Retrofit
 * 网络请求结果在文件代码最后
 */

public class RetrofitDemo {
    public static final String TAG = "RetrofitDemo";
    public static String baseUrl = "http://jerey.cn/";

    public static void test() {
        OkHttpClient client;
        client = new OkHttpClient.Builder()
                //添加应用拦截器
                .addInterceptor(new HttpInterceptor())
                //添加网络拦截器
                .build();
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(baseUrl)
                //将client与retrofit关联
                .client(client)
                //增加返回值为String的支持
                .addConverterFactory(ScalarsConverterFactory.create())
                .addCallAdapterFactory(RxJavaCallAdapterFactory.create())
                .build();
        IRetrofitService retrofitService = retrofit.create(IRetrofitService.class);
        retrofitService
                .getTestHtmlString()
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(new Subscriber<String>() {
                    @Override
                    public void onCompleted() {
                        Log.d(TAG, "onCompleted");
                    }

                    @Override
                    public void onError(Throwable e) {
                        /**
                         * D/RetrofitDemo: java.lang.SecurityException: Permission denied (missing INTERNET permission?)
                         */
                        Log.d(TAG, e.toString());
                    }

                    @Override
                    public void onNext(String s) {
                        Log.d(TAG, s);
                    }
                });

    }


    static class HttpInterceptor implements Interceptor {

        @Override
        public Response intercept(Chain chain) throws IOException {
            Request request = chain.request();
            //打印请求链接
            String TAG_REQUEST = "request";
            Log.e(TAG_REQUEST, "request" + request.url().toString());
            Response response = chain.proceed(request);
            //打印返回的message
            Log.e(TAG_REQUEST, "response" + response.toString());

            /**
             * 01-14 23:13:24.852 1484-1650/com.jerey.rxjavademo E/request: requesthttp://jerey.cn/
             * 01-14 23:13:25.685 1484-1650/com.jerey.rxjavademo E/request: responseResponse{protocol=http/1.1, code=200, message=OK, url=http://jerey.cn/}
             */
            return response;
        }
    }
}
```


 ----------
### 谢谢大家阅读，如有帮助，来个喜欢或者关注吧！

 ----------
 本文作者：Anderson/Jerey_Jobs 

 博客地址   ： [夏敏的博客/Anderson大码渣/Jerey_Jobs][1] <br>
 简书地址   :  [Anderson大码渣][2] <br>
 CSDN地址   :  [Jerey_Jobs的专栏][3] <br>
 github地址 :  [Jerey_Jobs][4]
 


  [1]: http://jerey.cn/
  [2]: http://www.jianshu.com/users/016a5ba708a0/latest_articles
  [3]: http://blog.csdn.net/jerey_jobs
  [4]: https://github.com/Jerey-Jobs
