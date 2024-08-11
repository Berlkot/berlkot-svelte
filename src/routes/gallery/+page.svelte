<script lang="ts">

	export let data;
</script>

<h1>Gallery</h1>

{#each data.images as image}
    <a href='/gallery/{image.name}'>
        <img src='/image/{image.basename}' alt={image.alt} width={image.width} height={image.height} />
	</a>
{/each}

<style>
	img {
		width: 300px;
		height: auto;
		object-fit: contain;
	}
</style>