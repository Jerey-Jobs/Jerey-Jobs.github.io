---
title: Android路由（一）-scheme实现网页链接携带参数跳转到Activity
tags:
  - Router
  - Android
grammar_cjkRuby: true
header-img: "img/post-bg-ios9-web.jpg"
preview-img: "/img/preview/scheme.png"
catalog: true
layout:  post
categories: Router
date: 2017-08-03
---

### Scheme
Scheme这个词语我们可以在Uri使用时见到，有`uri.getScheme()`方法。在android中scheme是一种页面内跳转协议，是一种非常好的实现机制，通过定义自己的scheme协议，可以非常方便跳转app中的各个页面；通过scheme协议，服务器可以定制化告诉App跳转那个页面，可以通过通知栏消息定制化跳转页面，可以通过H5页面跳转页面等。

我们来看看谷歌官方对其data描述：见[https://developer.android.com/guide/topics/manifest/data-element.html](https://developer.android.com/guide/topics/manifest/data-element.html)

还有其filter的描述：[https://developer.android.com/training/basics/intents/filters.html](https://developer.android.com/training/basics/intents/filters.html)

以上两个网址我在关掉代理的情况下上不了，讲的很清晰，我只能搬过来了。

``` xml
<data>
SYNTAX:
<data android:scheme="string"
      android:host="string"
      android:port="string"
      android:path="string"
      android:pathPattern="string"
      android:pathPrefix="string"
      android:mimeType="string" />
CONTAINED IN:
<intent-filter>
DESCRIPTION:
Adds a data specification to an intent filter. The specification can be just a data type (the mimeType attribute), just a URI, or both a data type and a URI. A URI is specified by separate attributes for each of its parts:

<scheme>://<host>:<port>[<path>|<pathPrefix>|<pathPattern>]

These attributes that specify the URL format are optional, but also mutually dependent:

If a scheme is not specified for the intent filter, all the other URI attributes are ignored.
If a host is not specified for the filter, the port attribute and all the path attributes are ignored.
All the <data> elements contained within the same <intent-filter> element contribute to the same filter. So, for example, the following filter specification,
```

翻译过来就是，`<data>`是写在`<intent-filter>`中的，格式可以是数据的类型，或者是一个URI。其格式最终为`<scheme>://<host>:<port>[<path>|<pathPrefix>|<pathPattern>]`

这些属性是可选的，但是也有一些是有依赖关系的，比如如果没有设置`scheme`，则其他的URI属性将被忽略，又或是如果`host`没有被设置，那么`port`属性不生效。

### Scheme应用场景
通过manifest，应用向系统注册一个URL scheme，该scheme 用于从浏览器或其他应用中启动本应用。通过指定的 URL 字段，可以让应用在被调起后直接打开某些特定页面，比如商品详情页、活动详情页等等。也可以执行某些指定动作，如完成支付等。也可以在应用内通过 html 页来直接调用显示 app 内的某个页面。


我们最常见的应用场景就是别人分享的一个购物优惠，点开后直接进去了京东的客户端或者是淘宝的客户端。


### 如何集成
##### 1.在`AndroidManifest.xml`中对所需要打开的`activity`增加`<intent-filter />`
``` java
            <intent-filter>
                <!--协议部分，随便设置-->
                <data android:scheme="xl" android:host="login" android:path="/loginActivity"
                      android:port="8888"/>
                <!--下面这几行也必须得设置-->
                <category android:name="android.intent.category.DEFAULT"/>
                <action android:name="android.intent.action.VIEW"/>
                <category android:name="android.intent.category.BROWSABLE"/>
            </intent-filter>
```

我们设置了上面的`<intent-filter />`后，其实就可以通过下面的链接打开我们的activity了。


```
xl://login:8888/loginActivity?username=xiaaa
```

##### 2.在网页上写如下herf：
```
<a href="xl://login:8888/loginActivity?username=xiaaa">打开KeepGank</a>
```

点击后，若手机安装了我们应用便会直接打开。

也可以原生调用：
``` java
  Intent intent = new Intent(Intent.ACTION_VIEW,Uri.parse("xl://goods:8888/goodsDetail?goodsId=10011002"));
  startActivity(intent);
```

##### 3.获取跳转参数
``` java
        Uri uri = getIntent().getData();
        if (uri != null) {
            // 完整的url信息
            String url = uri.toString();
            String uesername = uri.getQueryParameter("username");
            LogTools.d(url);
            Toast.makeText(this, "userName = " + uesername, Toast.LENGTH_SHORT).show();
        }
```

通过`Intent`，我们能够拿到跳转的参数，便可以进行应用内的业务处理了。


### 总结
通过scheme跳转是一个很好的方式，不过后来谷歌2015年的I/O大会上提出了一个新方案[Android M 的＂App Links＂实现详解](http://www.jcodecraeer.com/a/anzhuokaifa/androidkaifa/2015/0609/3022.html)，感兴趣的可以看看。


好了安卓系统自带的就这么简单的集成，不过这种的缺点是，一个Activity要写一个，如果入口多了，要写很多个，工程大了难以管理。下一章将讲解应用内的路由`Arouter`
