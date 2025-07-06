<script lang="ts">
	import Autocomplete from '$lib/Autocomplete.svelte';
	import { searchTags } from '$lib/client-helpers';
	import GalleryCard from '$lib/GalleryCard.svelte';
	let { data } = $props();
	import { page } from '$app/state';
	import { goto, afterNavigate } from '$app/navigation';
	let tags: any = page.url.searchParams.getAll('tags');
	if (tags.length > 0) {
		tags = tags[0].split(',').map((tag: any) => ({ name: tag }));
	} else {
		tags = [];
	}
	let initialTags = $state(tags);
	afterNavigate(() => {
		let tags: any = page.url.searchParams.getAll('tags');
		if (tags.length > 0) {
			tags = tags[0].split(',').map((tag: any) => ({ name: tag }));
		} else {
			tags = [];
		}
		initialTags = tags;
	});
	let skipedinit = false;
	async function onChange(value) {
		if (!skipedinit) {
			skipedinit = true;
			return;
		}
		if (!value) {
			await goto('/gallery');
			return;
		}
		await goto('/gallery?tags=' + value);
	}
</script>

<div class="page-title">
	<h1>Gallery</h1>
	<p>Here you can find all of my artworks for past couple years</p>
</div>

<!-- 
// TODO: Implement filtering
// goto('/gallery?maturity=' + maturity + '&ordering=' + ordering + '&tag=' + tags + '&text=' + text);
<form action="">
	<select name="tags" id="" multiple>
		{#each data.tags as tag}
			<option value={tag.name}>{tag.name}</option>
		{/each}
	</select>
	<input type="text" name="search" id="" />
	<button type="submit">Search</button>
</form> -->
<div class="tags">
	<Autocomplete
		{onChange}
		name="tags"
		placeholder="tag1, tag2..."
		optFunction={searchTags}
		key="name"
		defaultSelected={initialTags}
		multipule={true}
		delay={200}
	/>
</div>

<section>
	<ul class="gallery">
		{#each data.galleryPosts as galleryPost (galleryPost.name)}
			<li>
				<GalleryCard {galleryPost} />
			</li>
		{/each}
	</ul>
</section>

<style>
	@media (max-width: 712px) {
		ul.gallery {
			grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
			grid-template-rows: repeat(auto-fill, minmax(160px, 1fr));
		}
	}
	.tags {
		padding: 1rem;
	}
</style>
