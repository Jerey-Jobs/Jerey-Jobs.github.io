---
title: DiskLruCache简介
tags: Android
grammar_cjkRuby: true
header-img: "img/post-bg-android.jpg"
preview-img: "/img/preview/disklrucache.png"
catalog: true
layout:  post
---

由[JakeWharton大神](https://github.com/JakeWharton/DiskLruCache)所编写的[DiskLruCache](https://github.com/JakeWharton/DiskLruCache)工程, 里面除去注释量,代码差不多500行,短短500行的代码,却拿到了3000多个star,以及800多个fork, 可见其代码设计的优越性,稳定性.并且得到了Google的推荐,以及众多明星公司的青睐.

抱着学习的态度去看了看代码,加上网上的介绍,学习了其原理.

首先,DiskLruCache原理很简单,就是将你的东西缓存到磁盘上,你可能说,我们也能啊.任何东西都可以转换成字节流的形式再转换文件形式存放在磁盘上,毕竟,所有东西都是二进制.

所以说,大家都能干的事情,但是干好可是很难的。而JakeWharton短短500行代码帮你干好了这件事情是很神奇的.


DiskLruCache只有3个类.
![文件.png](http://upload-images.jianshu.io/upload_images/2305881-7081d177c6878731.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我们先看一下如何使用.以及使用后的效果.

- #### 构造方法

``` java
/**
*cacheFile 缓存文件的存储路径
*appVersion 应用版本号。DiskLruCache 认为应用版本更新后所有的数据都因该从服务器重新拉取，因此需要版本号进行判断
*1 每条缓存条目对应的值的个数，这里设置为1个。
*10*1024*1014 缓存的最大空间10M
**/
DiskLruCache mDiskLruCache = DiskLruCache.open(cacheFile, appVersion, 1, 10*1024*1014);
```

- #### 存储一个String

``` java
    DiskLruCache.Editor edit = mDiskLruCache.edit("xiamin");
    OutputStream os = edit.newOutputStream(0);
    BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(os));
    bw.write("test1");
    edit.commit();//write CLEAN
```


- #### 读取String
拿到InputStream,之后再读出来转string
``` java
    DiskLruCache.Snapshot snapShot = mDiskLruCache.get(key);  
    if (snapShot != null) {  
        InputStream is = snapShot.getInputStream(0);  
    }
    String str = Util.readFully(new InputStreamReader(inputStream, Util.UTF_8));

    static String readFully(Reader reader) throws IOException {
    try {
      StringWriter writer = new StringWriter();
      char[] buffer = new char[1024];
      int count;
      while ((count = reader.read(buffer)) != -1) {
        writer.write(buffer, 0, count);
      }
      return writer.toString();
    } finally {
      reader.close();
    }
}
```

- #### 效果

> xiamin@xiamin:~/AndroidStudioProjects/KeepGank$ adb shell
> shell@A37:/ cd /sdcard/Android/data/com.jerey.keepgank/cache/xiamin
> shell@A37:/sdcard/Android/data/com.jerey.keepgank/cache/xiamin $ ls
> 32190eac33f22c640d3344af0bc3cf20.0 journal
> shell@A37:/sdcard/Android/data/com.jerey.keepgank/cache/xiamin cat 32190eac33f22c640d3344af0bc3cf20.0                                    
> test1
> shell@A37:/sdcard/Android/data/com.jerey.keepgank/cache/xiamin
>
> shell@A37:/sdcard/Android/data/com.jerey.keepgank/cache/xiamin cat journal    
> libcore.io.DiskLruCache 1 1 1
>
> DIRTY 32190eac33f22c640d3344af0bc3cf20
> CLEAN 32190eac33f22c640d3344af0bc3cf20 0
> shell@A37:/sdcard/Android/data/com.jerey.keepgank/cache/xiamin $


我们通过Adb shell进入手机查看,的确查看到了在/sdcard/Android/data/com.jerey.keepgank/cache/xiamin 目录下，存在journal文件与32190eac33f22c640d3344af0bc3cf20.0 文件，经过cat该文件，的确看到了我们写入的test1.

此时，已经证实了我们上面说的，以文件的形式存储数据。现在该我们一窥他是怎么干的了。

## 重要方法

### DiskLruCache.open

``` java
   public static DiskLruCache open(File directory, int appVersion, int valueCount, long maxSize)
            throws IOException {
        if (maxSize <= 0) {
            throw new IllegalArgumentException("maxSize <= 0");
        }
        if (valueCount <= 0) {
            throw new IllegalArgumentException("valueCount <= 0");
        }

        // If a bkp file exists, use it instead.
        // 首先检查存不存在journal.bkp（journal的备份文件）
        File backupFile = new File(directory, JOURNAL_FILE_BACKUP);
        //如果存在：然后检查journal文件是否存在，如果正主在，bkp文件就可以删除了。
        if (backupFile.exists()) {
            log("backupFile.exists() 存在");
            File journalFile = new File(directory, JOURNAL_FILE);
            // If journal file also exists just delete backup file.
            if (journalFile.exists()) {
                backupFile.delete();
            } else { //如果不存在，将bkp文件重命名为journal文件。
                log("不存在，将bkp文件重命名为journal文件");
                renameTo(backupFile, journalFile, false);
            }
        }

        // Prefer to pick up where we left off.
        DiskLruCache cache = new DiskLruCache(directory, appVersion, valueCount, maxSize);
        // 判断journal文件是否存在, 若存在,读取journal文件
        if (cache.journalFile.exists()) {
            log("journal文件是存在");
            try {
                //若存在
                cache.readJournal();
                cache.processJournal();
                return cache;
            } catch (IOException journalIsCorrupt) {
                System.out
                        .println("DiskLruCache "
                                + directory
                                + " is corrupt: "
                                + journalIsCorrupt.getMessage()
                                + ", removing");
                cache.delete();
            }
        }

        // Create a new empty cache.
        //如果不存在
        //创建directory；重新构造disklrucache；调用rebuildJournal建立journal文件
        log("journal文件是不存在 新构造disklrucache；调用rebuildJournal建立journal文件");
        directory.mkdirs();
        cache = new DiskLruCache(directory, appVersion, valueCount, maxSize);
        cache.rebuildJournal();
        //经过open以后，journal文件肯定存在了；lruEntries里面肯定有值了；size存储了当前所有的实体占据的容量；
        return cache;
    }
```

### mDiskLruCache.edit("xiamin");

``` java
    private synchronized Editor edit(String key, long expectedSequenceNumber) throws IOException {
        checkNotClosed();
        //首先验证key，可以必须是字母、数字、下划线、横线（-）组成，且长度在1-120之间。
        validateKey(key);
        //然后通过key获取实体，
        Entry entry = lruEntries.get(key);
        if (expectedSequenceNumber != ANY_SEQUENCE_NUMBER && (entry == null
                || entry.sequenceNumber != expectedSequenceNumber)) {
            return null; // Snapshot is stale.
        }
        //若还没有entry,返回一个新的,并存到lru里面
        if (entry == null) {
            entry = new Entry(key);
            lruEntries.put(key, entry);

        } else if (entry.currentEditor != null) {    //若存在,且正在编辑,返回null
            return null; // Another edit is in progress.
        }

        //返回一个editor
        Editor editor = new Editor(entry);
        entry.currentEditor = editor;  //并赋值editor

        // Flush the journal before creating files to prevent file leaks.
        journalWriter.write(DIRTY + ' ' + key + '\n');
        journalWriter.flush();
        return editor;
    }

```

###  mDiskLruCache.get(key);

``` java
    public synchronized Snapshot get(String key) throws IOException {
        checkNotClosed();
        validateKey(key);
        //如果取到的为null，或者readable=false，则返回null
        Entry entry = lruEntries.get(key);
        if (entry == null) {
            return null;
        }

        if (!entry.readable) {
            return null;
        }

        // Open all streams eagerly to guarantee that we see a single published
        // snapshot. If we opened streams lazily then the streams could come
        // from different edits.
        InputStream[] ins = new InputStream[valueCount];
        try {
            for (int i = 0; i < valueCount; i++) {
                ins[i] = new FileInputStream(entry.getCleanFile(i));
            }
        } catch (FileNotFoundException e) {
            // A file must have been deleted manually!
            for (int i = 0; i < valueCount; i++) {
                if (ins[i] != null) {
                    Util.closeQuietly(ins[i]);
                } else {
                    break;
                }
            }
            return null;
        }

        redundantOpCount++;
        //写入一条READ语句。
        journalWriter.append(READ + ' ' + key + '\n');
        if (journalRebuildRequired()) {
            executorService.submit(cleanupCallable);
        }
        //然后getInputStream就是返回该FileInputStream了。
        return new Snapshot(key, entry.sequenceNumber, ins, entry.lengths);
    }
```

### 结语

DiskLruCache其实封装了一个Editor和一个Snapshot帮我们写和读文件，内部构建一个靠谱的稳定的读写框架。<br>
虽然事情简单，但逻辑还是很复杂的。源码可以下载下来看看。<br>
我复制过来加了注释的，里面加了一些Debug的log和注释。有兴趣的可以看看。<br>
[https://github.com/Jerey-Jobs/KeepGank/tree/master/lrucache/src/main/java/com/jerey/lruCache](https://github.com/Jerey-Jobs/KeepGank/tree/master/lrucache/src/main/java/com/jerey/lruCache)

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
