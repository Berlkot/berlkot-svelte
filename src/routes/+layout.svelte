<script lang="ts">
	import Banner from '$lib/banner.svelte';
</script>

<Banner />
<nav>
	<a href="/">Home</a>
	<a href="/blog">Blog</a>
	<a href="/about">About</a>
	<a href="/gallery">Gallery</a>
	<a href="/projects">Projects</a>
</nav>

<slot></slot>
