---
title: WebSocket简介
subtitle: "简单介绍一下websocket"
tags:
  - Android
  - 网络
grammar_cjkRuby: true
header-img: "img/post-bg-os-metro.jpg"
preview-img: "/img/post1/websocket.jpg"
catalog: true
layout:  post
categories: Android
date: 2017-12-10
---

好多小伙伴对websocket都不怎么了解，甚至是闻所未闻，本篇文章将简单的介绍一下websocket。当然，websock的并不能解决我们面临的所有问题，一个稳定的在线判断，长链接框架，写起来也是有很多问题要继续处理的。

[贴一下Java-WebSocket链接](https://github.com/TooTallNate/Java-WebSocket)

### WebSocket是什么?
在Google上搜索`WebSocket`,会得到一下解释: <br>
WebSocket是HTML5开始提供的一种浏览器与服务器间进行全双工通讯的网络技术。 WebSocket通信协议于2011年被IETF定为标准RFC 6455，WebSocketAPI被W3C定为标准。 在WebSocket API中，浏览器和服务器只需要要做一个握手的动作，然后，浏览器和服务器之间就形成了一条快速通道。两者之间就直接可以数据互相传送。

其实简单的说,Websocket就是一个全双工通信协议.准确的说,是一个全双工的应用层网络协议.

### 为什么要有WebSocket?
不需要回答太多, 因为我们需要一个全双工的便于使用的应用层网络协议.
有人说, Socket也是啊. 可惜Socket封装起来太过麻烦,并且在网页应用上, 无法使用Socket进行复杂的通信.

网页上都是用http/s.而http协议的致命缺点就是, 由客户端发送请求, 服务端处理请求, 而没法服务端发起请求告诉客户端消息.

我们需要WebSocket的理由真的是有若干个,比如:推送,网页消息推送,App推送,比如QQ聊天,比如摩拜单车的智能锁,当你扫码后,服务器要推送一条开锁消息给单车, 那么单车一定在维护着一个长连接,和服务器通信, 这些都是WebSocket的应用场景.

我们看一下WebSocket的历史: WebSocket 协议在2008年诞生，2011年成为国际标准。所有浏览器都已经支持了。

那么在08年以前(也就是我还在上初中), 应用进行消息推送应该是各自搭建协议, 而网页推送的话, 抱歉了. 网页版QQ 网页版微信就麻烦了.

那么以前是怎么做双向通信的Web应用呢:
1. 轮训, 非阻塞(如下模式)
```
浏览器: 服务器哥哥有我消息么?
服务器: 没有
浏览器: 服务器哥哥有我消息么?
服务器: 没有
浏览器: 服务器哥哥有我消息么?
服务器: 没有
浏览器: 服务器哥哥有我消息么?
服务器: 有, 对方说: hello world
浏览器: 服务器哥哥有我消息么?
服务器: 没有
```

2. 长轮训, 阻塞
```
浏览器: 服务器哥哥有我消息么?
服务器: 你在这等着, 有了我告诉你........好了,有了,对方说 hello world
```

对于上述两种模式, 都浪费了大量的资源, 第一种是频繁发起请求, 第二种需要有很高的并发，也就是说同时服务很多客户端的能力.

有了WebSocket的情况就变成了如下:

```
浏览器: 服务器, 我需要升级为Websocket协议，需要的服务：chat，Websocket协议版本：17（HTTP Request）
服务端：ok，确认，已升级为Websocket协议（HTTP Protocols Switched）
浏览器：有消息记得通知我
服务端：好的
服务端：喂, 有你消息, 有人说: id11,快下班了. 最好收到回我下, 不然我吃个饭再告诉你一遍.
服务端：喂, 有你消息, 有人说: id11,快下班了. 最好收到回我下, 不然我吃个饭再告诉你一遍.
浏览器: 收到了,id11
服务端: 好的, id11消息已经通知成功.
```

以上我们是拿浏览器做了demo，实际上，所有的终端都可以是客户端，websocket也有java版本的，有其他语言版本的，这只是一个协议而已。

### WebSocket的端口
既然是基于socket的,肯定走哪个端口.在Java的websocket源码中, `WebSocketClient`类中有以下代码, 我们可以知道, ws走的是80端口, wss走的是443.

ps: ws 表示纯文本通信（ 如ws://example.com/socket），wss 表示使用加密信道通信（TCP+TLS）

WebSocket 的主要目的，是在浏览器中的应用与服务器之间提供优化的、双向通信机制。可是，WebSocket 的连接协议也可以用于浏览器之外的场景，可以通过非HTTP协商机制交换数据。考虑到这一点，HyBi Working Group 就选择采用了自定义的URI模式：

    ws协议：普通请求，占用与http相同的80端口；<br>
    wss协议：基于SSL的安全传输，占用与tls相同的443端口。<br>


``` java
    private int getPort() {
        int port = this.uri.getPort();
        if(port == -1) {
            String scheme = this.uri.getScheme();
            if(scheme.equals("wss")) {
                return 443;
            } else if(scheme.equals("ws")) {
                return 80;
            } else {
                throw new RuntimeException("unknown scheme: " + scheme);
            }
        } else {
            return port;
        }
    }
```

## 总结
WebSocket 协议为实时双向通信而设计，提供高效、灵活的文本和二进制数据传输，在进行应用数据传输时，需要根据不同的场景选择恰当的协议，WebSocket 并不能取代HTTP。各自有各自的应用场景。
