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
		{#if data.blogPost.heroImage}
			<figure>
				<figcaption>{data.blogPost.heroImage.credit}</figcaption>
				<img
					src="/asset/{data.blogPost.heroImage.name}.webp?w=1280&h=720"
					alt={data.blogPost.heroImage.alt}
					width="1280"
					height="720"
				/>
			</figure>
		{/if}
		<ul class="tag-list">
			{#each data.blogPost.tags as tag (tag.name)}
				<li class="tag">
					{tag.name}
				</li>
			{/each}
		</ul>
		<h1>{data.blogPost.title}</h1>
		<div class="metadata">
			<span>By {data.blogPost.author}</span>
			<span
				>{#if data.blogPost.updatedAt > new Date(data.blogPost.createdAt.getTime() + 86400000)}<time
						class="updated"
						datetime={data.blogPost.updatedAt.toString()}
						>{new Intl.DateTimeFormat(undefined, options).format(data.blogPost.updatedAt)}</time
					> |{/if}
				<time datetime={data.blogPost.createdAt.toString()}
					>{new Intl.DateTimeFormat(undefined, options).format(data.blogPost.createdAt)}</time
				></span
			>
		</div>
		<section>{@html data.blogPost.content}</section>
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
