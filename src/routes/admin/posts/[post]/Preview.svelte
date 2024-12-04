<script lang="ts">
    let { post } = $props();
    let options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	};
	let content = $state('');
	$effect(() => {
		fetch('/admin/posts/render', {
			method: 'POST',
			body: JSON.stringify({ content: post.content })
		}).then((r) => r.json()).then((d) => (content = d.content));
	})
</script>

<svelte:head>
	<title>{post.title}</title>
	<meta name="author" content={post.author} />
</svelte:head>
<section>
	<article>
		<h1>{post.title}</h1>
		<time datetime={post.createdAt.toString()}
			>{new Intl.DateTimeFormat(undefined, options).format(post.createdAt)}</time
		>
		<section>{@html content}</section>
	</article>
</section>
