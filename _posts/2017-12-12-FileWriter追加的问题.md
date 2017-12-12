---
title: write()和append()的区别
subtitle: "容易让人误会的write与append"
tags:
  - Java
grammar_cjkRuby: true
catalog: true
layout:  post
header-img: "img/iphone4.jpg"
preview-img: "/img/always/javamini.png"
categories: Java
date: 2017-12-12
---

Java的Writer里面的append与write容易让人误解,且网上系统的解说的也不多, 便写了此文.

### 基础问题1:Writer如何追加字符串
在构造法方法中,有一个`boolean append`参数,这个参数表明了是否需要追加.这个参数是属于`FileOutputStream`的构造方法

``` java
    public FileWriter(String filename, boolean append) throws IOException {
        super(new FileOutputStream(filename, append));
    }

    /**
     * Constructs a new {@code FileOutputStream} that writes to {@code path}.
     * If {@code append} is true and the file already exists, it will be appended to; otherwise
     * it will be truncated. The file will be created if it does not exist.
     *
     * @throws FileNotFoundException if the file cannot be opened for writing.
     */
    public FileOutputStream(String path, boolean append) throws FileNotFoundException {
        this(new File(path), append);
    }
```

### 问题2: 那么在构造方法里有参数了,append方法又是干什么用的?
以下代码有什么区别?

``` java
// 程序1
FileWriter fw = new FileWriter("a.txt",true);
            fw.write("a");
            fw.write("b");
            fw.write("c");
            fw.close();
            
// 程序2
FileWriter fw = new FileWriter("a.txt",true);
            fw.append("a");
            fw.append("b");
            fw.append("c");
            fw.close();
            
```
老实说,没有区别, 都是在打开的文件后面追加abc而已.并且上面的重复执行10遍,都是往文件里追加了十次abc.

结果都是:
>abcabcabcabcabcabcabcabcabcabc

那么append是干什么的呢, 提起append第一反应应该是追加,但是我们构造方法已经写了追加了啊.

此时我们直接点开源码好了. 
``` java
   /**
     * Appends the character {@code c} to the target. This method works the same
     * way as {@link #write(int)}.
     *
     * @param c
     *            the character to append to the target stream.
     * @return this writer.
     * @throws IOException
     *             if this writer is closed or another I/O error occurs.
     */
    public Writer append(char c) throws IOException {
        write(c);
        return this;
    }

    /**
     * Appends the character sequence {@code csq} to the target. This method
     * works the same way as {@code Writer.write(csq.toString())}. If {@code
     * csq} is {@code null}, then the string "null" is written to the target
     * stream.
     *
     * @param csq
     *            the character sequence appended to the target.
     * @return this writer.
     * @throws IOException
     *             if this writer is closed or another I/O error occurs.
     */
    public Writer append(CharSequence csq) throws IOException {
        if (csq == null) {
            csq = "null";
        }
        write(csq.toString());
        return this;
    }

    /**
     * Appends a subsequence of the character sequence {@code csq} to the
     * target. This method works the same way as {@code
     * Writer.writer(csq.subsequence(start, end).toString())}. If {@code
     * csq} is {@code null}, then the specified subsequence of the string "null"
     * will be written to the target.
     *
     * @param csq
     *            the character sequence appended to the target.
     * @param start
     *            the index of the first char in the character sequence appended
     *            to the target.
     * @param end
     *            the index of the character following the last character of the
     *            subsequence appended to the target.
     * @return this writer.
     * @throws IOException
     *             if this writer is closed or another I/O error occurs.
     * @throws IndexOutOfBoundsException
     *             if {@code start > end}, {@code start < 0}, {@code end < 0} or
     *             either {@code start} or {@code end} are greater or equal than
     *             the length of {@code csq}.
     */
    public Writer append(CharSequence csq, int start, int end) throws IOException {
        if (csq == null) {
            csq = "null";
        }
        write(csq.subSequence(start, end).toString());
        return this;
    }
```

出人意料的事情是, append里面调用了write方法, 也就是本质上`append`就是调用的`write`.也没有什么特殊的操作,要是说真的区别的话,也就在于:<br>
 append可以添加null的字符串，输出为"null" 而write会抛出空指针异常

### Appendable
那么Append的意义在于, 其是`Appendable`接口类.
``` java
public interface Appendable {

    Appendable append(char c) throws IOException;

    Appendable append(CharSequence csq) throws IOException;

    Appendable append(CharSequence csq, int start, int end) throws IOException;
}

```
而我们的`Writer`类,实现了这个方法而已:
``` java
public abstract class Writer implements Appendable, Closeable, Flushable {
    ...
}
```

### 总结
我们以后看到append, 不能直接说是追加, write是覆盖这种直觉性的反应了. 这里的append只是一种调用模式, 能够不断的返回自己append.


