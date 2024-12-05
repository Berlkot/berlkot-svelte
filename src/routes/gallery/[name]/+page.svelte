<script lang="ts">
	let { data } = $props();
	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	};
	import Zoom from './Zoom.svelte';
</script>

<svelte:head>
	<title>{data.title}</title>
</svelte:head>
<section>
	{#if data.type == 1}
		<!-- svelte-ignore a11y_media_has_caption -->
		<video controls loop src="/asset/{data.name}.mp4"></video>
	{:else}
	<Zoom>
		<img src="/asset/{data.name}.webp" alt={data.alt} width={data.width} height={data.height} />
	</Zoom>
	{/if}
	<div class="image-content">
		<h1>{data.title}</h1>
		<p>{new Intl.DateTimeFormat(undefined, options).format(data.creationDate)}</p>
		<!--We trust ourself or hacked-->
		<!--eslint-disable-next-line svelte/no-at-html-tags-->
		<div>{@html data.largeDescription}</div>

		<p>By {data.author}</p>
		<!-- eslint doesnt know that prisma has related queries-->
		{#each (data as any).tags as tag}
			<p><b>{tag.name}</b></p>
		{/each}
	</div>
</section>

<style>
	img {
		height: auto;
		object-fit: contain;
		max-height: 70vh;
		width: auto;
	}
	.image-content {
		padding: 20px;
		width: 100%;
	}
	section {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: var(--bg-color);
		min-height: 100vh;
		transition: all 2s;
	}
	h1 {
		margin: 0;
	}
	video {
		max-width: 100%;
	}
</style>
