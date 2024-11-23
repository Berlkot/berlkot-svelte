<script lang="ts">
	let { data } = $props();
</script>

<h1>Gallery</h1>
<section>
	{#each data.images as image}
		<div>
			<a href="/gallery/{image.name}">
				{#if image.maturity > 0}
					<div class="readcted">redacted</div>
				{:else}
					<img
						src="/asset/{image.name}.webp?w=270&h=270"
						alt={image.alt}
						width="270"
						height="270"
					/>
				{/if}
			</a>
		</div>
	{/each}
</section>

<style>
	a {
		display: block;
		width: 100%;
		height: 100%;
	}
	.readcted {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: grey;
	}
	section {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
	}
	img {
		object-fit: cover;
		min-height: 100%;
		width: 100%;
	}
</style>
