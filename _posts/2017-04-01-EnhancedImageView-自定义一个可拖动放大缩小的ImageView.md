---
title: EnhancedImageView-自己实现一个带有放大缩小效果的图片预览效果的自定义View
tags:
  - View
grammar_cjkRuby: true
header-img: "img/post-bg-e2e-ux.jpg"
layout:  post
catalog: true
---


## [EnhancedImageView](https://github.com/Jerey-Jobs/EnhancedImageView)

一个增强的自定义ImageView,具备手势放大缩小等功能,主要原理的是 `Matrix` + `ScaleGestureDetector` + `GestureDetector` 进行对图片进行移动与裁剪


![](/img/post1/enhance_imageview.gif)

-------------------
### 目前功能有
- 单指滑动 (onTouch)
- 多指滑动 (onTouch)
- 双击放大(GestureDetector onDoubleTap)
- 放大状态双击恢复
- 自由手势放大 (ScaleGestureDetector.OnScaleGestureListener)
- 解决与ViewPager滑动冲突<br>
  冲突原因:ViewPager屏蔽了子View的左右移动事件 <br>
  解决:在放大状态下: getParent().requestDisallowInterceptTouchEvent(true);

只是做了上面那些功能, 但是比如滑动时的惯性效果, 以及缩小到比初始状态还小时的动画恢复等, 都没有做. 正常情况下使用的是Github上体验比较棒的 [PinchImageView](https://github.com/boycy815/PinchImageView)

### 难点

1. 在拖动时,边界控制,需要每次触摸后都要判断 `RectF`里面的参数情况
2. 放大缩小时的中心点处理

细节很多,需要考虑的东西很多.



----------
本文作者：Anderson/Jerey_Jobs

博客地址   ： [夏敏的博客/Anderson大码渣/Jerey_Jobs][1] <br>
简书地址   :  [Anderson大码渣][2] <br>
github地址 :  [Jerey_Jobs][3]



[1]: http://jerey.cn/
[2]: http://www.jianshu.com/users/016a5ba708a0/latest_articles
[3]: https://github.com/Jerey-Jobs
