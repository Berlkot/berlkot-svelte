<script lang="ts">
    import type BlogPost from "@prisma/client";
	let { post, params }: { post: BlogPost; params?: string } = $props();
	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	};
</script>

<a class="blog-card" href="/blog/{post.name}{params}">
	<article>
		{#if post.heroImage}
			<img
				src="/asset/{post.heroImage.name}.webp?w=465&h=260"
				alt={post.heroImage.alt}
				width="465"
				height="260"
			/>
		{/if}
		<ul class="tag-list">
			{#each post.tags as tag (tag.name)}
				<li class="tag">
					{tag.name}
				</li>
			{/each}
		</ul>
		<div class="card-text">
			<h3>{post.title}</h3>
			<p>{post.description}</p>
			<span>{new Intl.DateTimeFormat(undefined, options).format(post.createdAt)}</span>
		</div>
	</article>
</a>

<style>
	.blog-card:hover .card-text {
		filter: var(--chromatic-aberration);
	}
	.card-text {
		transition: filter 0.2s ease-in-out;
	}
	img {
		transition: filter 0.2s ease-in-out;
	}
	.blog-card:hover img {
		filter: brightness(120%);
	}
	a {
		text-decoration: none;
		color: inherit;
	}
	p {
		margin-bottom: 0.5rem;
	}
	h3 {
		margin-bottom: 1rem;
		margin-top: 2rem;
		color: var(--color-accent);
	}
	span {
		font-weight: 100;
		text-align: center;
		font: 1.3rem/1.3em var(--ff-paragraph);
		color: #ffd2c0ad;
	}
	img {
		width: 100%;
	}
</style>
