<script lang="ts">
	let { data } = $props();
	let options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	};
</script>

<section class="blog">
	<!--We trust ourself or hacked-->
	<!--eslint-disable svelte/no-at-html-tags-->
	<a class="link" href="/blog">&lt; Back</a>
	<article>
		{#if data.post.thumbnail}
			<figure>
				<figcaption>{data.post.thumbnail.smallDescription}</figcaption>
				<img
					src="/asset/{data.post.thumbnail.name}.webp?w=1280&h=720"
					alt={data.post.thumbnail.alt}
					width="1280"
					height="720"
				/>
			</figure>
		{/if}
		<ul class="tag-list">
			{#each data.post.tags as tag}
				<li class="tag">
					{tag.name}
				</li>
			{/each}
		</ul>
		<h1>{data.post.title}</h1>
		<div class="metadata">
			<span>By {data.post.author}</span>
			<span
				>{#if data.post.updatedAt > new Date(data.post.createdAt.getTime() + 86400000)}<time
						class="updated"
						datetime={data.post.updatedAt.toString()}
						>{new Intl.DateTimeFormat(undefined, options).format(data.post.updatedAt)}</time
					> |{/if}
				<time datetime={data.post.createdAt.toString()}
					>{new Intl.DateTimeFormat(undefined, options).format(data.post.createdAt)}</time
				></span
			>
		</div>
		<section>{@html data.post.content}</section>
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
