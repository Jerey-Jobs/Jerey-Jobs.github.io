---
title: Android解惑之Handler为什么需要是static的 
---

我们先来看一张Android Studio中的warning截图
[图片]()

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

### 为什么会引起内存泄漏？
http://blog.csdn.net/dongjun7357/article/details/52592882




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