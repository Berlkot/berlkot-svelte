<script lang="ts">
	import Autocomplete from '$lib/Autocomplete.svelte';
	import { searchTags } from '$lib/client-helpers';
	import ImageCard from '$lib/ImageCard.svelte';
	let { data } = $props();
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	let tags: any = page.url.searchParams.getAll('tags');
	if (tags.length > 0) {
		tags = tags[0].split(',').map((tag: any) => ({name: tag}))
	} else {
		tags = []
	}
	const initialTags = tags;
	let skipedinit = false;
	async function onChange(value) {
		if (!skipedinit) {
			skipedinit = true;
			return
		};
		if (!value) {
			await goto('/gallery')
			return
		};
		await goto('/gallery?tags=' + value);
	}
</script>

<svelte:head>
	<title>Berlkot gallery</title>
</svelte:head>
<h1>Gallery</h1>
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
<label>
	Tag filter:
<Autocomplete onChange={onChange} name="tags" placeholder="Type to search" optFunction={searchTags} key="name" defaultSelected={initialTags} multipule={true} delay={200}/>
</label>
<section>
	<ul class="gallery">
	{#each data.images as image}
	<li>
		<ImageCard {image} />
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
	label {
		text-wrap: nowrap;
		display: flex;
		gap: 1rem;
	}
</style>
