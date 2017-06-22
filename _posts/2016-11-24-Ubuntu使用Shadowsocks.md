---
title: Ubuntu使用Shadowsocks
tags: 零散记录
grammar_cjkRuby: true
catalog: true
layout:  post
preview-img: "/img/preview/ubuntuss.png"
---

### 安装SS
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


### 如何终端翻墙?

sudo apt-get install proxychains

sudo vim /etc/proxychains.conf(需要root权限，用sudo)，然后将最下面一行 socks4 127.0.0.1 9050改为socks5 127.0.0.1 1080

使用方法：在想用代理的命令前加上sudo proxychains 即

sudo proxychains git pull origin master
