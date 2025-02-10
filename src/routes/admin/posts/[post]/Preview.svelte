<script lang="ts">
	import PostPage from '$routes/blog/[post]/+page.svelte';
	let { post } = $props();
	let options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	};
	let content = $state('');
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

<PostPage data={{ ...post, content: renderedPost }} />
