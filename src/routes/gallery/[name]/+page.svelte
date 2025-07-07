<script lang="ts">
	let { data } = $props();
	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	};
	import Zoom from './Zoom.svelte';
	let assets = data.galleryPost.assets.map(asset => asset.asset);
	let currentImage = $state(0);
</script>

<section>
	<div class="full-view">
		{#if assets[currentImage].type == "VIDEO"}
			<!-- svelte-ignore a11y_media_has_caption -->
			<video controls loop src="/asset/{assets[currentImage].name}.mp4"></video>
		{:else}
			<Zoom>
				<img
					src="/asset/{assets[currentImage].name}.webp"
					alt={assets[currentImage].alt}
					width={assets[currentImage].width}
					height={assets[currentImage].height}
				/>
			</Zoom>
		{/if}
	</div>
	<div class="image-content">
		<h2>{data.galleryPost.title}</h2>
		<p class="text-smaller">
			at
			<span
				><time datetime={data.galleryPost.creationDate.toString()}
					>{new Intl.DateTimeFormat(undefined, options).format(data.galleryPost.creationDate)}</time
				></span
			>
			|
			<span
				>{#if data.galleryPost.maturity == 'SFW'}SFW{:else if data.galleryPost.maturity == 'QUESTIONABLE'}Questionable{:else}NSFW{/if}</span
			>
			|
			<span
				>{#if data.galleryPost.visibility == 'PUBLIC'}Public{:else if data.galleryPost.visibility == 'SUB_ONLY'}Sub only{:else if data.galleryPost.visibility == 'ADMIN'}Private{/if}</span
			>
		</p>
		<!--We trust ourself or hacked-->
		<!--eslint-disable-next-line svelte/no-at-html-tags-->
		<div class="content">{@html data.galleryPost.largeDescription}</div>
		{#if data.galleryPost.copyright}
			<p class="tag-list">Copyright: {data.galleryPost.copyright}</p>
		{/if}
		<!-- eslint doesnt know that prisma has related queries-->
		<p class="tag-list">
			Tags:
			{#each data.galleryPost.tags as tag (tag.name)}
				<a class="tag" href="/gallery?tags={tag.name}">{tag.name}</a>
			{/each}
		</p>
		<p class="tag-list">
			Folders:
			{#each data.galleryPost.folders as folder (folder.name)}
				<a class="tag tag-yellow" href="/gallery?tags={folder.name}">{folder.name}</a>
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
