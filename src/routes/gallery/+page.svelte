<script lang="ts">
	import { goto, preloadData, pushState } from '$app/navigation';
	import { page } from '$app/stores';
	import AssetPage from './[name]/+page.svelte';
	import Modal from '$lib/Modal.svelte';
	let dialog = $state();
	let { data } = $props();
</script>

<h1>Gallery</h1>
<section>
	{#each data.images as image}
		<div>
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
{#if $page.state.selected}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		id="modal"
		role="alert"
		bind:this={dialog}
		onclick={(e) => {
			if (e.target === dialog) {
				history.back();
			}
		}}
	>
		<button
			class="close"
			autofocus
			onclick={() => {
				history.back();
			}}>X</button
		>
		<div class:data>
			<AssetPage data={$page.state.selected} />
		</div>
	</div>
	<div class="backdrop"></div>
{/if}

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
	#modal {
		position: absolute;
		top: 50%;
		left: 50%;
		background-color: var(--bg-color);
		transform: translate(-50%, -50%);
		border: 2px outset var(--color-accent);
		width: 50%;
		height: 80%;
		z-index: 4;
		overflow: scroll;
	}
	#modal .close {
		position: sticky;
		top: 0;
	}

	.backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 3;
	}
	.data :global(*) {
		max-width: 100%;
	}
</style>
