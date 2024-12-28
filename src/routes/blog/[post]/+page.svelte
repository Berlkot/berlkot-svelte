<script lang="ts">
	let { data } = $props();
	let options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	};
</script>

<svelte:head>
	<title>{data.title}</title>
	<meta name="author" content={data.author} />
</svelte:head>
<section class="blog">
	<!--We trust ourself or hacked-->
	<!--eslint-disable svelte/no-at-html-tags-->
	<article>
		<header>
			{#if data.thumbnail}
				<img src="/asset/{data.thumbnail.name}.webp?w=1280&h=720" alt={data.thumbnail.alt} width="1280" height="720" />
				<p>{data.thumbnail.smallDescription}</p>
			{/if}
			<h1>{data.title}</h1>
			<p>{data.author}</p>
			<time datetime={data.createdAt.toString()}
				>{new Intl.DateTimeFormat(undefined, options).format(data.createdAt)}</time
			>
		</header>
		<section>{@html data.content}</section>
	</article>
</section>

<style>
	.blog {
		max-width: 66ch;
		margin: auto;
	}
	:global(main) {
		margin: 2.6rem 1rem 8rem 1rem !important;
	}
</style>