---
layout: null
permalink: /games/
date: 2015-01-01
---
{% assign index = -1 %}{% assign date = page.date %}
{% for game in site.games %}{% if game.devlog and game.devlog.size > 0 %}{% if game.devlog.first.date > date %}
	{% assign index = forloop.index0 %}
	{% assign date = game.devlog.first.date %}
{% endif %}{% endif %}{% endfor %}
<script type="text/javascript">
	location.assign("{{ site.games[index].url }}");
</script>