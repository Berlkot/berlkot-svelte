<script lang="ts">
	import ArticleCard from "$lib/ArticleCard.svelte";
	let { data } = $props();
</script>

<svelte:head>
	<title>Blog | Berlkot</title>
	<meta name="title" content="Blog | Berlkot">
	<meta name="og:title" content="Blog | Berlkot">
	<meta name="description" content="Some of my thoughts to share with outer world">
	<meta name="og:description" content="Some of my thoughts to share with outer world">
</svelte:head>

<div class="page-title">
	<h1>Blog list</h1>
	<p>Here i will write down my thoughts and events happend in my life.</p>
</div>
<ul class="blog-list">
	{#each data.posts as post}
		<li>
			{#if !(post.createdAt > new Date())}
				<ArticleCard {post} />
			{/if}
		</li>
	{/each}
</ul>