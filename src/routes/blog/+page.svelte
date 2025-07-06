<script lang="ts">
	import ArticleCard from '$lib/ArticleCard.svelte';
	let { data } = $props();
</script>

<div class="page-title">
	<h1>Blog list</h1>
	<p>Here i will write down my thoughts and events happend in my life.</p>
</div>
<ul class="blog-list">
	{#each data.blogPosts as post (post.name)}
		<li>
			{#if !(post.createdAt > new Date())}
				<ArticleCard {post} />
			{/if}
		</li>
	{/each}
</ul>
