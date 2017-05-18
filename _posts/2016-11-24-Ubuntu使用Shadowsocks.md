---
title: Ubuntu使用Shadowsocks
tags: 零散记录
grammar_cjkRuby: true
catalog: true
layout:  post
preview-img: "/img/preview/ubuntuss.png"
---

sudo apt-get install python-gevent python-pip<br>
sudo apt-get install shadowsocks

sudo vim /etc/shadowsocks.json

{<br>
"server": "****",<br>
"server_port": 4196,<br>
"local_address": "127.0.0.1",<br>
"local_port": 1080,<br>
"password": "********",<br>
"method": "aes-256-cfb",<br>
"fast_open": true,<br>
"workers": 1<br>
}


sslocal -c /etc/shadowsocks.json

开启后, network开启代理socks host: 127.0.0.1 端口1080
