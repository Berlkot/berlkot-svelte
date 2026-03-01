<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import type { ActionData, PageData } from './$types';
	import PostContainer from './PostContainer.svelte';

	interface Props {
		data: PageData;
		form: ActionData;
	}
	let { form, data }: Props = $props();
	let posts = $derived(data.posts);
	let showModal = $state(false);
</script>
<div class="flexx">
    {#each posts as post (post.name)}
        <PostContainer {post} onremove={() => (posts = posts.filter((p) => p.name != post.name))} />
    {/each}
</div>

<button onclick={() => (showModal = true)}>Add</button>

{#if showModal}
	<Modal>
		<form method="POST" action="?/create">
			{#if form?.message}<p class="error">{form?.message}</p>{/if}
			<label>
				Name
				<input name="name" type="text" required />
			</label>
			<label>
				Title
				<input name="title" type="text" required />
			</label>
			<button type="submit">Add</button>
		</form>
	</Modal>
{/if}

<style>
	label {
		display: block;
	}
	.flexx {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-around;
		gap: 1rem;
		margin: 2.5rem;
	}
</style>
