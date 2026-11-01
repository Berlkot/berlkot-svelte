<script lang="ts">
	import PostPage from '#routes/blog/[post]/+page.svelte';
	let { post } = $props();
	let renderedPost = $state('');
	$effect(() => {
		fetch('/admin/posts/render', {
			method: 'POST',
			body: JSON.stringify({ content: post.content })
		})
			.then((r) => r.json())
			.then((d) => (renderedPost = d.content));
	});
</script>

<PostPage data={{ blogPost: { ...post, content: renderedPost }, meta: {} }} />
