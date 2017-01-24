---
title: Ubuntu使用Shadowsocks
tags: 零散记录
grammar_cjkRuby: true
---

sudo apt-get install python-gevent python-pip
sudo apt-get install shadowsocks

sudo vim /etc/shadowsocks.json

{
"server": "****",
"server_port": 4196,
"local_address": "127.0.0.1",
"local_port": 1080,
"password": "********",
"method": "aes-256-cfb",
"fast_open": true,
"workers": 1
}


sslocal -c /etc/shadowsocks.json

开启后, network开启代理socks host: 127.0.0.1 端口1080