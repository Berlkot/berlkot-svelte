<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import type { Asset } from '@prisma/client';
	import { addToast } from '$lib/stores/toastStore';
	import Modal from '$lib/components/Modal.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import CloseImg from '$lib/assets/icons/close.svg';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { form, data }: Props = $props();
	let images = $state(data.images);
	let modalIsOpen = $state(false);
	let editing = $state(false);
	let showConfirm = $state(false);
	function getRandomInt(max: number) {
		return Math.floor(Math.random() * max);
	}
	let currentImage: Asset | null = $state(null);
</script>

<section>
	{#each images as image (image.id)}
		<div class="imageContainer" data-image={image.id}>
			<div>
				<a href="/asset/{image.name}{image.type == 'VIDEO' ? '.mp4' : '.webp'}">
					<img
						src="/asset/{image.name}.webp?w=270&h=270"
						alt={image.alt}
						width="270"
						height="270"
					/>
				</a>
			</div>
			<div class="wrapper">
				<button
					onclick={() => {
						currentImage = image;
						modalIsOpen = true;
						editing = true;
					}}
					class="button">Edit</button
				>
				<button
					class="button button-danger"
					onclick={() => {
						currentImage = image;
						showConfirm = true;
					}}>Delete</button
				>
			</div>
		</div>
	{/each}
</section>
<button onclick={() => (modalIsOpen = true)} class="button">Add</button>

{#if showConfirm}
	<ConfirmDialog
		onconfirm={() => {
			showConfirm = false;
			let data = new FormData();
			data.append('name', currentImage!.name);
			fetch('?/delete', {
				method: 'POST',
				body: data
			})
				.then(() => {
					images.splice(images.indexOf(currentImage!), 1);
					currentImage = null;
					addToast({
						type: 'success',
						message: 'Successfully deleted!',
						timeout: 3000
					});
				})
				.catch(() => {
					currentImage = null;
					addToast({
						type: 'error',
						message: 'Failed to delete image',
						timeout: 3000
					});
				});
		}}
		onreject={() => (showConfirm = false)}
		text="Are you sure you want to delete this image?"
	/>
{/if}

{#if modalIsOpen}
	<Modal>
		<div class="form-container">
			<div class="flex-wr">
				<h2>{editing ? 'Edit image' : 'Create new image'}</h2>
				<button
					class="close"
					onclick={() => {
						modalIsOpen = false;
						editing = false;
						currentImage = null;
					}}
				>
					<img src={CloseImg} alt="" />
				</button>
			</div>

			<form
				method="POST"
				enctype="multipart/form-data"
				action={editing ? '?/edit' : '?/create'}
				use:enhance={({ formElement, formData, action, cancel, submitter }) => {
					(submitter as HTMLButtonElement).disabled = true;
					return async ({ result, update }) => {
						(submitter as HTMLButtonElement).disabled = false;
						if (result.type === 'success') {
							if (editing) {
								images[images.findIndex((image) => image.id === (result.data as Asset).id)] =
									result.data as Asset;
								const imageel = document.querySelector(
									`[data-image="${result.data!.id}"] img`
								) as HTMLImageElement;
								imageel.src = `/asset/${result.data!.name}.webp?w=270&h=270&${getRandomInt(1000)}`;
							} else {
								images = [...images, result.data as Asset];
							}
							addToast({
								type: 'success',
								message: 'Successfully updated!',
								timeout: 3000
							});
							modalIsOpen = false;
							editing = false;
							currentImage = null;
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
					<input name="id" type="hidden" value={currentImage!.id} hidden />
				{/if}
				{#if form?.message}<p class="error">{form?.message}</p>{/if}
				<div class="input-container">
					<label for="file"> File </label>
					<input id="file" name="file" type="file" required={!editing} />
				</div>
				<div class="input-container">
					<label for="name"> Name </label>
					<input id="name" name="name" type="text" required value={currentImage?.name} />
				</div>
				<div class="input-container">
					<label for="alt"> Alt </label>
					<input id="alt" name="alt" type="text" value={currentImage?.alt} />
				</div>
				<div class="input-container">
					<label for="type"> Type </label>
					<select id="type" name="type">
						<option value="IMAGE" selected={currentImage?.type === 'IMAGE' || !currentImage}
							>picture</option
						>
						<option value="VIDEO" selected={currentImage?.type === 'VIDEO'}>video</option>
					</select>
				</div>
				<div class="input-container">
					<label for="credit"> Credit </label>
					<input id="credit" name="credit" type="text" value={currentImage?.credit} />
				</div>
				<div class="input-container">
					<label for="visibility"> Visibility </label>
					<select id="visibility" name="visibility">
						<option value="ADMIN" selected={currentImage?.visibility === 'ADMIN' || !currentImage}
							>admin</option
						>
						<option value="PUBLIC" selected={currentImage?.visibility === 'PUBLIC'}>public</option>
						<option value="SUB_ONLY" selected={currentImage?.visibility === 'SUB_ONLY'}
							>for subs</option
						>
					</select>
				</div>
				<button class="submit" type="submit">{currentImage ? 'Update' : 'Add'}</button>
			</form>
		</div>
	</Modal>
{/if}

<style>
	section {
		display: flex;
		justify-content: space-evenly;
		flex-wrap: wrap;
		gap: 2rem;
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
	}
	.form-container form {
		background-color: var(--bg-color);
		width: 80%;
		padding: 20px;
		border-radius: 0 0 5px 5px;
	}

	section {
		display: flex;
		justify-content: space-evenly;
		flex-wrap: wrap;
	}
	.form-container .submit {
		margin-top: 20px;
		width: 100%;
	}
	h2 {
		margin: 0;
	}
</style>
