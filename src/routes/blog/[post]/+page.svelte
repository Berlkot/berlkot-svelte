<script lang="ts">
	let { data } = $props();
 let options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
</script>

<svelte:head>
	<title>{data.title}</title>
	<meta name="author" content={data.author} />
</svelte:head>
<section>
	<!--We trust ourself or hacked-->
	<!--eslint-disable svelte/no-at-html-tags-->
	<article>
		<header>
			<h1>{data.title}</h1>
			<time datetime={data.createdAt.toString()}>{new Intl.DateTimeFormat(undefined, options).format(data.createdAt)}</time>
		</header>
		<section>{@html data.content}</section>
	</article>
</section>
