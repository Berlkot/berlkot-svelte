<script lang="ts">
 import HeroImage from '$lib/assets/images/hero_bg.webp'
 import ImageCard from '$lib/ImageCard.svelte';
 let { data } = $props();
</script>


<svelte:head>
	<title>Berlkot</title>
</svelte:head>
<div class="hero-bg" style:background-image="url({HeroImage})">
</div>
<h1 class="visually-hidden">Berlkot site home page</h1>
<section class="home-page">
	<h2 class="heading">Berlkot</h2>
</section>
<section>
	<h2 class="heading">Latest to read</h2>
</section>
<section>
	<h2 class="heading">Latest to look</h2>
	<div class="gallery">
		{#each data.images as image}
		<ImageCard {image} />
	{/each}
	</div>

</section>


<style>
	.home-page {
		margin-top: 300px;
	}
	.gallery {
		display: grid;
		gap: 1.1rem;
		grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
		grid-template-rows: repeat(auto-fill, minmax(210px, 1fr));
	}
	.hero-bg {
		position: absolute;
		width: 1262px;
		height: 300px;
		background-repeat: no-repeat;
		left: 50%;
		transform: translate(-50%, 0);
		top: 40px;
		z-index: -1;
	}
	.heading {
		display: flex;
		text-align: center;
		align-items: center;
		text-wrap: nowrap;
	}
	.heading::before {
		content: '';
		display: block;
		width: 100%;
		margin-right: 1rem;
		height: 2px;
		background: linear-gradient(to right, transparent 0%, var(--color-accent) 50%);
		filter: var(--chromatic-aberration);
	}
	.heading::after {
		content: '';
		display: block;
		margin-left: 1rem;
		width: 100%;
		height: 2px;
		background: linear-gradient(to left, transparent 0%, var(--color-accent) 50%);
		filter: var(--chromatic-aberration);
	}
</style>