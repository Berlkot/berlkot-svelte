<script lang="ts">
	import { goto, preloadData, pushState } from '$app/navigation';
	import { page } from '$app/state';
	import ConfirmDialog from '$lib/ConfirmDialog.svelte';
	import CloseImg from '$lib/assets/icons/close.svg';
	import Modal from '$lib/Modal.svelte';
	import AssetPage from '$routes/gallery/[name]/+page.svelte';
	import { fade, scale } from 'svelte/transition';
	import { confirmedMatureContent } from './stores/persistent';
	let { galleryPost } = $props();
	let href = $state<string>('');
	let confirm = $state(false);
	async function navigate() {
		const result = await preloadData(href);

		if (result.type === 'loaded' && result.status === 200) {
			pushState(href, { selected: result.data });
		} else {
			// something bad happened! try navigating
			goto(href);
		}
	}
</script>

{#if confirm}
	<ConfirmDialog
		text="This image contains 18+ content, do you want to proceed?"
		confirmText="Yes, I am"
		rejectText="No, Take me back!"
		onreject={() => (confirm = false)}
		onconfirm={async () => {
			confirmedMatureContent.update((value) => true);
			localStorage.setItem('confirmedMatureContent', 'true');
			confirm = false;
			await navigate();
		}}
	/>
{/if}

<a
	href="/gallery/{galleryPost.name}"
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
		if (galleryPost.maturity != 'SFW' && !$confirmedMatureContent) {
			confirm = true;
		} else {
			await navigate();
		}
	}}
>
	<div class="image-card focusable">
		{#if galleryPost.maturity != 'SFW'}
			<div class="card-text">
				<span>{galleryPost.maturity == 'NSFW' ? 'NSFW' : 'Questionable'}</span>
				<span class="click-to-reveal">Click to reveal (18+)</span>
			</div>
		{:else}
			<img src="/asset/{galleryPost.assets[0].asset.name}.webp?w=270&h=270" alt={galleryPost.assets[0].asset.alt} width="270" height="270" />
		{/if}

		<div class="title">
			<p>{galleryPost.title || galleryPost.name}</p>
		</div>
	</div>
</a>

{#if page.state.selected}
	<Modal onclose={() => history.back()}>
		<div in:scale={{ start: 0.0, duration: 300 }} out:fade={{ duration: 100 }}>
			<!-- svelte-ignore a11y_autofocus -->
			<button
				class="close"
				autofocus
				onclick={() => {
					history.back();
				}}
			>
				<img src={CloseImg} alt="" />
			</button>
			<div class="data">
				<AssetPage data={page.state.selected} />
			</div>
		</div>
	</Modal>
{/if}

<style>
	.click-to-reveal {
		font: 1.4rem/1.2em var(--ff-paragraph);
		font-weight: bold;
	}
	.card-text {
		font: bold 2rem/1.2em var(--ff-display);

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
	.image-card {
		aspect-ratio: 1/1;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: repeating-linear-gradient(-45deg, black 0px, #62498f 4px, rgba(0, 0, 0, 0) 8px);
		border-radius: 4px;
		transition: 0.2s filter linear;
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
	.title p {
		margin: 0;
		text-align: center;
	}

	.image-card p {
		font: bold 2.25rem/1.2em var(--ff-display);
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
		display: flex;
		position: fixed;
		top: 0;
		background-color: var(--color-shadow);
		border-radius: 3px;
		z-index: 2;
		padding: 10px;
		margin: 2px;
	}
	.data {
		max-width: 100%;
	}
</style>
