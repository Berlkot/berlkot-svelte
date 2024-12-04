<script lang="ts">
	import Modal from '$lib/Modal.svelte';
	import ConfirmDialog from '$lib/ConfirmDialog.svelte';
	import type { Asset } from '@prisma/client';
	import { addToast } from '$lib/stores/toastStore';
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	interface Props {
		image: Asset;
		form: ActionData;
		onremove: () => void;
	}
	let { image, form, onremove }: Props = $props();
	let showModal = $state(false);
	let showConfirm = $state(false);
	function getRandomInt(max: number) {
		return Math.floor(Math.random() * max);
	}
</script>

<div class="imageContainer" data-image={image.id}>
	<div>
		<a href="/asset/{image.name}{image.type == 1 ? '.mp4' : '.webp'}">
			<img src="/asset/{image.name}.webp?w=270&h=270" alt={image.alt} width="270" height="270" />
		</a>
	</div>
	<div class="wrapper">
		<button onclick={() => (showModal = true)} class="button">Edit</button>
		<button class="button button-danger" onclick={() => (showConfirm = true)}>Delete</button>
	</div>
</div>

{#if showConfirm}
	<ConfirmDialog
		onconfirm={() => {
			showConfirm = false;
			let data = new FormData();
			data.append('name', image.name);
			fetch('?/delete', {
				method: 'POST',
				body: data
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
		text="Are you sure you want to delete this image?"
	/>
{/if}

{#if showModal}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
	<Modal>
		<div class="form-container">
			<div class="flex-wr">
				<h2>Edit image</h2>
				<!-- svelte-ignore a11y_autofocus -->
				<button class="close" autofocus onclick={() => (showModal = false)}>X</button>
			</div>

			<form
				method="POST"
				enctype="multipart/form-data"
				action="?/edit"
				use:enhance={({ formElement, formData, action, cancel, submitter }) => {
					(submitter as HTMLButtonElement).disabled = true;
					return async ({ result, update }) => {
						(submitter as HTMLButtonElement).disabled = false;
						if (result.type === 'success') {
							Object.assign(image, result.data as Asset);
							const imageel = document.querySelector(
								`[data-image="${image.id}"] img`
							) as HTMLImageElement;
							imageel.src = `/asset/${image.name}.webp?w=270&h=270&${getRandomInt(1000)}`;
							addToast({
								type: 'success',
								message: 'Successfully updated!',
								timeout: 3000
							});
							showModal = false;
						} else if (result.type === 'failure') {
							addToast({
								type: 'error',
								message: String(result.data?.message),
								timeout: 3000
							});
						} else if (result.type === 'error') {
							addToast({
								type: 'error',
								message: result.error.message,
								timeout: 3000
							})
						}
					};
				}}
			>
				<input name="id" type="hidden" value={image.id} hidden/>
				{#if form?.message}<p class="error">{form?.message}</p>{/if}
				<label>
					File
					<input name="file" type="file" />
				</label>
				<label>
					Name
					<input name="name" type="text" required value={image.name} />
				</label>
				<label>
					Author
					<input name="author" type="text" value={image.author} />
				</label>
				<label>
					Title
					<input name="title" type="text" value={image.title} />
				</label>
				<label>
					Alt
					<input name="alt" type="text" value={image.alt} />
				</label>
				<label>
					Type
					<select name="type">
						<option value="0" selected={image.type == 0}>picture</option>
						<option value="1" selected={image.type == 1}>video</option>
					</select>
				</label>
				<label>
					Content warning
					<input name="contentWarning" type="text" value={image.contentWarning} />
				</label>
				<label>
					Copyright
					<input name="copyright" type="text" value={image.copyright} />
				</label>
				<label>
					Small Description
					<textarea name="smallDescription">{image.smallDescription}</textarea>
				</label>
				<label>
					Large Description
					<textarea name="largeDescription" rows="10">{image.largeDescription}</textarea>
				</label>
				<label>
					Creation Date
					<input
						name="creationDate"
						type="date"
						value={image.creationDate.toISOString().substring(0, 10)}
					/>
				</label>
				<label>
					Gallery image
					<select name="inGallery">
						<option value="true" selected={image.inGallery}>true</option>
						<option value="false" selected={!image.inGallery}>false</option>
					</select>
				</label>
				<label>
					Visibility
					<select name="visibility">
						<option value="-1" selected={image.visibility == -1}>admin</option>
						<option value="0" selected={image.visibility == 0}>public</option>
						<option value="1" selected={image.visibility == 1}>for subs</option>
					</select>
				</label>
				<label>
					Maturity
					<select name="maturity">
						<option value="0" selected={image.maturity == 0}>sfw</option>
						<option value="1" selected={image.maturity == 1}>questionable</option>
						<option value="2" selected={image.maturity == 2}>nsfw</option>
					</select>
				</label>

				<button class="submit" type="submit">Update</button>
			</form>
		</div>
	</Modal>
{/if}

<style>
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
	.close {
		margin: 0;
		padding: 8px;
		height: min-content;
		border: none;
	}
	.form-container .submit {
		margin-top: 20px;
		width: 100%;
	}
	h2 {
		margin: 0;
	}
</style>
