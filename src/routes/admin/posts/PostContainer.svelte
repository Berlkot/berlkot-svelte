<script lang="ts">
	import ConfirmDialog from '#modules/forms/ConfirmDialog.svelte';
	import { addToast } from '#modules/toast/toastStore.js';
	import ArticleCard from '#modules/article/components/ArticleCard.svelte';

	interface Props {
		post: any;
		onremove: () => void;
	}
	let { post, onremove }: Props = $props();
	let showConfirm = $state(false);
</script>

<div class="flex-we">
	<ArticleCard {post} />
	<a class="button" href={'/admin/posts/' + post.name}>Edit</a>
	<button class="button button-danger" onclick={() => (showConfirm = true)}>Delete</button>
</div>
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

<style>
	.flex-we {
		width: 33%;
	}
</style>
