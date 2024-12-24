<script lang="ts">
 import HeroImage from '$lib/assets/images/hero_bg.webp'
</script>


<svelte:head>
	<title>Berlkot</title>
</svelte:head>
<div class="hero-bg" style:background-image="url({HeroImage})">
</div>
<h1 class="visually-hidden">Home</h1>
<section class="home-page">

</section>



<style>
	.home-page {
		margin-top: 300px;
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
</style>