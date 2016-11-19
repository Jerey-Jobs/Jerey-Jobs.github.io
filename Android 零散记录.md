---
title: Android 零散记录
tags: 新建,模板,小书匠
grammar_cjkRuby: true
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

 -  ### 
 -  ###  
 -  ###  
 -  ###  
 -  ### 
 -  ###   


 ----------
 ###谢谢大家阅读，如有帮助，来个喜欢或者关注吧！

 ----------
 本文作者：Anderson/Jerey_Jobs

 简书地址：[Anderson大码渣][1]

 github地址：[Jerey_Jobs][2]
  [1]: http://www.jianshu.com/users/016a5ba708a0/
  [2]: https://github.com/Jerey-Jobs

