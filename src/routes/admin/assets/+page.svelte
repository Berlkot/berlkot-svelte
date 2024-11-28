<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	
	import type { Asset } from '@prisma/client';
	import { addToast } from '$lib/toastStore';
	import Modal from '$lib/Modal.svelte';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { form, data }: Props = $props();
	let images = $state(data.images);
	let modalType: '' | 'create' | 'edit' = $state('');
	let modal = $state<Modal>();
	type Image = PageData['images'][0];
	let image: Image | undefined = $state();
	function openModal(imageinp: undefined | Image) {
		if (imageinp) {
			image = imageinp;
			modalType = 'edit';
		} else {
			modalType = 'create';
		}
		modal?.openModal();
	}
	function getRandomInt(max: number) {
		return Math.floor(Math.random() * max);
	}
</script>


<section>
	{#each images as image}
		<div class="imageContainer" data-image={image.name}>
			<div>
				<a href="/asset/{image.name}{image.type == 1 ? '.mp4' : '.webp'}">
					<img
						src="/asset/{image.name}.webp?w=270&h=270"
						alt={image.alt}
						width="270"
						height="270"
					/>
				</a>
			</div>
			<div class="wrapper">
				<button onclick={() => openModal(image)} class="button">Edit</button>
				<form
					action="?/delete"
					method="POST"
					use:enhance={() => {
						return ({ result }) => {
							if (result.type === 'success') {
								images = images.filter((el) => el.name != image.name);
								addToast({
									type: 'success',
									message: 'Successfully deleted!',
									timeout: 3000
								});
							} else {
								addToast({
									type: 'error',
									message: 'Error occured!',
									timeout: 3000
								});
							}
						};
					}}
				>
					<input hidden value={image.name} name="name" />
					<button class="button button-danger">Delete</button>
				</form>
			</div>
		</div>
	{/each}
</section>
<button onclick={() => openModal(undefined)} class="button">Add</button>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<Modal bind:this={modal} onclose={() => (image = undefined)}>
	<div class="form-container">
		<div class="flex-wr">
			<h2>{modalType == 'create' ? 'Create new image' : 'Edit image'}</h2>
			<!-- svelte-ignore a11y_autofocus -->
			<button class="close" autofocus onclick={() => modal?.closeModal()}>X</button>
		</div>

		<form
			method="POST"
			enctype="multipart/form-data"
			action="?/{modalType}"
			use:enhance={({ formElement, formData, action, cancel, submitter }) => {
				return async ({ result, update }) => {
					if (result.type === 'success') {
						if (modalType == 'create') {
							images = [...images, result.data as Asset];
							image = undefined;
							addToast({
								type: 'success',
								message: 'Successfully updated!',
								timeout: 3000
							});
							modal?.closeModal();
						} else if (modalType == 'edit' && image) {
							Object.assign(image, result.data as Asset);
							const imageel = document.querySelector(
								`[data-image="${image.name}"] img`
							) as HTMLImageElement;
							imageel.src = `/asset/${image.name}.webp?w=270&h=270&${getRandomInt(1000)}`;
							addToast({
								type: 'success',
								message: 'Successfully updated!',
								timeout: 3000
							});
							modal?.closeModal();
						}
					} else if (result.type === 'failure') {
						addToast({
							type: 'error',
							message: result.data?.message,
							timeout: 3000
						});
					}
				};
			}}
		>
			{#if form?.message}<p class="error">{form?.message}</p>{/if}
			<label>
				File
				<input name="file" type="file" required={modalType == 'edit' ? false : true} />
			</label>
			<label>
				Name
				<input name="name" type="text" required value={image ? image.name : ''} />
			</label>
			<label>
				Author
				<input name="author" type="text" value={image ? image.author : 'Berlkot'} />
			</label>
			<label>
				Title
				<input name="title" type="text" value={image ? image.title : ''} />
			</label>
			<label>
				Alt
				<input name="alt" type="text" value={image ? image.alt : ''} />
			</label>
			<label>
				Type
				<select name="type">
					<option value="0" selected={image ? image.type == 0 : true}>picture</option>
					<option value="1" selected={image ? image.type == 1 : false}>video</option>
				</select>
			</label>
			<label>
				Content warning
				<input name="contentWarning" type="text" value={image ? image.contentWarning : ''} />
			</label>
			<label>
				Copyright
				<input name="copyright" type="text" value={image ? image.copyright : ''} />
			</label>
			<label>
				Small Description
				<textarea name="smallDescription">{image ? image.smallDescription : ''}</textarea>
			</label>
			<label>
				Large Description
				<textarea name="largeDescription" rows="10">{image ? image.largeDescription : ''}</textarea>
			</label>
			<label>
				Creation Date
				<input
					name="creationDate"
					type="date"
					value={image ? image.creationDate.toISOString().substring(0, 10) : ''}
				/>
			</label>
			<label>
				Gallery image
				<select name="inGallery">
					<option value="true" selected={image ? image.inGallery : false}>true</option>
					<option value="false" selected={image ? !image.inGallery : true}>false</option>
				</select>
			</label>
			<label>
				Visibility
				<select name="visibility">
					<option value="-1" selected={image ? image.visibility == -1 : true}>admin</option>
					<option value="0" selected={image ? image.visibility == 0 : false}>public</option>
					<option value="1" selected={image ? image.visibility == 1 : false}>for subs</option>
				</select>
			</label>
			<label>
				Maturity
				<select name="maturity">
					<option value="0" selected={image ? image.maturity == 0 : true}>sfw</option>
					<option value="1" selected={image ? image.maturity == 1 : false}>questionable</option>
					<option value="2" selected={image ? image.maturity == 2 : false}>nsfw</option>
				</select>
			</label>

			<button class="submit" type="submit">{modalType == 'create' ? 'Add' : 'Update'}</button>
		</form>
	</div>
</Modal>

<style>
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
		width: 70%;
		border-radius: 5px 5px 0 0;
	}
	.form-container form {
		background-color: var(--bg-color);
		width: 70%;
		padding: 20px;
		border-radius: 0 0 5px 5px;
	}
	.close {
		margin: 0;
		padding: 8px;
		height: min-content;
		border: none;
	}
	.wrapper {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	section {
		display: flex;
		justify-content: space-evenly;
	}
	.form-container .submit {
		margin-top: 20px;
		width: 100%;
	}
	h2 {
		margin: 0;
	}
</style>
