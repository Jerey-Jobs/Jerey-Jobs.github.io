---
title: Android小知识-Asset目录与res目录的区别
header-img: "img/post-bg-android.jpg"
preview-img: "/img/post-bg-android.jpg"
tags:
    - Android
    - 小知识
grammar_cjkRuby: true
catalog: true
layout:  post
---

这个问题很多人还可能真的不清楚，包括我也之前只知道原封不动保存到APK中这个作用。
让我们系统的总结一下。


### res/raw和assets的相同点：　

　　两者目录下的文件在打包后会原封不动的保存在apk包中，不会被编译成二进制。

### res/raw和assets的不同点：

　　res/raw中的文件会被映射到R.java文件中，访问的时候直接使用资源ID即R.id.filename；assets文件夹下的文件不会被映射到R.java中，访问的时候需要AssetManager类。　

　　res/raw不可以有目录结构，而assets则可以有目录结构，也就是assets目录下可以再建立文件夹　

- 读取文件资源：　

　　读取res/raw下的文件资源，通过以下方式获取输入流来进行写操作

```
 InputStream is =getResources().openRawResource(R.id.filename);  
```

　　读取assets下的文件资源，通过以下方式获取输入流来进行写操作


``` java
    /**  
	 * 从assets中读取图片  
	 */  
	private Bitmap getImageFromAssetsFile(String fileName)  
	  {  
	      Bitmap image = null;  
	      AssetManager am = getResources().getAssets();  
	      try  
	      {  
	          InputStream is = am.open(fileName);  
	          image = BitmapFactory.decodeStream(is);  
	          is.close();  
	      }  
	      catch (IOException e)  
	      {  
	          e.printStackTrace();  
	      }   
	      return image;  
	  }  
```

注意1：Google的Android系统处理Assert有个bug，在AssertManager中不能处理单个超过1MB的文件，不然会报异常，raw没这个限制可以放个4MB的Mp3文件没问题。　

注意2：assets 文件夹是存放不进行编译加工的原生文件，即该文件夹里面的文件不会像 xml， java 文件被预编译，可以存放一些图片，html，js, css 等文件。




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
