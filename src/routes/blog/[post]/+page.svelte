<script lang="ts">
	let { data } = $props();
	import GoBack from '$lib/components/GoBack.svelte';
	import { onMount } from 'svelte';
	import { addToast } from '$lib/stores/toastStore';
	let options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	};
	onMount(() => {
	    document.querySelectorAll('.heading-anchor').forEach((element) => {
	        element.addEventListener('click', (event) => {
	            event.preventDefault();
				const target = element.querySelector('a');
				history.pushState(null, '', target.getAttribute('href'))
				const url = new URL(window.location.href)
				url.search = ''
				navigator.clipboard.writeText(url).then(() => {
    				addToast({
     					type: 'success',
     					message: 'Section link copied to clipboard',
     					timeout: 2000
    				});
				});

	        });
	    });
	});
</script>

<section class="blog">
	<!--We trust ourself or hacked-->
	<!--eslint-disable svelte/no-at-html-tags-->
	<GoBack defaultUrl="/blog" />
	<article>
		{#if data.blogPost.heroImage}
			<figure>
				<img
					src="/asset/{data.blogPost.heroImage.name}.webp?w=1280&h=720"
					alt={data.blogPost.heroImage.alt}
					width="1280"
					height="720"
				/>
				<figcaption>{data.blogPost.heroImage.credit}</figcaption>
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
		<section class="md-content">{@html data.blogPost.content}</section>
	</article>
</section>

<style>
	figcaption {
		padding: 1rem;
		color: #ffd2c0ad;
		font-style: italic;
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
