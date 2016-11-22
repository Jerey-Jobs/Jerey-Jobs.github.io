---
title: 奇技淫巧之-Android监听键盘弹出与隐藏事件
---

相信看到这个标题，大家都会潜意识觉得：Activity中没有可以复写的方法么？或者说，没有什么listener么?
抱歉，真的没有，我们潜意识都是以为系统会提供，其实系统提供的是我们控制键盘的弹出和隐藏，而不是键盘弹出和隐藏触发我们的事件。

### 正题
**好了，进入正题，如何监听键盘的弹出和隐藏呢？**
1. 目前通用的方法是，由于键盘弹起与隐藏，会使得layout的布局发生变化，通过布局的大小变化触发的事件实现键盘事件的触发（该方法的缺点是，当设置为全屏模式时，由于布局强制充满全屏，此时布局大小不会再改变，该方法也就失效了。至少我这边是这样的 ->_-> ）
我们可以复写一个ViewGroup的onSizeChanged方法，然后我们的根布局就是这个AdjustSizeLinearLayout，此时当键盘弹起会触发我们的监听器。

``` java
import android.content.Context;
import android.util.AttributeSet;
import android.util.Log;
import android.widget.LinearLayout;

public class AdjustSizeLinearLayout extends LinearLayout{

    public AdjustSizeLinearLayout(Context context) {
        super(context);
    }

    public AdjustSizeLinearLayout(Context context, AttributeSet attrs,
            int defStyle) {
        super(context, attrs, defStyle);
    }

    public AdjustSizeLinearLayout(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    private int mChangeSize = 200;

    @Override
    protected void onSizeChanged(int w, int h, int oldw, int oldh) {
        super.onSizeChanged(w, h, oldw, oldh);
        
        Log.e("###xiamin", "change" + w + " " + h + " " + oldw + " " + oldh);
        if (oldw == 0 || oldh == 0)
            return;

        if (boardListener != null) {
            if (oldw != 0 && h - oldh < -mChangeSize) {
                Log.e("###xiamin","键盘弹出"+  "change" + w + " " + h + " " + oldw + " " + oldh);
                ToastUtils.showToast(getContext(), "键盘弹出");
                boardListener.keyBoardVisable(Math.abs(h - oldh));
            }

            if (oldw != 0 && h - oldh > mChangeSize) {
                ToastUtils.showToast(getContext(), "键盘下去");
                Log.e("###xiamin","键盘结束"+  "change" + w + " " + h + " " + oldw + " " + oldh);
                boardListener.keyBoardInvisable(Math.abs(h - oldh));
            }
        }
    }

    public interface SoftkeyBoardListener {

        public void keyBoardVisable(int move);

        public void keyBoardInvisable(int move);
    }

    SoftkeyBoardListener boardListener;

    public void setSoftKeyBoardListener(SoftkeyBoardListener boardListener) {
        this.boardListener = boardListener;
    }
}
```

2. 该方法来自于github，

[KeyboardChangeListener][1]

使用简单

``` java
make activity:
	android:windowSoftInputMode="adjustResize"
java:
 new KeyboardChangeListener(this).setKeyBoardListener(new KeyboardChangeListener.KeyBoardListener() {
            @Override
            public void onKeyboardChange(boolean isShow, int keyboardHeight) {
                Log.d(TAG, "isShow = [" + isShow + "], keyboardHeight = [" + keyboardHeight + "]");
            }
        });
```
虽然不是根据布局大小变化来判断的，但是根据ViewTreeObserver.OnGlobalLayoutListener，

``` java
    @Override
    public void onGlobalLayout() {
        int currHeight = mContentView.getHeight();
        if (currHeight == 0) {
            Log.i(TAG, "currHeight is 0");
            return;
        }
        boolean hasChange = false;
        if (mPreHeight == 0) {
            mPreHeight = currHeight;
            mOriginHeight = currHeight;
        } else {
            if (mPreHeight != currHeight) {
                hasChange = true;
                mPreHeight = currHeight;
            } else {
                hasChange = false;
            }
        }
        if (hasChange) {
            boolean isShow;
            int keyboardHeight = 0;
            if (mOriginHeight == currHeight) {
                //hidden
                isShow = false;
            } else {
                //show
                keyboardHeight = mOriginHeight - currHeight;
                isShow = true;
            }

            if (mKeyBoardListen != null) {
                mKeyBoardListen.onKeyboardChange(isShow, keyboardHeight);
            }
        }
    }
```


 ----------
 ### 谢谢大家阅读，如有帮助，来个喜欢或者关注吧！

 ----------
 本文作者：Anderson/Jerey_Jobs

 简书地址：[Anderson大码渣][2]

 github地址：[Jerey_Jobs][3]


  [1]: https://github.com/yescpu/KeyboardChangeListener
  [2]: http://www.jianshu.com/users/016a5ba708a0/latest_articles
  [3]: https://github.com/Jerey-Jobs

