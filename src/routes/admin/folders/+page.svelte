<script lang="ts">
	// FIXME
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	import type { GalleryFolder } from '$prisma-generated/client';
	import { addToast } from '$lib/stores/toastStore';
	import Modal from '$lib/components/Modal.svelte';
	import Autocomplete from '$lib/components/Autocomplete.svelte';
	import CloseImg from '$lib/assets/icons/close.svg';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { form, data }: Props = $props();
	let images = $derived(data.images);
	let galleryFolders: GalleryFolder[] = $derived(data.folders);
	let modalIsOpen = $state(false);
	let currentFolder: GalleryFolder | null = $state(null);
	let editing = $state(false);
	let showConfirm = $state(false);
	let focused = $state(false);


	async function searchImages(keyword: string) {
		return images.filter((i) => i.name.includes(keyword));
	}
</script>

{#snippet selectedItem(image)}
	<div class="image-select-item" class:blur-item={focused}>
		<img src="/asset/{image.name}.webp?w=270&h=270" alt="" width="50" height="50" />
		<p>{image.name}</p>
	</div>
{/snippet}

{#snippet optionItem(image)}
	<div class="image-option-item">
		<img src="/asset/{image.name}.webp?w=270&h=270" alt="" width="50" height="50" />
		<p>{image.name}</p>
	</div>
{/snippet}

{#if showConfirm}
	<ConfirmDialog
		onconfirm={() => {
			showConfirm = false;
			let data = new FormData();
			data.append('name', currentFolder!.name);
			fetch('?/delete', {
				method: 'POST',
				body: data
			})
				.then(() => {
					galleryFolders.splice(galleryFolders.indexOf(currentFolder!), 1);
					currentFolder = null;
					addToast({
						type: 'success',
						message: 'Successfully deleted!',
						timeout: 3000
					});
				})
				.catch(() => {
					currentFolder = null;
					addToast({
						type: 'error',
						message: 'Failed to delete folder',
						timeout: 3000
					});
				});
		}}
		onreject={() => (showConfirm = false)}
		text="Are you sure you want to delete this folder?"
	/>
{/if}

<section>
	<ul class="gallery">
		{#each galleryFolders as galleryFolder (galleryFolder.id)}
			<li data-image={galleryFolder.id}>
    			<div class="folder">
    				{#if galleryFolder.heroImage}
    					<img src="/asset/{galleryFolder.heroImage.name}.webp?w=270&h=270" alt="" />
    				{/if}
    				<p class="title">{galleryFolder.name}</p>
    			</div>
				<div class="wrapper">
					<button
						onclick={() => {
							currentFolder = galleryFolder;
							modalIsOpen = true;
							editing = true;
						}}
						class="button">Edit</button
					>
					<button
						class="button button-danger"
						onclick={() => {
							currentFolder = galleryFolder;
							showConfirm = true;
						}}>Delete</button
					>
				</div>
			</li>
		{/each}
	</ul>
</section>
<button onclick={() => (modalIsOpen = true)} class="button">Add</button>

{#if modalIsOpen}
	<Modal>
		<div class="form-container">
			<div class="flex-wr">
				<h2>{editing ? 'Edit folder' : 'Create new folder'}</h2>
				<button
					class="close"
					onclick={() => {
					    modalIsOpen = false;
       					editing = false;
       					currentFolder = null;
					}}
				>
					<img src={CloseImg} alt="" />
				</button>
			</div>

			<form
			    class="admin-form"
				method="POST"
				enctype="multipart/form-data"
				action={editing ? '?/edit' : '?/create'}
				use:enhance={({ formElement, formData, action, cancel, submitter }) => {
					(submitter as HTMLButtonElement).disabled = true;
					return async ({ result, update }) => {
						(submitter as HTMLButtonElement).disabled = false;
						if (result.type === 'success') {
							if (editing) {
								galleryFolders[
									galleryFolders.findIndex((post) => post.id === (result.data as GalleryFolder).id)
								] = result.data as GalleryFolder;
							} else {
								galleryFolders = [...galleryFolders, result.data as GalleryFolder];
							}
							addToast({
								type: 'success',
								message: 'Successfully updated!',
								timeout: 3000
							});
							modalIsOpen = false;
							editing = false;
							currentFolder = null;
						} else if (result.type === 'failure') {
							addToast({
								type: 'error',
								message: result.data?.message as string,
								timeout: 3000
							});
						}
					};
				}}
			>
				{#if editing}
					<input name="id" type="hidden" value={currentFolder!.id} hidden />
				{/if}
				{#if form?.message}<p class="error">{form?.message}</p>{/if}
				<div class="input-container">
					<label for="assets">Image</label>
					<div class="tags">
    					<Autocomplete
    						name="heroImage"
    						optFunction={searchImages}
    						{optionItem}
    						{selectedItem}
    						key="name"
    						defaultSelected={currentFolder && currentFolder.heroImage ? [currentFolder.heroImage] : []}
    						multipule={false}
    						delay={200}
    						allowNew={false}
    						onFocusChange={(val) => {
    							focused = val;
    						}}
    					/>
					</div>
				</div>
				<div class="input-container">
					<label for="name">Name</label>
					<input id="name" name="name" type="text" required value={currentFolder?.name} />
				</div>
				<div class="input-container">
					<label for="description">Description</label>
					<textarea
						id="description"
						name="description"
						value={currentFolder?.description}
					></textarea>
				</div>
				<div class="input-container">
					<label for="width">Width</label>
					<input
						id="width"
						name="width"
						type="number"
						value={currentFolder?.width || 1}
					/>
				</div>
				<div class="input-container">
					<label for="height">Height</label>
					<input
						id="height"
						name="height"
						type="number"
						value={currentFolder?.height || 1}
					/>
				</div>
				<button class="submit" type="submit">{currentFolder ? 'Update' : 'Add'}</button>
			</form>
		</div>
	</Modal>
{/if}

<style>
	@media (max-width: 712px) {
		ul.gallery {
			grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
			grid-template-rows: repeat(auto-fill, minmax(160px, 1fr));
		}
	}
	ul.gallery li {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.tags {
		display: flex;
		width: 50%;
	}
	.wrapper {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.form-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100%;
		margin: 50px;
	}
	.flex-wr {
		display: flex;
		position: sticky;
		top: 0px;
		padding: 8px 20px;
		border-bottom: 2px solid var(--color-accent);
		background-color: var(--bg-color);
		justify-content: space-between;
		width: 80%;
		border-radius: 5px 5px 0 0;
		z-index: 1;
	}
	.form-container form {
		background-color: var(--bg-color);
		width: 80%;
		padding: 20px;
		border-radius: 0 0 5px 5px;
	}
	.form-container .submit {
		margin-top: 20px;
		width: 100%;
	}
	h2 {
		margin: 0;
	}
	.image-select-item {
		display: flex;
		align-items: center;
		margin: 5px;
		margin-right: -20%;
		gap: 1rem;
		transition: filter 0.3s ease-in-out;
	}
	.image-option-item {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	.image-option-item p,
	.image-select-item p {
		margin-bottom: 0;
		display: inline-block;
	}
	.blur-item {
		filter: blur(0.8px) grayscale() opacity(0.5);
	}
</style>
