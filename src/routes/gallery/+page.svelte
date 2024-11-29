<script lang="ts">
	import { goto, preloadData, pushState } from '$app/navigation';
	import { page } from '$app/stores';
	import AssetPage from './[name]/+page.svelte';
	import Modal from '$lib/Modal.svelte';
	import { fade, scale } from 'svelte/transition';
	let modal = $state<Modal>();
	let { data } = $props();
	$effect(() => {$page.state.selected ? modal?.openModal() : ""})

</script>

<svelte:head>
	<title>Berlkot gallery</title>
</svelte:head>
<h1>Gallery</h1>
<form action="">
	<select name="tags" id="" multiple>
		{#each data.tags as tag}
			<option value={tag.name}>{tag.name}</option>
		{/each}
	</select>
	<input type="text" name="search" id="">
	<button type="submit">Search</button>
</form>
<section>
	{#each data.images as image}
		<div class="image-card">
			<a
				href="/gallery/{image.name}"
				onclick={async (e) => {
					if (
						e.shiftKey || // or the link is opened in a new window
						e.metaKey ||
						e.ctrlKey // or a new tab (mac: metaKey, win/linux: ctrlKey)
						// should also consider clicking with a mouse scroll wheel
					)
						return;
					// prevent navigation
					e.preventDefault();

					const { href } = e.currentTarget;

					// run `load` functions (or rather, get the result of the `load` functions
					// that are already running because of `data-sveltekit-preload-data`)
					const result = await preloadData(href);

					if (result.type === 'loaded' && result.status === 200) {
						pushState(href, { selected: result.data });
					} else {
						// something bad happened! try navigating
						goto(href);
					}
				}}
			>
				{#if image.maturity > 0}
					redacted
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
{#if $page.state.selected}

	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<Modal bind:this={modal} onclose={()=>history.back()} preventDefault={true}>
		<div in:scale={{ start: 0.0, duration: 300}} out:fade={{ duration: 100 }} >
			<!-- svelte-ignore a11y_autofocus -->
			<button
				class="close"
				autofocus
				onclick={() => {
					history.back();
				}}>X</button
			>
			<div class="data">
				<AssetPage data={$page.state.selected} />
			</div>
		</div>
	</Modal>
{/if}


<style>
	a {
		display: block;
		width: 100%;
		height: 100%;
		text-align: center;
  		align-content: center;
	}
	
	section {
		display: grid;
		gap: 8px;
		grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
		grid-template-rows: repeat(auto-fill, minmax(210px, 1fr));
	}
	.image-card {
		aspect-ratio: 1/1;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: grey;
		border-radius: 4px;
		overflow: hidden;
	}
	img {
		object-fit: cover;
		min-height: 100%;
		width: 100%;
	}

	.close {
		position: absolute;
		top: 0;
		background-color: rgba(0, 0, 0, 0.541);
		border-radius: 3px;
		padding: 8px 10px;
		margin: 2px;
	}
	.data {
		max-width: 100%;
	}
</style>
