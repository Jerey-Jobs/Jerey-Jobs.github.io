---
title: 奇技淫巧之-Android获取系统充电状态
grammar_cjkRuby: true
---

#### 扫盲：sticky broadcast是什么，有什么作用？
中文名：粘性广播 又有人认为是一直不断的发广播，其实不是，想想也知道，一直不断的发广播这种**机制是Google工程师能想出来的机制么。


google官方的解释是：

> Perform a sendBroadcast(Intent) that is "sticky," meaning the Intent you are sending stays around after the broadcast is complete, so that others can quickly retrieve that data through the return value of registerReceiver(BroadcastReceiver, IntentFilter). In all other ways, this behaves the same assendBroadcast(Intent).
> You must hold the BROADCAST_STICKY permission in order to use this API. If you do not hold that permission,SecurityException will be thrown.

大概的意思是说： 发出的广播会一直滞留（等待），以便有人注册这则广播消息后能尽快的收到这条广播。其他功能与sendBroadcast相同。但是使用sendStickyBroadcast 发送广播需要获得BROADCAST_STICKY permission，如果没有这个permission则会抛出异常。


Android系统在发送完broadcast后才被注册的broadcastreceiver无法接收到在注册前发送的broadcast,但是可以接收到该receiver在注册前发送的sticky broadcast.

那么此时我们就知道了，我们的充电状态广播不是一直发的，我们能放心的不做重复判断了。（真的么？事实上还得做重复判断，如果我们想给用户带来良好的体验）

### 如何获取充电状态？


```
private BroadcastReceiver mbatteryReceiver=new BroadcastReceiver()
    {
        public void onReceive(Context context, Intent intent) 
        {
            String action =intent.getAction();
            if(Intent.ACTION_BATTERY_CHANGED.equals(action));
            {
                int status=intent.getIntExtra("status",BatteryManager.BATTERY_STATUS_UNKNOWN);
                if(status==BatteryManager.BATTERY_STATUS_CHARGING){
                    Toast.makeText(getActivity(), "充电中!",Toast.LENGTH_SHORT).show();
                    }
                }
                else{
                    Toast.makeText(getActivity(), "未充电",Toast.LENGTH_SHORT).show();
                }
            }
        }
    };
```

```
mContext.registerReceiver(mbatteryReceiver, new IntentFilter(Intent.ACTION_BATTERY_CHANGED));
unregisterReceiver(mbatteryReceiver);
```

 ----------
 ###谢谢大家阅读，如有帮助，来个喜欢或者关注吧！

 ----------
 本文作者：Anderson/Jerey_Jobs

 简书地址：[Anderson大码渣][1]

 github地址：[Jerey_Jobs][2]
  [1]: http://www.jianshu.com/users/016a5ba708a0/latest_articles
  [2]: https://github.com/Jerey-Jobs
