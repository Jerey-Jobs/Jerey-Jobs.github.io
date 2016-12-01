---
title: Java零散记录
---
- ### String能被继承吗
不能，因为String是这样定义的：public final class String extends Object，里边有final关键字，所以不能被继承。

- ### 什么样的类不能被继承？
　一，在Java中，只要是被定义为final的类，也可以说是被final修饰的类，就是不能被继承的。
　二，final是java中的一个关键字，可以用来修饰变量、方法和类。用关键词final修饰的域成为最终域。用关键词final修饰的变量一旦赋值，就不能改变，也称为修饰的标识为常量。如果一个类的域被关键字final所修饰，它的取值在程序的整个执行过程中将不会改变。
　三，假如说整个类都是final，就表明自己不希望从这个类继承，或者不答应其他任何人采取这种操作。换言之，出于这样或那样的原因，我们的类肯定不需要进行任何改变；或者出于安全方面的理由，我们不希望进行子类化（子类处理）。

- ### String/StringBuffer/StringBuilder区别
Java 平台提供了两种类型的字符串：String和StringBuffer/StringBuilder，它们可以储存和操作字符串。其中String是只读字符串，也就意味着String引用的字符串内容是不能被改变的。而StringBuffer和StringBulder类表示的字符串对象可以直接进行修改。StringBuilder是JDK1.5引入的，它和StringBuffer的方法完全相同，区别在于它是单线程环境下使用的，因为它的所有方面都没有被synchronized修饰，因此它的效率也比StringBuffer略高。
总结：
String是不可变对象，每次改变都生成新对象
StringBuffer 不生成新对象，字符串经常改变情况下，推荐使用
StringBuilder 线程不安全，效率高

- ### 静态内部类/匿名内部类/内部类
>静态内部类：使用static修饰的内部类
>匿名内部类：使用new生成的内部类
>内部类持有外部类的引用，因为内部类的产生依赖于外部类，持有的引用是类名.this。

- ### switch是否能作用在byte上，是否能作用在long上，是否能作用在String上？
switch支持使用byte类型，不支持long类型，String支持在java1.7引入

- ###
- ###
- ###
- ###
- ###
- ###
- ###
- ###
- ###
- ###
- ###
- ###
- ###
- ###
- ###

 ----------
 ### 谢谢大家阅读，如有帮助，来个喜欢或者关注吧！

 ----------
 本文作者：Anderson/Jerey_Jobs

 简书地址：[Anderson大码渣][1]

 github地址：[Jerey_Jobs][2]
  [1]: http://www.jianshu.com/users/016a5ba708a0/latest_articles
  [2]: https://github.com/Jerey-Jobs
