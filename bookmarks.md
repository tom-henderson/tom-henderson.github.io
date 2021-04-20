---
layout: default
title: Bookmarks
image: /assets/headers/dead-trees.jpg
permalink: /bookmarks/
---

{% raw %}
<div class="cf frame hide" id="tempo-template">
    <article class="post" itemscope itemtype="http://schema.org/BlogPosting" role="article" data-template>
        <div class="article-item">
            <header class="post-header">
                <h2 class="post-title" itemprop="name">
                    <a href="{{ url }}" itemprop="url">{{ title }}</a>
                </h2>
            </header>
            <section class="post-excerpt" itemprop="description">
                <p>{{ description | removemarkdown }}</p>
            </section>
            <div class="post-meta">
                <time datetime="{{ date_added | date 'D MMMM YYYY' }}">{{ date_added | date 'D MMMM YYYY' }}</time>
            </div>
        </div>
    </article>
</div>
{% endraw %}

<script src="{{ "/assets/js/tempo.js" | prepend: site.baseurl }}" defer></script>
<script src="{{ "/assets/js/bookmarks.js" | prepend: site.baseurl }}" defer></script>
