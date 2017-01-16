---
title: RecylclerView入门初步
tags: Android
grammar_cjkRuby: true
---
 


RecyclerView可以看作是ListView的进化版本，当然RecyclerView并不是继承ListView的，RecyclerView直接继承于ViewGroup父类。RecyclerView的灵活性与可替代性比listview更好，我们可以很方便的使用它完成ListView比较难完成的效果。


  **现在，我们开始学习如何使用它：**

 **- 添加依赖**

  

``` gradle
      compile 'com.android.support:recyclerview-v7:21.0.+'
```

 **- 在xml中配置**

 

``` java
 <android.support.v7.widget.RecyclerView
    android:id="@+id/recyclerView"
    android:layout_height="match_parent"
    android:layout_width="match_parent"
    />
```

 **- Acitvity中使用**
 

``` java
    RecyclerView mRecyclerView;
    RecyclerViewAdapter mAdapter;
    LinearLayoutManager mLayoutManager;
    
    mRecyclerView = (RecyclerView) findViewById(R.id.recyclerView);
    mLayoutManager = new LinearLayoutManager(this);

    //改变方向
    //mLayoutManager.setOrientation(LinearLayoutManager.HORIZONTAL);

    mRecyclerView.setLayoutManager(mLayoutManager);
    //添加间隔行，若不添加该句注释即可 RecycleViewDivider为RecyclerView.ItemDecoration的实现类
    mRecyclerView.addItemDecoration(new RecycleViewDivider(this, LinearLayoutManager.HORIZONTAL));
    mRecyclerView.setItemAnimator(new DefaultItemAnimator());

    mAdapter =  new RecyclerViewAdapter(mdatas);
    mRecyclerView.setAdapter(mAdapter);
```

  可以看到，RecyclerView并不像ListView那样只要设个adpter就完成了，它有很多自己可自定义的功能，可以很方便的完成很多效果。<br>
  比如： mRecyclerView.setLayoutManager(mLayoutManager); 就给了程序员很大的发挥空间，因为有了布局管理，我们可以很方便的设置为<br>
  LinearLayoutManager        线性布局同时支持横向、纵向<br>
  GridLayoutManager时       为网格布局管理器<br>
  StaggeredGridLayoutManager 瀑布式布局管理器<br>

 **- 适配器编写**

 RecycleView是对ListView以及GridView的升级，在使用的时候同源更新需要使用Adapter适配器。但是RecycleView使用的适配器并不是之前的BaseAdapter了。RecycleView使用的适配器需要继承RecyclerView.Adapter\
 
 
我们将适配器的编写流程分为：

1.继承 RecyclerView.Adapter

2.完成内部类 ViewHolder 这个 ViewHolder不再是以前的BaseAdapter时我们写的ViewHolder，而是需要继承RecyclerView.ViewHolder抽象类的ViewHolder

3.编写构造方法

4.onBindViewHolder中进行每个item的操作

5.若需要监听点击事件，我们需要定义回调接口，并在第四步进行item的view操作时，添加监听事件回掉该接口

以下便是我的RecyclerViewAdapter代码


``` java
/**
 * Created by Xiamin on 2016/9/2.
 */
public class RecyclerViewAdapter extends RecyclerView.Adapter<RecyclerViewAdapter.ViewHolder> {
    ListView
    private List<String> mdata;

    public RecyclerViewAdapter(List<String> data) {
        mdata = data;
    }

    @Override
    public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.recycle_item, parent, false);
        ViewHolder viewHolder = new ViewHolder(view);

        return viewHolder;
    }

    @Override
    public void onBindViewHolder(final ViewHolder holder, final int position) {
        holder.textView.setText(mdata.get(position));

        /**
         * 在绑定viewholder时 给每个view设置上触摸监听
         */
        if (mOnItemClickListener != null) {
            holder.textView.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    mOnItemClickListener.onItemClick(holder.itemView, position);
                }
            });

            holder.textView.setOnLongClickListener(new View.OnLongClickListener() {
                @Override
                public boolean onLongClick(View view) {
                    mOnItemClickListener.onItemLongClick(holder.itemView, position);

                    //返回true 这样触发了onLongClick后便不会再触发onClick了
                    return true;
                }
            });
        }
    }

    @Override
    public int getItemCount() {
        return mdata.size();
    }

    /**
     * 定义接口用于短按长按的回调
     */
    public interface OnRecyclerViewItemClickListener {
        void onItemClick(View view, int position);

        void onItemLongClick(View view, int position);
    }

    /**
     * 添加点击事件
     */
    private OnRecyclerViewItemClickListener mOnItemClickListener = null;

    public void setOnItemClickListener(OnRecyclerViewItemClickListener listener) {
        this.mOnItemClickListener = listener;
    }


    public void addData(int position) {
        mdata.add(position, "Insert One");
        notifyItemInserted(position);
    }

    public void removeData(int position) {
        mdata.remove(position);

        notifyItemRemoved(position);
        /**
         * 非常重要！！！ 若不使用该方法通知适配器数据已经变了，notifyItemRemoved会导致item下标错乱
         * 因为删除某一项时调用notifyItemRemoved后，显示的item是不会调用onBind方法的，
         * 所以position并没有被刷新。这时候得到的position值就是错误的。
         */
        notifyItemRangeChanged(position, mdata.size());

    }

    public static class ViewHolder extends RecyclerView.ViewHolder {

        public TextView textView;

        public ViewHolder(View itemView) {
            super(itemView);
            textView = (TextView) itemView.findViewById(R.id.textView);
        }
    }
}

```

 **- 初步运行**
 
发现可以运行，类似于简单的listview（当然，item的xml配置代码被我省略了）

 - 添加监听事件
 
 我选择在长按item时删除该item，删除动画在由该行设置

``` java
 mRecyclerView.setItemAnimator(new DefaultItemAnimator());
```

``` java
mAdapter.setOnItemClickListener(new RecyclerViewAdapter.OnRecyclerViewItemClickListener() {
            @Override
            public void onItemClick(View view, int position) {
                Toast.makeText(MainActivity.this, position + "pressed", LENGTH_SHORT).show();
            }

            @Override
            public void onItemLongClick(View view, int position) {
                Toast.makeText(MainActivity.this, position + "Longpressed", LENGTH_SHORT).show();
                mAdapter.removeData(position);
            }
        });
```

 **- 遇坑**

完成该功能后，测试发现，删除会出现问题，动画是有了，但是下标会乱，导致删除错误item、<br>
因此便有了该行代码。<br>
因为删除某一项时调用notifyItemRemoved后，显示的item是不会调用onBind方法的，所以position并没有被刷新。这时候得到的position值就是错误的。我们需要手动使adapter给后面的item重新onBind

``` java
notifyItemRangeChanged(position, mdata.size());
```

至此，RecyclerView的便正常工作了。

**总结**

     本文只是RecyclerView的一些基本使用，有很多强大的功能还未能接触，本文也比较初步，仅作入门引导。

 

