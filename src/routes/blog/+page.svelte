<script>
	export let data;
</script>

<h1>blog list</h1>

{#each data.posts as post}
	<a href="/blog/{post.name}">{post.title}</a>
{/each}
