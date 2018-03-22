---
title: Android8.0 Fragment变化之setTargetFragment
tags:
  - Android
grammar_cjkRuby: true
catalog: true
layout:  post
header-img: "img/post-bg-miui6.jpg"
preview-img: "/img/post1/fragment-exception.png"
categories: Android
date: 2018-03-22
---

此问题源于一个FATAL异常：
```
AndroidRuntime: FATAL EXCEPTION: main
AndroidRuntime: Process: com.android.settings, PID: 3449
AndroidRuntime: java.lang.IllegalStateException: Fragment RunningServiceDetails{3b9137f #4 id=0x100b0002 com.android.settings.applications.RunningServiceDetails} declared target fragment RunningApplicationsFragment{2d46d8c #2 id=0x100b0000 2131887823} that does not belong to this FragmentManager!
AndroidRuntime: 	at android.app.FragmentManagerImpl.moveToState(FragmentManager.java:1212)
AndroidRuntime: 	at android.app.FragmentManagerImpl.addAddedFragments(FragmentManager.java:2407)
AndroidRuntime: 	at android.app.FragmentManagerImpl.executeOpsTogether(FragmentManager.java:2186)
AndroidRuntime: 	at android.app.FragmentManagerImpl.removeRedundantOperationsAndExecute(FragmentManager.java:2142)
AndroidRuntime: 	at android.app.FragmentManagerImpl.execPendingActions(FragmentManager.java:2043)
AndroidRuntime: 	at android.app.FragmentManagerImpl$1.run(FragmentManager.java:719)
AndroidRuntime: 	at android.os.Handler.handleCallback(Handler.java:790)
AndroidRuntime: 	at android.os.Handler.dispatchMessage(Handler.java:99)
AndroidRuntime: 	at android.os.Looper.loop(Looper.java:164)
AndroidRuntime: 	at android.app.ActivityThread.main(ActivityThread.java:6601)
AndroidRuntime: 	at java.lang.reflect.Method.invoke(Native Method)
AndroidRuntime: 	at com.android.internal.os.RuntimeInit$MethodAndArgsCaller.run(RuntimeInit.java:518)
AndroidRuntime: 	at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:822)
ActivityManager:   Force finishing activity com.android.settings/.MainSettings
```

看异常信息为：申明的target Fragment 不属于当前的FragmentManager，然而在N上以及N以下都没有这个问题，我们看一下该异常是由哪边报的：

FragmentManager中：
``` java
f.mHost = mHost;
f.mParentFragment = mParent;
f.mFragmentManager = mParent != null
        ? mParent.mChildFragmentManager : mHost.getFragmentManagerImpl();

// If we have a target fragment, push it along to at least CREATED
// so that this one can rely on it as an initialized dependency.
if (f.mTarget != null) {
    if (mActive.get(f.mTarget.mIndex) != f.mTarget) {
        throw new IllegalStateException("Fragment " + f
                + " declared target fragment " + f.mTarget
                + " that does not belong to this FragmentManager!");
    }
    if (f.mTarget.mState < Fragment.CREATED) {
        moveToState(f.mTarget, Fragment.CREATED, 0, 0, true);
    }
}
```

通过git blame 看一下这块代码的提交：
> git blame core/java/android/app/FragmentManager.java

```
ab209a63a286 (Adam Powell      2017-01-26 14:14:34 -0800 1204)
ab209a63a286 (Adam Powell      2017-01-26 14:14:34 -0800 1205)  // If we have a target fragment, push it along to at least CREATED
ab209a63a286 (Adam Powell      2017-01-26 14:14:34 -0800 1206)  // so that this one can rely on it as an initialized dependency.
ab209a63a286 (Adam Powell      2017-01-26 14:14:34 -0800 1207)  if (f.mTarget != null) {
838166d3e6f8 (George Mount     2017-03-23 14:23:29 -0700 1208)      if (mActive.get(f.mTarget.mIndex) != f.mTarget) {
ab209a63a286 (Adam Powell      2017-01-26 14:14:34 -0800 1209)          throw new IllegalStateException("Fragment " + f
ab209a63a286 (Adam Powell      2017-01-26 14:14:34 -0800 1210)                  + " declared target fragment " + f.mTarget
ab209a63a286 (Adam Powell      2017-01-26 14:14:34 -0800 1211)                  + " that does not belong to this FragmentManager!");
ab209a63a286 (Adam Powell      2017-01-26 14:14:34 -0800 1212)      }
ab209a63a286 (Adam Powell      2017-01-26 14:14:34 -0800 1213)      if (f.mTarget.mState < Fragment.CREATED) {
ab209a63a286 (Adam Powell      2017-01-26 14:14:34 -0800 1214)          moveToState(f.mTarget, Fragment.CREATED, 0, 0, true);
ab209a63a286 (Adam Powell      2017-01-26 14:14:34 -0800 1215)      }
ab209a63a286 (Adam Powell      2017-01-26 14:14:34 -0800 1216)  }
```

> git log ab209a63a286

可以看到：

```
commit ab209a63a286ffb0ee57e884986839fa25d583ca
Author: Adam Powell <adamp@google.com>
Date:   Thu Jan 26 14:14:34 2017 -0800

    Lifecycle guarantees for target fragments

    Ported from frameworks/support change id
    I824eb312fbdfd6b548fe94aa2cd5b03afbaa97c7

    When a target fragment was set using Fragment#setTargetFragment, all
    bets were off, especially when restoring from instance state. Order of
    lifecyle initialization was undefined meaning that two bugs could
    occur, both of which manifested as the target fragment was not
    initialized by the time the referring fragment's onCreate ran. One
    could happen if the target fragment is on the back stack, the other
    could happen if the target fragment was ordered unfortunately in
    FragmentManager implementation details. (!)

    Fix both by guaranteeing that any target fragment gets pushed forward
    to at least the CREATED state before we dispatch any lifecycle events
    for the referring fragment.

    Add some sanity checks that try to keep developers from setting target
    fragments across different FragmentManagers or from creating target
    cycles, both of which are bad ideas.

    Bug: 33653458
    Test: CTS FragmentLifecycleTest
    Change-Id: If624d4665d29e205d37b9b384322e64d6d6d3615

```

再看一下该change到底修改了什么
> git show ab209a63a286ffb0ee57e884986839fa25d583ca

``` java
diff --git a/core/java/android/app/Fragment.java b/core/java/android/app/Fragment.java
index 73b96f1ba16..612998dd515 100644
--- a/core/java/android/app/Fragment.java
+++ b/core/java/android/app/Fragment.java
@@ -762,6 +762,24 @@ public class Fragment implements ComponentCallbacks2, OnCreateContextMenuListene
      * are going to call back with {@link #onActivityResult(int, int, Intent)}.
      */
     public void setTargetFragment(Fragment fragment, int requestCode) {
+        // Don't allow a caller to set a target fragment in another FragmentManager,
+        // but there's a snag: people do set target fragments before fragments get added.
+        // We'll have the FragmentManager check that for validity when we move
+        // the fragments to a valid state.
+        final FragmentManager mine = getFragmentManager();
+        final FragmentManager theirs = fragment.getFragmentManager();
+        if (mine != null && theirs != null && mine != theirs) {
+            throw new IllegalArgumentException("Fragment " + fragment
+                    + " must share the same FragmentManager to be set as a target fragment");
+        }
+
+        // Don't let someone create a cycle.
+        for (Fragment check = fragment; check != null; check = check.getTargetFragment()) {
+            if (check == this) {
+                throw new IllegalArgumentException("Setting " + fragment + " as the target of "
+                        + this + " would create a target cycle");
+            }
+        }
         mTarget = fragment;
         mTargetRequestCode = requestCode;
     }
diff --git a/core/java/android/app/FragmentManager.java b/core/java/android/app/FragmentManager.java
index 44f1322f4b4..32cf1c341b4 100644
--- a/core/java/android/app/FragmentManager.java
+++ b/core/java/android/app/FragmentManager.java
@@ -1110,10 +1110,25 @@ final class FragmentManagerImpl extends FragmentManager implements LayoutInflate
                                 }
                             }
                         }
+
                         f.mHost = mHost;
                         f.mParentFragment = mParent;
                         f.mFragmentManager = mParent != null
                                 ? mParent.mChildFragmentManager : mHost.getFragmentManagerImpl();
+
+                        // If we have a target fragment, push it along to at least CREATED
+                        // so that this one can rely on it as an initialized dependency.
+                        if (f.mTarget != null) {
+                            if (!mActive.contains(f.mTarget)) {
+                                throw new IllegalStateException("Fragment " + f
+                                        + " declared target fragment " + f.mTarget
+                                        + " that does not belong to this FragmentManager!");
+                            }
+                            if (f.mTarget.mState < Fragment.CREATED) {
+                                moveToState(f.mTarget, Fragment.CREATED, 0, 0, true);
+                            }
+                        }
+
                         dispatchOnFragmentPreAttached(f, mHost.getContext(), false);
                         f.mCalled = false;
                         f.onAttach(mHost.getContext());
(END)

```

我们看到只修改了setTargetFragment，并增加了一个检查，看样子Google在对Fragment的setTargetFragment使用增加限制

我们先看上述问题的原因：

我们在启动Fragment之前给其设置了`TargetFragment`，这个参数是用来向上一个Fragment传回数据的。

``` java
fragment1.setTargetFragment(resultTo, resultRequestCode);
```

而当前的页面组成其实是：
有两个FragmentManager。一个里面是SettingsFragment与ApplicationContainer
另一个是ManageApplicationFragment1，另一个是ManageApplicationFragment2，RunningApplicationsFragment1, RunningApplicationsFragment2。

事实上，在我们的UI中，是ApplicationContainer包裹着那四个Fragment的

![dump信息](/img/post1/fragment-exception.png)

此时我们在被包裹着的 RunningApplicationsFragment 中去启动一个新的Fragment，而使用的FragmentManager为Activity的FragmentManager, 且设置TargetFragment为 `RunningApplicationsFragment`这个时候FragmentManager会去检查当前的mActive是否包含了这个Fragment，如果没有，则抛出异常。

那么其实我们通过Debug可以看到，当前的FragmentManager其实只有两个子Fragment，而没有 RunningApplicationsFragment， 因此抛出异常。


因此我们在使用Fragment的时候要考虑到现在的O对Fragment增加了使用限制，不再能够随意的嵌套嵌套嵌套，再设置不同的FragmentManager里面的Fragment为targetFragment了
