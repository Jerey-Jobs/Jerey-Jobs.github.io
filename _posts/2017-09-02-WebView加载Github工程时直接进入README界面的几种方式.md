---
title: WebView加载Github工程时直接进入README界面的几种方式
subtitle: "用JS直接编写插件给webview"
tags:
  - WebView
grammar_cjkRuby: true
header-img: "img/bg-mountain.jpg"
preview-img: "/img/preview/webview-js.jpg"
catalog: true
layout:  post
categories: WebView
date: 2017-09-02
---

### 前言
在开发[KeepGank](https://github.com/Jerey-Jobs/KeepGank)的过程中遇到了一个问题，就是Github的手机版本网页进入时会是这个样子。

 比如打开RxJava的网页会是这个样子，路径为：`https://github.com/ReactiveX/RxJava`
![](http://upload-images.jianshu.io/upload_images/2305881-c8c7c7e52a4b8612.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

而我希望用户点开我的链接后进入的直接是以下界面。因为手机直接看README比较直观，不需要先进入那么复杂的界面、
以下路径为：https://github.com/ReactiveX/RxJava/blob/2.x/README.md

![](http://upload-images.jianshu.io/upload_images/2305881-b94bd32b0780153d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

而用户的点击界面是这样的：

![image.png](http://upload-images.jianshu.io/upload_images/2305881-a2469aad15979fc4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

那么面临一个问题，如何让WebView加载`https://github.com/ReactiveX/RxJava`时加载到`https://github.com/ReactiveX/RxJava/blob/2.x/README.md`路径。

### 方案一
我们可以首先直接使用http获取到`https://travis-ci.org/ReactiveX/RxJava/`的网页源码，而其中是有README的跳转路径的，分析完HTML数据便可以找到目的URL。
``` html
<div class="bubble-actions">
    <a href="/ReactiveX/RxJava/blob/2.x/README.md" class="bubble-action">
      View all of README.md
    </a>
</div>
```
这便是html代码里面README.md的路径了。
之后我们可以让`WebView`加载`https://github.com` + `/ReactiveX/RxJava/blob/2.x/README.md` 路径就可以了。

这个方案有个缺点，前面需要分析HTML，且分析HTML就要用到`jsoup`包, 为了这么个需求就要用到一个包实在是不情愿，而且预加载html的时候还要浪费时间。

更坑爹的是，若有工程没有README.md 那么我们只能加载原来的路径，那中间这些分析过程都白分析了。

### 方案二
通过WebView的JavascriptInterface 回调，能够拿到WebView的html，做到了先显示后拿到数据分析再显示的效果。代码如下，不过缺点还是需要去分析HTML文本。这个分析代码是烦人的，我这么懒得人不想写，因为这肯定占据很大内存在分析html，涉及到太多的字符串匹配。

``` java
         mWebView.addJavascriptInterface(new InJavaScriptLocalObj(), "local_obj");  
         mWebView.setWebViewClient(new WebViewClient() {  
            @Override  
            public void onPageStarted(WebView view, String url, Bitmap favicon) {  
                super.onPageStarted(view, url, favicon);  
            }  

            @Override  
            public boolean shouldOverrideUrlLoading(WebView view, String url) {  
                view.loadUrl(url);  
                return true;  
            }  

            @Override  
            public void onPageFinished(WebView view, String url) {  
                super.onPageFinished(view, url);  
                view.loadUrl("javascript:window.local_obj.showSource('<head>'+"  
                        + "document.getElementsByTagName('html')[0].innerHTML+'</head>');");  

            }  

            @Override  
            public void onReceivedError(WebView view, int errorCode,  
                    String description, String failingUrl) {  
                super.onReceivedError(view, errorCode, description, failingUrl);  
            }  

        });  
    }  

    final class InJavaScriptLocalObj {  
        public void showSource(String html) {  
            System.out.println("====>html="+html);  
        }  
    }  
```
### 方案三
我们是可以通过`WebViewClient`的`onPageFinished`加载js代码的，上面的方法二也是通过加载js回调Java的方式来获取html的。既然能加载JS我们大可以用JS来解决这事情。

我们再次查看HTML代码。是一个class="bubble-actions"包裹了`class="bubble-action"`，内容data为"View all of README.md". 这三个因素决定了这个href 才是目标路径。因为bubble-actions这些class该网页中有好多个。
``` html
<div class="bubble-actions">
    <a href="/ReactiveX/RxJava/blob/2.x/README.md" class="bubble-action">
      View all of README.md
    </a>
</div>
```

那么我们的js代码可以这么写。。。我这渣渣js
``` javascript
	var myParagragh = document.getElementsByClassName("bubble-actions");
	console.log("myParagragh length:", myParagragh.length);
	for (var i = myParagragh.length - 1; i >= 0; i--) {
		var a = myParagragh[i].getElementsByClassName("bubble-action");
		if (a.length > 0) {
			console.log("action:", a[0]);
			console.log("action:", a[0].firstChild.data);
			if (a[0].firstChild.data.indexOf("View all of README.md") > 0){
				    console.log("ok");
			            window.location.href=a[0].href;
			 }
		}
	}
```
我们先通过classname获取到一个list，再遍历这个list里面若有`bubble-action`元素，再去判断data是否为README.md。若是的话直接获取其href 并赋值给window.location.href即可以实现。

通过这种方式，当我们点开一个工程时，便直接进去的是它的README界面啦。因为手机端还是直接看README比较直观
