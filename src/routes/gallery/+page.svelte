<script lang="ts">
	import ImageCard from '$lib/ImageCard.svelte';
	let { data } = $props();

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

<section>
	{#each data.images as image}
		<ImageCard {image} />
	{/each}
</section>


<style>
	section {
		display: grid;
		gap: 1.1rem;
		grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
		grid-template-rows: repeat(auto-fill, minmax(210px, 1fr));
	}
</style>
