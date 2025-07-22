<script lang="ts">
	import { fly } from 'svelte/transition';
	let { data } = $props();
	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	};
	import Zoom from './Zoom.svelte';
	import LeftArrow from '$lib/assets/icons/left-arrow.svg';
	import RightArrow from '$lib/assets/icons/right-arrow.svg';
	let assets = data.galleryPost.assets.map((asset) => asset.asset);
	let currentImage = $state(0);
	let direction = $state(1);
</script>

<section>
	<div class="full-view">
		{#if assets.length > 0 && currentImage > 0}
			<button
				class="controls controls-prev"
				onclick={() => {
					direction = -1;
					currentImage--;
				}}><img src={LeftArrow} alt="left arrow" /></button
			>
		{/if}
		<div class="layout-sizer">
			{#if assets[currentImage].type == 'VIDEO'}
				<!-- svelte-ignore a11y_media_has_caption -->
				<video src="/asset/{assets[currentImage].name}.mp4"></video>
			{:else}
				<img
					src="/asset/{assets[currentImage].name}.webp"
					alt=""
					width={assets[currentImage].width}
					height={assets[currentImage].height}
				/>
			{/if}
		</div>

		{#key currentImage}
			<div class="media-wrapper" in:fly={{ x: direction * 400 }} out:fly={{ x: -direction * 400 }}>
				{#if assets[currentImage].type == 'VIDEO'}
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
		{/key}

		{#if assets.length > 0 && currentImage < assets.length - 1}
			<button
				class="controls controls-next"
				onclick={() => {
					direction = 1;
					currentImage++;
				}}><img src={RightArrow} alt="right arrow" /></button
			>
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
				>{#if data.galleryPost.visibility == 'PUBLIC'}Public{:else if data.galleryPost.visibility == 'SUB_ONLY'}Sub
					only{:else if data.galleryPost.visibility == 'ADMIN'}Private{/if}</span
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
		{#if data.galleryPost.contentWarning}
			<p class="tag-list">
				Content warning: <span class="content-warning">{data.galleryPost.contentWarning}</span>
			</p>
		{/if}
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
		max-height: 70vh;
	}
	.content-warning {
		color: var(--color-accent);
		font-weight: bold;
	}
	.controls {
		position: absolute;
		filter: var(--chromatic-aberration);
		top: 0;
		border: none;
		width: 40px;
		height: 100%;
		display: flex;
		z-index: 1;
	}
	.controls-next {
		right: 0;
		border-radius: 0 1rem 1rem 0;
	}
	.controls-prev {
		left: 0;
		border-radius: 1rem 0 0 1rem;
	}
	.full-view {
		position: relative;
		width: 100%;
		overflow: hidden;
	}
	.layout-sizer {
		visibility: hidden;
		pointer-events: none;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.media-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
</style>
