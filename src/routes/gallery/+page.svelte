<script lang="ts">
	import Autocomplete from '$lib/components/Autocomplete.svelte';
	import { searchTags, searchFolders } from '$lib/client-helpers';
	import GalleryCard from '$lib/components/GalleryCard.svelte';
	let { data } = $props();
	import { page } from '$app/state';
	import { goto, afterNavigate } from '$app/navigation';
	function getParams() {
		let tags: string[] | { name: string }[] = page.url.searchParams.getAll('tags');
		if (tags.length > 0) {
			tags = tags[0].split(',').map((tag: string) => ({ name: tag }));
		} else {
			tags = [];
		}
		let folder = page.url.searchParams.get('folder');
		if (folder) {
			(tags as { name: string }[]).unshift({ name: '~' + folder });
		}
		return tags as { name: string }[];
	}

	let initialValue = $state(getParams());
	let currentVaule = '';
	afterNavigate(() => {
		initialValue = getParams();
	});
	let skipedinit = false;
	async function onChange(value: string) {
		currentVaule = value;
		if (!skipedinit) {
			skipedinit = true;
			return;
		}
		if (!value) {
			await goto('/gallery');
			return;
		}
		const tags: string[] = [];
		let folder;
		value.split(',').forEach((el: string) => {
			if (el.startsWith('~')) {
				folder = 'folder=' + el.substring(1);
				return;
			}
			tags.push(el);
		});
		let q = []
		if (tags.length !== 0)
		  q.push('tags=' + tags.join(','))
		if (folder)
		  q.push(folder)
		await goto('/gallery?' + q.join('&'));
	}
	async function searchAll(keyword: string) {
		if (currentVaule.match('~[^,]+')) {
			return await searchTags(keyword);
		}
		return (await searchTags(keyword)).concat(
			(await searchFolders(keyword)).map((folder) => ({ name: '~' + folder.name }))
		);
	}
	function getItemStyle(item: object) {
		if (item.name.startsWith('~')) {
			return '--color-accent: var(--color-meta-yellow);--color-accent-fill: var(--color-meta-yellow-fill); color: var(--color-meta-yellow)';
		}
		return null;
	}
</script>

<div class="page-title">
	<h1>{data.folder ? data.folder.name : 'Gallery'}</h1>
	<p>
		{data.folder
			? data.folder.description
			: 'Here you can find all of my artworks for past couple years'}
	</p>
</div>

{#snippet optionItem(value: object)}
	{#if (value as { name: string }).name.startsWith('~')}
		{(value as { name: string }).name.substring(1)}
	{:else}
		{(value as { name: string }).name}
	{/if}
{/snippet}

<div class="searchbox">
	<Autocomplete
		{onChange}
		name="searchbox"
		placeholder="tag1, tag2, folder ..."
		optFunction={searchAll}
		key="name"
		defaultSelected={initialValue}
		multipule={true}
		delay={200}
		{optionItem}
		{getItemStyle}
	/>
</div>

<section>
	{#if data.folders}
		<ul class="gallery-folders">
			{#each data.folders as folder (folder.name)}
				<li
					class="gallery-wrapper"
					style:grid-column="span {folder.width}"
					style:grid-row="span {folder.height}"
				>
					<a href="/gallery?folder={folder.name}">
						<div class="folder">
							{#if folder.heroImage}
								<img src="/asset/{folder.heroImage.name}.webp?w=270&h=270" alt="" />
							{/if}
							<p class="title">{folder.name}</p>
						</div>
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<ul class="gallery">
			{#each data.galleryPosts as galleryPost (galleryPost.name)}
				<li>
					<GalleryCard {galleryPost} />
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	@media (max-width: 712px) {
		ul.gallery {
			grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
			grid-template-rows: repeat(auto-fill, minmax(160px, 1fr));
		}
		.gallery-wrapper {
			grid-area: auto !important;
		}
		ul.gallery-folders {
			grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
			grid-template-rows: repeat(auto-fill, minmax(160px, 1fr));
			grid-auto-rows: unset;
		}
	}
	.searchbox {
		padding: 2rem 0.5rem;
	}
	.folder {
		position: relative;
		aspect-ratio: 1/1;
		width: 100%;
		height: 100%;
		border-radius: 4px;
		transition: 0.2s filter linear;
		overflow: hidden;
	}
	img {
		object-fit: cover;
		min-height: 100%;
		width: 100%;
		height: 100%;
		-webkit-mask-image: linear-gradient(to top, transparent 5%, black 50%);
		mask-image: linear-gradient(to top, transparent 5%, black 50%);
		-webkit-mask-size: 100% 200%;
		mask-size: 100% 200%;
		-webkit-mask-position: 0 60%;
		mask-position: 0 60%;
		transition: mask-position 0.4s cubic-bezier(0.25, 1, 0.5, 1);
	}
	.folder:hover img {
		mask-position: 0 100%;
	}

	.folder::after {
		content: '';
		position: absolute;
		inset: 0;

		background-color: #81375c;
		transition: mask-image 0.2s linear;
		-webkit-mask-image:
    		repeating-linear-gradient(-45deg, transparent 0, black 4px, transparent 8px),
    		linear-gradient(to top, black 10%, transparent 50%);
		mask-image:
			repeating-linear-gradient(-45deg, transparent 0, black 4px, transparent 8px),
			linear-gradient(to top, black 10%, transparent 50%);

		-webkit-mask-composite: intersect;
		mask-composite: intersect;
		-webkit-mask-size:
			100% 100%,
			100% 200%;
		mask-size:
			100% 100%,
			100% 200%;

		-webkit-mask-position:
			0 0,
			0 50%;
		mask-position:
			0 0,
			0 50%;
		transition: mask-position 0.4s cubic-bezier(0.25, 1, 0.5, 1);
	}

	.folder:hover::after {
		mask-position: 0 90%;
		-webkit-mask-position: 0 90%;
	}

	.gallery-folders {
		grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
		grid-auto-flow: dense;
		grid-auto-rows: minmax(210px, 210px);
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 1.1rem;
	}
	.title {
		position: absolute;
		bottom: 0;
		left: 0;
		z-index: 1;
		font: bold 3rem/1.2em var(--ff-display);
		color: var(--color-accent);
		margin: 2rem 1.5rem;
		transition:
			color 0.2s ease-in-out,
			filter 0.2s ease-in-out;
	}
	.folder .title::after {
		content: '';
	}
	.folder:hover .title::after{
	    content: ' <';
		animation-name: blink;
		animation-duration: 1.5s;
		animation-timing-function: step-end;
		animation-iteration-count: infinite;
	}

	.folder:hover .title {
		filter: var(--chromatic-aberration);
		color: var(--color-accent-hover);
	}
</style>
