---
title: Collections.sort排序详解
tags: Java
grammar_cjkRuby: true
catalog: true
layout:  post
---
前一阵子项目遇到个Collections.sort问题，补了一下Collections.sort方法。

Comparator是个接口，可重写compare()及equals()这两个方法,用于比价功能；如果是null的话，就是使用元素的默认顺序，如a,b,c,d,e,f,g，就是a,b,c,d,e,f,g这样，当然数字也是这样的。
compare（a,b）方法:根据第一个参数小于、等于或大于第二个参数分别返回负整数、零或正整数。
equals（obj）方法：仅当指定的对象也是一个 Comparator，并且强行实施与此 Comparator 相同的排序时才返回 true。
Collections.sort(list, new PriceComparator());的第二个参数返回一个int型的值，就相当于一个标志，告诉sort方法按什么顺序来对list进行排序。
