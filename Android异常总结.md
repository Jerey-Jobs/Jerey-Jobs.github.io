---
title: Android程序员日常开发中异常总结
---
 ----------
  # **Java异常**
 平时开发中遇到的java异常很多，因为引起原因一目了然，当然也有不好解决的，比如一个简单的空指针异常你可能始终无法找到其为空的原因，甚至使用前还做了空判断。也有可能一个类型强制转换异常被报了出来可是你始终无法找到为什么出错的原因。偶先几率极低，只能catch的来了事。
 
 1. NullPointerException空指针引用异常
 2. ClassCastException 类型强制转换异常
 3. IllegalArgumentException 传递非法参数异常
 4. ArithmeticException 算术运算异常
 5. ArrayStoreException 向数组中存放与声明类型不兼容对象异常
 6. IndexOutOfBoundsException 下标越界异常
 7. NegativeArraySizeException 创建一个大小为负数的数组错误异常
 8. umberFormatException 数字格式异常
 9. SecurityException 安全异常
 10.UnsupportedOperationException 不支持的操作异常
[CSDN上更多的java异常][1]

 ----------
 # **Android自身特性异常**
 - ### 异常：java.lang.NullPointerException
 异常原因：另一种情况使用fragment时，fragment相关布局，必须给每个view设置id，否则通过activity获得fragment的实例时会出现以上异常
 解决方法：为fragment布局的每个view设置ID

 - ### 异常：Android中引入第三方Jar包的方法(Java.lang.NoClassDefFoundError解决办法)
1、在工程下新建lib文件夹，将需要的第三方包拷贝进来。
2、将引用的第三方包，添加进工作的build path。选中jar包->Build Path
3、（关键的一步）将lib设为源文件夹。如果不设置，则程序编译可以通过，但运行的时候，会报：选中lib文件夹->source code
java.lang.NoClassDefFoundError
Android中引入第三方Jar包的方法(java.lang.NoClassDefFoundError解决办法)
 
 - ### 异常：Caused by: android.os.TransactionTooLargeException
导致原因是：Binder传输的数据太大
如果Binder的参数或返回值太大，不适合的事务缓冲区，然后调用将失败，并将被抛出TransactionTooLargeException。
解决方法：
不要将大量数据传入Binder
 
 - ### 异常：android.database.CursorWindowAllocationException:Cursor window allocation of 2048 kb failed
导致原因：主要原因是因为使用了SimpleCursorAdapter类，其中的Cursor参数需要我们手动关闭，否则就会出现以上异常。
解决方法：cursor.close()
 
 - ### 异常：Excessive JNI global references错误的解决方案  GREF暴增
导致原因：vm对jni层的reference有个数限制，过多很造成VM aborting。因此每次在GREF增加到2000以上的时候就直接aborting了
 解决方法：及时回收或关闭引用
 
 
 - ### 异常：android.view.WindowManager$BadTokenException: Unable to add window -- token 
导致原因：使用getApplicationContext()获得的Context,而必须使用Activity,因为只有一个Activity才能添加一个窗体。
解决方法：采用当前Activity的Context
 
 - ### 异常：android.database.sqlite.SQLiteCantOpenDatabaseException: unable to open database file
导致原因：重复安装软件，导致Sqlite3打开数据库异常
解决方法：卸载相应软件，开关机，重新安装该软件，即可以解决相关异常。
 
 - ### 异常：java.util.ConcurrentModificationException（并发操作异常）
 异常原因：ArrayList是非线程安全的，当同时在遍历和修改ArrayList时，就会出现该异常
解决方法：使用Vector替换ArrayList，Vector是线程安全的。Vector的缺点：大量数据操作时，由于线程安全，性能比ArrayList低

 - ### 异常：so库文件异常（JNI层异常）
异常原因：在Android应用层开发中，我们经常会使用so库文件。当so库文件发生异常时，我们只能在adb log中发现fatal libc这样的异常信息，仅此而已，并不能发现异常调用的逻辑关系， 这是我们就需要查看so 库异常Log信息。在Android手机的/data/tombstones 的路径下就包含了so库文件发生异常的Log信息，开发者可以查看该路径下载Log文件发现异常调用的逻辑关系。

 ----------
 ### 谢谢大家阅读，如有帮助，来个喜欢或者关注吧！

 ----------
 本文作者：Anderson/Jerey_Jobs

 简书地址   :  [Anderson大码渣][2]
 CSDN地址   :  [Jerey_Jobs的专栏][3]
 github地址 :  [Jerey_Jobs][4]
 


  [1]: http://blog.csdn.net/qq635785620/article/details/7781026
  [2]: http://www.jianshu.com/users/016a5ba708a0/latest_articles
  [3]: http://blog.csdn.net/jerey_jobs
  [4]: https://github.com/Jerey-Jobs