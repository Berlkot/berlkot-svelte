<script lang="ts">
	import { goto, preloadData, pushState } from '$app/navigation';
	import { page } from '$app/stores';
	import AssetPage from './[name]/+page.svelte';
	import Modal from '$lib/Modal.svelte';
	import { fade, scale } from 'svelte/transition';
	import ConfirmDialog from '$lib/ConfirmDialog.svelte';
	import { browser } from "$app/environment"
	import CloseImg from '$lib/assets/icons/close.svg'
	let confirm = $state(false);
	let { data } = $props();
	let href = $state<string>('');
	async function navigate() {
		const result = await preloadData(href);

		if (result.type === 'loaded' && result.status === 200) {
			pushState(href, { selected: result.data });
		} else {
			// something bad happened! try navigating
			goto(href);
		}
	}
	let confirmedMatureContent = $state(false || (browser && localStorage.getItem('confirmedMatureContent') === 'true'));
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
{#if confirm}
	<ConfirmDialog
		text="This image contains 18+ content, do you want to proceed?"
		confirmText="Yes, I am"
		rejectText="No, Take me back!"
		onreject={() => (confirm = false)}
		onconfirm={async () => {
			confirmedMatureContent = true;
			localStorage.setItem('confirmedMatureContent', 'true');
			confirm = false;
			await navigate();
		}}
	/>
{/if}
<section>
	{#each data.images as image}
	<a
	href="/gallery/{image.name}"
	onclick={async (e) => {
		if (
			e.shiftKey || // or the link is opened in a new window
			e.metaKey ||
			e.ctrlKey // or a new tab (mac: metaKey, win/linux: ctrlKey)
			// should also consider clicking with a mouse scroll wheel
		) {
			return;
		}

		href = e.currentTarget.href;
		e.preventDefault();
		if (image.maturity > 0 && !confirmedMatureContent) {
			confirm = true;
		} else {
			await navigate();
		}
	}}
>
		<div class="image-card">
				{#if image.maturity > 0 && !confirmedMatureContent}
				<div class="card-text">
					<span>{image.maturity == 2 ? 'NSFW' : 'Questionable'}</span>
					<span class="click-to-reveal">Click to reveal (18+)</span>
				</div>
				{:else}
					<img
						src="/asset/{image.name}.webp?w=270&h=270"
						alt={image.alt}
						width="270"
						height="270"
					/>
				{/if}

			<div class="title">
				<p>{image.title || image.name}</p>
			</div>

		</div>
	</a>
	{/each}
</section>
{#if $page.state.selected}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<Modal onclose={() => history.back()}>
		<div in:scale={{ start: 0.0, duration: 300 }} out:fade={{ duration: 100 }}>
			<!-- svelte-ignore a11y_autofocus -->
			<button
				class="close"
				autofocus
				onclick={() => {
					history.back();
				}}>
				<img src="{CloseImg}" alt="">
				</button
			>
			<div class="data">
				<AssetPage data={$page.state.selected} />
			</div>
		</div>
	</Modal>
{/if}

<style>
	.click-to-reveal {
		font-size: 1rem;
	}
	.card-text {
		text-align: center;
	}
	span {
		display: block;
	}
	a {
		text-decoration: none;
		color: inherit;
		font-size: 1.6rem;
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
		position: relative;
		transition: 0.2s filter linear;
	}
	.image-card:hover {
		filter: var(--chromatic-aberration);
	}
	.image-card:hover p {
		filter: var(--chromatic-aberration);
		opacity: 1;
	}
	.image-card:hover img {
		filter: blur(1px);
	}

	.image-card:hover .title {
		opacity: 1;
	}

	.image-card p {
		font-size: 2rem;
		opacity: 0;
		transition: opacity 0.2s ease-in-out;
	}
	.image-card .title {
		opacity: 0;
		width: 100%;
		height: 100%;
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--color-shadow);
		transition: opacity 0.2s ease-in-out;
	}

	img {
		object-fit: cover;
		min-height: 100%;
		width: 100%;
		transition: 0.2s filter linear;
	}

	.close {
		position: fixed;
		top: 0;
		background-color: var(--color-shadow);
		border-radius: 3px;
		padding: 8px 10px;
		margin: 2px;
	}
	.data {
		max-width: 100%;
	}
</style>
