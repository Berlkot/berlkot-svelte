<script lang="ts">
	import ConfirmDialog from '$lib/ConfirmDialog.svelte';
	import type { Post } from '@prisma/client';
	import { addToast } from '$lib/stores/toastStore';

	interface Props {
		post: Post;
		onremove: () => void;
	}
	let { post, onremove }: Props = $props();
	let showConfirm = $state(false);
</script>

<a href="/blog/{post.name}">{post.title}</a>
<a class="button" href="posts/{post.name}">Edit</a>
<button class="button button-danger" onclick={() => (showConfirm = true)}>Delete</button>
{#if showConfirm}
	<ConfirmDialog
		onconfirm={() => {
			showConfirm = false;
			let fdata = new FormData();
			fdata.append('name', post.name);
			fetch('?/delete', {
				method: 'POST',
				body: fdata
			})
				.then(() => {
					addToast({
						type: 'success',
						message: 'Successfully deleted!',
						timeout: 3000
					});
					onremove();
				})
				.catch(() => {
					addToast({
						type: 'error',
						message: 'Failed to delete image',
						timeout: 3000
					});
				});
		}}
		onreject={() => (showConfirm = false)}
		text="Are you sure you want to delete this post?"
	/>
{/if}
