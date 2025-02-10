<script lang="ts">
	let { data } = $props();
	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	};
	import Zoom from './Zoom.svelte';
</script>

<section>
	<div class="full-view">
		{#if data.asset.type == 1}
			<!-- svelte-ignore a11y_media_has_caption -->
			<video controls loop src="/asset/{data.asset.name}.mp4"></video>
		{:else}
			<Zoom>
				<img
					src="/asset/{data.asset.name}.webp"
					alt={data.asset.alt}
					width={data.asset.width}
					height={data.asset.height}
				/>
			</Zoom>
		{/if}
	</div>
	<div class="image-content">
		<h2>{data.asset.title}</h2>
		<p class="text-smaller">
			By <span>{data.asset.author}</span> at
			<span
				><time datetime={data.asset.creationDate.toString()}
					>{new Intl.DateTimeFormat(undefined, options).format(data.asset.creationDate)}</time
				></span
			>
			|
			<span
				>{#if data.asset.maturity == 0}SFW{:else if data.asset.maturity == 1}Questionable{:else}NSFW{/if}</span
			>
			|
			<span
				>{#if data.asset.visibility == 0}Public{:else if data.asset.visibility == 1}Sub only{:else if data.asset.visibility == -1}Private{/if}</span
			>
		</p>
		<!--We trust ourself or hacked-->
		<!--eslint-disable-next-line svelte/no-at-html-tags-->
		<div class="content">{@html data.asset.largeDescription}</div>
		{#if data.asset.copyright}
			<p class="tag-list">Copyright: {data.asset.copyright}</p>
		{/if}
		<!-- eslint doesnt know that prisma has related queries-->
		<p class="tag-list">
			Tags:
			{#each (data.asset as any).tags.filter((tag) => tag.type === 0) as tag}
				<a class="tag" href="/gallery?tags={tag.name}">{tag.name}</a>
			{/each}
		</p>
		<p class="tag-list">
			Folders:
			{#each (data.asset as any).tags.filter((tag) => tag.type === 1) as tag}
				<a class="tag tag-yellow" href="/gallery?tags={tag.name}">{tag.name}</a>
			{/each}
		</p>
	</div>
</section>

<style>
	span {
		color: var(--color-text);
	}
	img {
		height: auto;
		object-fit: contain;
		max-height: 70vh;
		width: auto;
	}

	a {
		text-decoration: none;
		transition: filter 0.2s ease-in-out;
	}
	a:hover {
		filter: var(--chromatic-aberration);
	}
	.image-content {
		padding: 1.5rem;
		width: 100%;
	}
	section {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: var(--bg-color);
		min-height: 100vh;
	}
	.text-smaller {
		margin-top: 0.5rem;
	}
	h2 {
		margin: 0;
	}
	video {
		max-width: 100%;
	}
</style>
