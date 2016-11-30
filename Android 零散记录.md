---
title: Android 零散记录
---
 - ### PopupWindow与AlertDialog的区别
最关键的区别是AlertDialog不能指定显示位置，只能默认显示在屏幕最中间（当然也可以通过设置WindowManager参数来改变位置）。而PopupWindow是可以指定显示位置的，随便哪个位置都可以，更加灵活。
mPopWindow.showAtLocation(rootview, Gravity.BOTTOM, 0, 0);  


 - ### 为什么叫Support v4，v7
Android Support v4:  这个包是为了照顾1.6及更高版本而设计的，这个包是使用最广泛的，eclipse新建工程时，都默认带有了。
Android Support v7:  这个包是为了考虑照顾2.1及以上版本而设计的，但不包含更低，故如果不考虑1.6,我们可以采用再加上这个包，另外注意，v7是要依赖v4这个包的，即，两个得同时被包含。
Android Support v13  :这个包的设计是为了android 3.2及更高版本的，一般我们都不常用，平板开发中能用到。

 - ### 未解绑服务使得服务持有一个销毁的activity的context造成内存泄露
MainActivity has leaked ServiceConnection com.skyace.service.MainActivity$1@41cd81f0 that was originally bound here
服务没有解绑，造成内存泄露，onDestroy的回调方法中加入了对服务的解绑操作即 unbindService成功解决

 -  ### handler中的handleMessage返回值
 return true 代表事件被处理了，其他handleMessage不会收到该msg
 return false 事件继续传递，外层的handleMessage() 会继续执行 
 
 -  ###  FC问题从log中快速搜索has died

 11-18 10:10:59.380 V/CommandService(  495): Death received CommandThread:android.os.BinderProxy@41a1b1b8 in pid:1218
随后搜索该pid 快速找到log


 -  ###  Fragment对于onActivityResult捕获不到的情况
被父avtivity的onActivityResult捕获了

 -  ###  软件盘的本质是什么？软键盘其实是一个Dialog！
 InputMethodService为我们的输入法创建了一个Dialog，并且将该Dialog的Window的某些参数（如Gravity）进行了设置，使之能够在底部或者全屏显示。当我们点击输入框时，系统对活动主窗口进行调整，从而为输入法腾出相应的空间，然后将该Dialog显示在底部，或者全屏显示。
 
 -  ### 如何去掉字符串前后空格，或者说判断字符串是否为空，或者全部为空格
	 TextUtils.isEmpty(mStr.trim()
	 String类自带的trim()方法，能够去掉字符串前后空格
	 
 -  ### 如何使强制控制键盘弹起落下

``` java
   public void showSoftKeyboard() {
        mEditText.setFocusable(true);
        mEditText.setFocusableInTouchMode(true);
        mEditText.requestFocus();
        InputMethodManager inputManager = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
        inputManager.showSoftInput(mEditText, InputMethodManager.SHOW_FORCED);
    }

    public void hideSoftKeyboard() {
        InputMethodManager inputManager = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
        inputManager.hideSoftInputFromWindow(mEditText.getWindowToken(), 0);
    }
```
 -  ### 系统语言改变那点事
 当系统语言改变，当前Activity会进行重新创建，在生命方法中，我们可以在manifest中： android:configChanges="locale" 语言（国家码）改变
> I/###xiamin( 8571): Setting onPause
I/###xiamin( 8571): Setting onStop
I/###xiamin( 8571): Setting onDestory
I/###xiamin( 8571): Setting onCreate
I/###xiamin( 8571): Setting onStart
I/###xiamin( 8571): Setting onResume


 -  ###  Android模块
keyguard(锁屏)模块
SystemUI 通知栏和最近应用

 -  ### Android分辨率适配终极方案
 android-support-percent-lib  Android基于百分比的布局，谷歌官方推荐
 [android-support-percent-lib鸿洋博客][1]
 
 -  ### SurfaceView
 普通的Android控件，例如TextView、Button和CheckBox等，它们都是将自己的UI绘制在宿主窗口的绘图表面之上，这意味着它们的UI是在应用程序的主线程中进行绘制的。由于应用程序的主线程除了要绘制UI之外，还需要及时地响应用户输入，否则的话，系统就会认为应用程序没有响应了，因此就会弹出一个ANR对话框出来。对于一些游戏画面，或者摄像头预览、视频播放来说，它们的UI都比较复杂，而且要求能够进行高效的绘制，因此，它们的UI就不适合在应用程序的主线程中进行绘制。这时候就必须要给那些需要复杂而高效UI的视图生成一个独立的绘图表面，以及使用一个独立的线程来绘制这些视图的UI。
 
 -  ###   android:splitMotionEvents：定义布局是否传递触摸事件（touch）到子布局，true表示传递给子布局，false表示不传递。
 -  ###
 -  ### 
 -  ### 
 -  ###   
 -  ###
 ----------
 ###谢谢大家阅读，如有帮助，来个喜欢或者关注吧！

 ----------
 本文作者：Anderson/Jerey_Jobs

 简书地址：[Anderson大码渣][2]

 github地址：[Jerey_Jobs][3]


  [1]: http://blog.csdn.net/lmj623565791/article/details/46695347
  [2]: http://www.jianshu.com/users/016a5ba708a0/
  [3]: https://github.com/Jerey-Jobs