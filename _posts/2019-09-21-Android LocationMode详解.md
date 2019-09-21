---
title: Android LocationMode 详解
subtitle: 位置信息的演变,以及Q适配
tags:
  - Android
grammar_cjkRuby: true
catalog: true
layout:  post
header-img: "img/post-bg-e2e-ux.jpg"
preview-img: "/img/post1/location_mode.png"
categories: Android
date: 2019-09-21
---

在平时开发应用中, 有时候需要网络定位, 那么就会涉及到LocationMode. 有时候需要搜索周围的wifi, 那么也需要了解LocationMode. 大家都知道, 搜索wifi相关的, 需要申请Locaion相关权限, 而在最新的Android Q上, 申请权限不顶用了, 还必须打开位置信息才可以. 不然是无法搜索的.

### 什么是LocationMode以及如何获取LocationMode

LocationMode即是定位模式, 让人不禁想起来了系统设置中, 那三个瞩目的模式:


![](/img/post1/location_mode.png)

 - 高精确度:  使用GPS、WLAN和移动网络
 - 低耗电量: 使用WLAN和移动网络 (只使用WIFI和基站定位，需要WIFI或者基站才行，室内效果好。)
 - 仅限设备: 仅使用GPS (不依赖WIFI和基站，室内效果差，户外可靠性好)


不过我们会只关心, 如何获取当前系统是哪个模式呢?
```
Settings.Secure.getInt(getContentResolver(), Settings.Secure.LOCATION_MODE,
                Settings.Secure.LOCATION_MODE_OFF)
```

这个就比较简单了.
- 返回值是0 的时候, 就是 LOCATION_MODE_OFF 这个宏 <br>
- 返回值为1的时候  就是 LOCATION_MODE_SENSORS_ONLY 就是上面的仅限设备GPS
- 返回值是2, 就是 LOCATION_MODE_BATTERY_SAVING  低耗电量
- 返回值为3, 就是 LOCATION_MODE_HIGH_ACCURACY 仅限设备

可以直接用这个宏来判断.

不过如果有朋友看源码, 就会发现, 这三个宏都已经被标记为了 Deprecated. 系统推荐使用以下接口来获取
```
LocationManager#isProviderEnabled(String)

判断GPS是否打开:
locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)

判断网络定位:
locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)

```

那么为什么呢?

### 系统中的LocationMode
历史非常简单, 在以前, 系统底层是通过 Settings.Secure.LOCATION_MODE 这个值来进行切换模式的.
即, 若用户修改了LocationMode, 我们去dump系统设置里面的值, 会发现这个值会变.

执行以下命令:
```
adb shell dumpsys settings | grep location_mode
```

会发现, 能够获取到当前系统的mode值, 如果你是Android P级别的手机, 你会发现, 有可能dump不出来了. 即使改变location_mode, 也无法看到这个值, 但是代码getInt的时候能够获取到, 这是为什么呢?

我们dump  location_providers_allowed就可以看到了, 执行
```
adb shell dumpsys settings | grep location_providers_allowed
```

会发现, 这个值会跟着我们LocationMode的变化而变.

这个原理是. 在SettingsProvider里面, 设置值的代码里有一段Hardcode,

代码路径: frameworks/base/core/java/android/provider/Settings.java
``` java
设置
/** @hide */
public static boolean putStringForUser(@NonNull ContentResolver resolver,
        @NonNull String name, @Nullable String value, @Nullable String tag,
        boolean makeDefault, @UserIdInt int userHandle) {
    if (LOCATION_MODE.equals(name)) {
        // Map LOCATION_MODE to underlying location provider storage API
        return setLocationModeForUser(resolver, Integer.parseInt(value), userHandle);
    }
    if (MOVED_TO_GLOBAL.contains(name)) {
        Log.w(TAG, "Setting " + name + " has moved from android.provider.Settings.Secure"
                + " to android.provider.Settings.Global");
        return Global.putStringForUser(resolver, name, value,
                tag, makeDefault, userHandle);
    }
    return sNameValueCache.putStringForUser(resolver, name, value, tag,
            makeDefault, userHandle);
}

获取
/** @hide */
public static int getIntForUser(ContentResolver cr, String name, int def, int userHandle) {
    if (LOCATION_MODE.equals(name)) {
        // Map from to underlying location provider storage API to location mode
        return getLocationModeForUser(cr, userHandle);
    }
    String v = getStringForUser(cr, name, userHandle);
    try {
        return v != null ? Integer.parseInt(v) : def;
    } catch (NumberFormatException e) {
        return def;
    }
}

```

因为这个设计, 导致其实往系统写入Location_mode 其实写的是 location_providers_allowed 值

这段代码非常的垃圾, 但是就是在Android framework存在了5年, 直到19年Android Q里, 这段代码被移除了.
而正是这段代码的移除, 表明了Google新的定位管理的到来.

在Android Q中, Location mode彻底被废弃了. 用户不再存在 高精确度/低耗电量/仅限设备 一说, 只能开关, 当开启后, 即为高精确度, 关闭后, 即为0, off.

那么有人会问, 那不开启一直耗电了么? 如何省电.

### Google的位置权限管理应用
如果您的手机升级了Android Q, 就可以看到, 在Android Q上, 有点抄袭了苹果的感觉, 在位置信息的界面, 给每个应用进行了位置权限管理, 并且对每个应用的权限精确到 "总是允许" "仅在使用应用时允许" "询问" "拒绝".

有了这个权限管理, 我们不必再担心某个应用拥有了定位权限后一直定位, 也不需要担心耗电了.

这就是最新的位置信息管理.


而位置信息, 现在已经变成了很多功能的必备权限, 由于Android Q增加了限制, 会发现很多应用起来后要求打开位置信息, 若不做判断, 会引起兼容性问题, 希望有相关权限使用的开发者注意这一点的适配.
