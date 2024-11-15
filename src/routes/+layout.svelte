<script lang="ts">
	import Banner from '$lib/banner.svelte';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<Banner />
<div class="wrapper">
	<header>
		<nav>
			<a href="/">Home</a>
			<a href="/blog">Blog</a>
			<a href="/about">About</a>
			<a href="/gallery">Gallery</a>
			<a href="/projects">Projects</a>
		</nav>
	</header>
	<main>
		{@render children?.()}
	</main>
</div>
<footer>
	<div class="wrapper">
		<p>something about copyright</p>
	</div>
</footer>

<style>
	nav {
	display: flex;
	justify-content: space-evenly;
	}
	nav a {
	   padding: 10px;
	}
</style>
