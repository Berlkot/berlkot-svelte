<script lang="ts">
	import ConfirmDialog from '$lib/ConfirmDialog.svelte';
	import Modal from '$lib/Modal.svelte';
	import { addToast } from '$lib/stores/toastStore';
	import type { ActionData, PageData } from './$types';
	import PostContainer from './PostContainer.svelte';

	interface Props {
		data: PageData;
		form: ActionData;
	}
	let { form, data }: Props = $props();
	let posts = $state(data.posts);
	let showModal = $state(false);
</script>

{#each posts as post}
	<PostContainer {post} onremove={() => (posts = posts.filter((p) => p.name != post.name))} />
{/each}
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
			<input name="title" type="text" required/>
		</label>
		<button type="submit">Add</button>
	</form>
</Modal>
{/if}

<style>
	label {
		display: block;
	}
</style>
