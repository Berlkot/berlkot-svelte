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
	<meta name="og:title" content="{data.title} | Berlkot" />
	<meta name="description" content={data.description} />
	<meta name="og:description" content={data.description} />
	<meta name="author" content={data.author} />
	<meta name="og:type" content="article" />
	{#if data.thumbnail}
		<meta name="og:image" content="https://berlkot.com/asset/{data.thumbnail.name}.webp">
	{/if}
</svelte:head>

<section class="blog">
	<!--We trust ourself or hacked-->
	<!--eslint-disable svelte/no-at-html-tags-->
	<a class="link" href="/blog">&lt; Back</a>
	<article>
		{#if data.thumbnail}
			<figure>
				<figcaption>{data.thumbnail.smallDescription}</figcaption>
				<img
					src="/asset/{data.thumbnail.name}.webp?w=1280&h=720"
					alt={data.thumbnail.alt}
					width="1280"
					height="720"
				/>
			</figure>
		{/if}
		<ul class="tag-list">
			{#each data.tags as tag}
				<li class="tag">
					{tag.name}
				</li>
			{/each}
		</ul>
		<h1>{data.title}</h1>
		<div class="metadata">
			<span>By {data.author}</span>
			<span
				>{#if data.updatedAt > new Date(data.createdAt.getTime() + 86400000)}<time
						class="updated"
						datetime={data.updatedAt.toString()}
						>{new Intl.DateTimeFormat(undefined, options).format(data.updatedAt)}</time
					> |{/if}
				<time datetime={data.createdAt.toString()}
					>{new Intl.DateTimeFormat(undefined, options).format(data.createdAt)}</time
				></span>
		</div>
		<section>{@html data.content}</section>
	</article>
</section>

<style>
	figcaption {
		padding: 1rem;
		color: #ffd2c0ad;
	}
	.updated + time {
		color: #a82b7ea1;
	}
	.metadata {
		display: flex;
		justify-content: space-between;
		color: var(--color-meta-accent);
		font-weight: bold;
	}
	.tag-list {
		margin-top: 1rem;
	}
	.blog {
		max-width: 66ch;
		margin: auto;
	}
</style>
