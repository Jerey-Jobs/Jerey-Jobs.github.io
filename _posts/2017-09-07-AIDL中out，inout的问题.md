---
title: AIDL中参数的out,inout问题
tags:
  - AIDL
grammar_cjkRuby: true
header-img: "img/bg-mountain.jpg"
preview-img: "/img/preview/aidl.jpg"
catalog: true
layout:  post
categories: AIDL
date: 2017-09-07
---

在AIDL传输过程中，我们有时需要传递自定义的类型，当然网上有很多教程，要把这个类型`implements Parcelable`,再写个aidl文件声明一下。

如下便是我们自定义一个InfoBean类来供AIDL传输。

``` java
public class InfoBean implements Parcelable {
    String name;
    String score;

    public InfoBean() {

    }

    protected InfoBean(Parcel in) {
        name = in.readString();
        score = in.readString();
    }

    public static final Creator<InfoBean> CREATOR = new Creator<InfoBean>() {
        @Override
        public InfoBean createFromParcel(Parcel in) {
            return new InfoBean(in);
        }

        @Override
        public InfoBean[] newArray(int size) {
            return new InfoBean[size];
        }
    };

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel parcel, int i) {
        parcel.writeString(name);
        parcel.writeString(score);
    }
}

```

aidl申明
```
package com.jerey.aidl_test;
parcelable InfoBean;
```

aidl文件使用   
``` java
// IMyAidlInterface.aidl
package com.jerey.aidl_test;

// Declare any non-default types here with import statements
import com.jerey.aidl_test.InfoBean;

interface IMyAidlInterface {
    void setInfo1(in InfoBean info);
    void setInfo2(in InfoBean info);
    void setInfo3(in InfoBean info);
}
```

写到这边我们build一下，ok，成功了。

### out，inout
可以看到，我们的的`AIDLInterface`里面给InfoBean前面加了`in`，代表这个参数是传入参数。我们可以去Google官方文档看看这个参数的意思。     

>All non-primitive parameters require a directional tag indicating which way the data goes. Either in, out, or inout (see the example below).<br>
Primitives are in by default, and cannot be otherwise.<br>
Caution: You should limit the direction to what is truly needed, because marshalling parameters is expensive.

翻译过来就是:所有非基本参数都需要一个方向标签，指示数据以哪种方式传递，有in，out，inout<br>
默认情况下，基本类型是默认是in，不可以使用其他类型<br>
注意：您应该将方向限制在真正需要的范围内，因为给参数编组的代价是很大的。

在简书看过另一位同学认为这边的way不是方式方向的意思，而我认为这边就是这个意思，因为基本类型本身就只能作为传入参数，没有什么语言基本数据的形参还能作为传出参数的吧。

那么我们现在要把`IMyAidlInterface`里面的参数改变一下了。
```
interface IMyAidlInterface {
    void setInfo1(in InfoBean info);
    void setInfo2(out InfoBean info);
    void setInfo3(inout InfoBean info);
}
```

好了，rebuild。

咦，怎么编译不过了。。。，错误为
```
Error:(148, 5) 错误: 找不到符号
符号:   方法 readFromParcel(Parcel)
位置: 类型为InfoBean的变量 info
```

我们追到AIDL生成的java文件中看。
``` java
@Override public void setInfo2(com.jerey.aidl_test.InfoBean info) throws android.os.RemoteException
{
android.os.Parcel _data = android.os.Parcel.obtain();
android.os.Parcel _reply = android.os.Parcel.obtain();
try {
_data.writeInterfaceToken(DESCRIPTOR);
mRemote.transact(Stub.TRANSACTION_setInfo2, _data, _reply, 0);
_reply.readException();
if ((0!=_reply.readInt())) {
info.readFromParcel(_reply);
}
}
```

可以看到在`setInfo2`后，调用了`info`的`readFromParcel`方法, 可是我们上面写`Parcelable`接口的时候只有`writeToParcel`方法，没有read方法啊。

这是AS坑爹的地方了，其是生成代码模板，并没有那么智能，我们需要手写这个readFromParcel方法来完成类从Parcel数据生成的动作。

我们编写一下,中间的read其实就是把构造函数的代码copy过来。
```
public void readFromParcel(Parcel in) {
    name = in.readString();
    score = in.readString();
}
```

rebuild,OK

接下来写服务端和调用端吧
``` java
public class AIDLService extends Service {
    public static final String TAG = AIDLService.class.getSimpleName();

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return new MyInterface();
    }

    class MyInterface extends IMyAidlInterface.Stub {

        @Override
        public void setInfo1(InfoBean info) throws RemoteException {
            Log.i(TAG, "setInfo1: " + info.toString());
            info.name = "hello1";
            info.score = "11.11";
        }

        @Override
        public void setInfo2(InfoBean info) throws RemoteException {
            Log.i(TAG, "setInfo2: " + info.toString());
            info.name = "hello2";
            info.score = "22.22";
        }

        @Override
        public void setInfo3(InfoBean info) throws RemoteException {
            Log.i(TAG, "setInfo3: " + info.toString());
            info.name = "hello3";
            info.score = "33.33";
        }
    }
}
```

使用端，我们每次将参数传入前打印一下，调用后再打印一下。

``` java
public class MainActivity extends AppCompatActivity {
    public static final String TAG = MainActivity.class.getSimpleName();

    IMyAidlInterface mIMyAidlInterface;
    private ServiceConnection mServiceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName componentName, IBinder iBinder) {
            Log.w(TAG, "onServiceConnected: ");
            mIMyAidlInterface = IMyAidlInterface.Stub.asInterface(iBinder);
            try {
                InfoBean infoBean1 = new InfoBean("jerey1", "99.99");
                Log.w(TAG, "onServiceConnected: InfoBean1" + infoBean1);
                mIMyAidlInterface.setInfo1(infoBean1);
                Log.w(TAG, "onServiceConnected: InfoBean1" + infoBean1);

                InfoBean infoBean2 = new InfoBean("jerey2", "99.99");
                Log.w(TAG, "onServiceConnected: InfoBean2" + infoBean2);
                mIMyAidlInterface.setInfo2(infoBean2);
                Log.w(TAG, "onServiceConnected: InfoBean2" + infoBean2);

                InfoBean infoBean3 = new InfoBean("jerey3", "99.99");
                Log.w(TAG, "onServiceConnected: InfoBean3" + infoBean3);
                mIMyAidlInterface.setInfo3(infoBean3);
                Log.w(TAG, "onServiceConnected: InfoBean3" + infoBean3);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        @Override
        public void onServiceDisconnected(ComponentName componentName) {
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Intent i = new Intent(MainActivity.this, AIDLService.class);
        bindService(i, mServiceConnection, BIND_AUTO_CREATE);
    }
}
```

来看结果，怎么三次实验效果是一样的，InfoBean1是传入参数值也被改变了。其实可以看到我们的服务直接bind的，并没有指定跨进程通讯，我们的上面的AIDL的传输根本没走，其实AIDL直接把service强转就返回给我们了。

```
W/MainActivity: onServiceConnected: InfoBean1 name=jerey1 score=99.99
I/AIDLService: setInfo1:  name=jerey1 score=99.99
W/MainActivity: onServiceConnected: InfoBean1 name=hello1 score=11.11
W/MainActivity: onServiceConnected: InfoBean2 name=jerey2 score=99.99
I/AIDLService: setInfo2:  name=jerey2 score=99.99
W/MainActivity: onServiceConnected: InfoBean2 name=hello2 score=22.22
W/MainActivity: onServiceConnected: InfoBean3 name=jerey3 score=99.99
I/AIDLService: setInfo3:  name=jerey3 score=99.99
W/MainActivity: onServiceConnected: InfoBean3 name=hello3 score=33.33
```

所以我们为了使真正的AIDL，还得跨进程啊，所以我们要指定其运行在另一个进程里。

```
<service
    android:name=".AIDLService"
    android:exported="true"
    android:process="com.jerey.process2">
    <intent-filter>
        <action android:name="com.jerey.bindservice"></action>
        <category android:name="android.intent.category.DEFAULT"/>
    </intent-filter>
</service>
```

再次看结果:
``` java
com.jerey.aidl_test:
W/MainActivity: onServiceConnected: InfoBean1 name=jerey1 score=99.99
W/MainActivity: onServiceConnected: InfoBean1 name=jerey1 score=99.99
W/MainActivity: onServiceConnected: InfoBean2 name=jerey2 score=99.99
W/MainActivity: onServiceConnected: InfoBean2 name=hello2 score=22.22
W/MainActivity: onServiceConnected: InfoBean3 name=jerey3 score=99.99
W/MainActivity: onServiceConnected: InfoBean3 name=hello3 score=33.33

com.jerey.process2 :
I/AIDLService: setInfo1:  name=jerey1 score=99.99
I/AIDLService: setInfo2:  name=null score=null
I/AIDLService: setInfo3:  name=jerey3 score=99.99
```

可以看到,`InfoBean1`在传入前与传入后没有发生改变，而`InfoBean2`与`InfoBean3`的值被改变了，而在服务端，由于info是out类型的，所以没有拿到info的值，其值均为null。

到了这里，大家也应该理解 out，inout的用法了。不过说句实话，out还不如直接写为返回值呢，不过有可能有人写的程序需要多个返回参数，这样只能以这种形式来写了。
