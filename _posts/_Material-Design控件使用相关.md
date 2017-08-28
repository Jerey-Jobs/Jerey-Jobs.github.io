- ###app:layout_collapseMode属性，默认是off
CollapsingToolbarLayout的子布局有3种折叠模式（Toolbar中设置的app:layout_collapseMode）

1. off：这个是默认属性，布局将正常显示，没有折叠的行为。
2. pin：CollapsingToolbarLayout折叠后，此布局将固定在顶部。
3. parallax：CollapsingToolbarLayout折叠时，此布局也会有视差折叠效果。

- ###  app:contentScrim="@color/colorPrimary"属性
设置后，折叠上去后颜色会变成该颜色。

- app:layout_scrollFlags="scroll|enterAlways"
scroll代表向上滚动，消失
enterAlways 代表优先滚动
