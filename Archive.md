---
layout: page
title: archive
header-img: "img/post-bg-universe.jpg"
---

### Blogs
<hr>

{% for post in site.posts %}
<div class="post-preview">
    <font color="#4078c0">{{ post.date | date: "%B %-d, %Y" }} ->   </font>
     <a target="_blank" href="{{ post.url | prepend: site.baseurl }}">  {{ post.title }}  </a>
</div>
<hr>
{% endfor %}
