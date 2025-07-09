<script lang="ts">
	import HeroImage from '$lib/assets/images/hero_bg.webp';
	import GalleryCard from '$lib/components/GalleryCard.svelte';
	import ArticleCard from '$lib/components/ArticleCard.svelte';
	let { data } = $props();
</script>

<div class="hero-bg" style:background-image="url({HeroImage})"></div>
<div class="hero-text">
	<h1>Berlkot <span><br />Creative & Developer</span></h1>
	<p>
		<a class="link link-decor" href="/about#socials">socials</a> |
		<a class="link link-decor" href="mailto:contact@berlkot.com">Email</a>
	</p>
</div>
<section>
	<h2 class="heading">Latest to read</h2>
	<ul class="blog-list">
		{#each data.blogPosts as post (post.name)}
			<li>
				<ArticleCard {post} />
			</li>
		{/each}
	</ul>
	<div class="more-wrap">
		<a href="/blog" class="button link link-decor more-btn">More articles</a>
	</div>
</section>
<section>
	<h2 class="heading">Latest to look</h2>
	<ul class="gallery">
		{#each data.galleryPosts as galleryPost (galleryPost.name)}
			<li>
				<GalleryCard {galleryPost} />
			</li>
		{/each}
	</ul>
	<div class="more-wrap">
		<a href="/gallery" class="button link link-decor more-btn">More artworks</a>
	</div>
</section>

<style>
	.hero-text {
		font-family: var(--ff-display);
		margin-top: 175px;
		display: flex;
		justify-content: center;
		text-align: center;
		flex-direction: column;
		margin-bottom: 4rem;
	}
	.hero-text p {
		margin: 0;
		font: 1.6rem/0 var(--ff-display);
	}
	.hero-text h1 {
		font: 3.6rem/0.3em var(--ff-display);
	}
	.hero-text h1 span {
		font: 1.8rem/1em var(--ff-display);
	}
	.more-btn {
		font-family: var(--ff-display);
		display: block;
	}
	.more-wrap {
		justify-content: end;
		margin-top: 1.5rem;
		display: flex;
	}
	.hero-bg {
		position: absolute;
		width: 1262px;
		height: 300px;
		background-repeat: no-repeat;
		left: 50%;
		transform: translate(-50%, 0);
		top: -198px;
		z-index: -1;
	}
	.heading {
		display: flex;
		text-align: center;
		align-items: center;
		text-wrap: nowrap;
		margin-bottom: 1.5rem;
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
	@media (max-width: 730px) {
		.more-btn {
			flex: 1;
			font-size: 2rem;
		}
		.heading::before {
			display: none;
		}
	}
</style>
