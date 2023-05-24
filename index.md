---
title: Algorithms I fell in love with
---

{% for chapter in site.chapters %}
  <section id="{{ chapter.title }}">
    <h2>{{ chapter.title }}</h2>
    {{ chapter.content }}
  </section>
  <br>
{% endfor %}