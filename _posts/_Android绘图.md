Paint.setStyle(Style style) 设置绘制模式 FILL STROKE FILL_AND_STROKE
paint.setColor(Color.parseColor("#009688")); 设置颜色
Paint.setStrokeWidth(float width) 设置线条宽度
paint.setStrokeCap 设置线条头部,圆头 (ROUND)、平头 (BUTT) 和方头 (SQUARE) 
setStrokeJoin(Paint.Join join) 设置拐角的形状。有三个值可以选择：MITER 尖角、 BEVEL 平角和 ROUND 圆角。默认为 MITER。
Paint.setTextSize(float textSize) 设置文字大小
Paint.setAntiAlias(boolean aa) 设置抗锯齿开关
paint.setShader(Shader shader) 设置 Shader
paint.setShadowLayer(float radius, float dx, float dy, int shadowColor) 在之后的绘制内容下面加一层阴影。
paint.setMaskFilter 设置的是在绘制层上方的附加效果。
MaskFilter:
BlurMaskFilter:模糊绘制
EmbossMaskFilter:浮雕效果的 MaskFilter。


canvas.drawCircle(300, 300, 200, paint);  画圆
canvas.drawRect(700, 100, 1100, 500, paint);  画矩形
canvas.drawOval(400, 50, 700, 200, paint);   画椭圆
canvas.drawLine(200, 200, 800, 500, paint);  画线
canvas.drawRoundRect(100, 100, 500, 300, 50, 50, paint);  画圆角矩形
canvas.drawPoint(50, 50, paint);     画点
canvas.drawArc(200, 100, 800, 500, -110, 100, true, paint); // 绘制扇形 
drawPath(Path path, Paint paint) 画自定义图形
drawBitmap(Bitmap bitmap, float left, float top, Paint paint) 画 Bitmap
drawText(String text, float x, float y, Paint paint) 绘制文字



Path 方法类:
path.addCircle(float x, float y, float radius, Direction dir) 添加圆
path.addOval(float left, float top, float right, float bottom, Direction dir) / addOval(RectF oval, Direction dir) 添加椭圆
path.addRect(float left, float top, float right, float bottom, Direction dir) / addRect(RectF rect, Direction dir) 添加矩形
path.addRoundRect(RectF rect, float rx, float ry, Direction dir) / addRoundRect(float left, float top, float right, float bottom, float rx, float ry, Direction dir) / addRoundRect(RectF rect, float[] radii, Direction dir) / addRoundRect(float left, float top, float right, float bottom, float[] radii, Direction dir) 添加圆角矩形
path.addPath(Path path) 添加另一个 Path
path.xxxTo() ——画线（直线或曲线）
path.lineTo(float x, float y) / rLineTo(float x, float y) 画直线
path.quadTo(float x1, float y1, float x2, float y2) / rQuadTo(float dx1, float dy1, float dx2, float dy2) 画二次贝塞尔曲线
path.cubicTo(float x1, float y1, float x2, float y2, float x3, float y3) / rCubicTo(float x1, float y1, float x2, float y2, float x3, float y3) 画三次贝塞尔曲线
path.moveTo(float x, float y) / rMoveTo(float x, float y) 移动到目标位置
path.close() 封闭当前子图形
path..setFillType(Path.FillType ft) 设置填充方式
setDither(boolean dither) 设置图像的抖动。paint.setDither(true); 只要加这么一行代码，之后的绘制就是加抖动的了。
setFilterBitmap(boolean filter)  图像在放大绘制的时候，默认使用的是最近邻插值过滤，这种算法简单，但会出现马赛克现象；而如果开启了双线性过滤，就可以让结果图像显得更加平滑
setPathEffect(PathEffect effect) 使用 PathEffect 来给图形的轮廓设置效果 比如虚线等



Shader:
LinearGradient 线性渐变
RadialGradient 辐射渐变 辐射渐变很好理解，就是从中心向周围辐射状的渐变
SweepGradient 扫描渐变
BitmapShader 用 Bitmap 来着色
ComposeShader 混合着色器 所谓混合，就是把两个 Shader 一起使用。


PathEffect:
CornerPathEffect 把所有拐角变成圆角
DiscretePathEffect 把线条进行随机的偏离，让轮廓变得乱七八糟。乱七八糟的方式和程度由参数决定
DashPathEffect 使用虚线来绘制线条。
PathDashPathEffect 这个方法比 DashPathEffect 多一个前缀 Path ，所以顾名思义，它是使用一个 Path 来绘制「虚线」
SumPathEffect 就是分别按照两种 PathEffect 分别对目标进行绘制。
ComposePathEffect 这也是一个组合效果类的 PathEffect 。不过它是先对目标 Path 使用一个 PathEffect，然后再对这个改变后的 Path 使用另一个 PathEffect。
