<!-- @migration-task Error while migrating Svelte code: Can only bind to an Identifier or MemberExpression -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import Toasts from '$lib/toasts.svelte';
	import type { Asset } from '@prisma/client';
	import { addToast } from '$lib/toastStore';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { form, data }: Props = $props();
	let images = $state(data.images);
	let showModal = $state(false);
	let dialog: HTMLDivElement = $state();
	let modalType: '' | 'create' | 'edit' = $state('');
	type Image = PageData['images'][0];
	let image: Image | undefined = $state();
	function openModal(imageinp: undefined | Image) {
		if (imageinp) {
			image = imageinp;
			modalType = 'edit';
			
		} else {
			modalType = 'create';
		}
		dialog.style.display = 'block';
		document.getElementsByClassName('backdrop')[0].style.display = 'block';
	}
	function getRandomInt(max: number) {
		return Math.floor(Math.random() * max);
	}
	function closeModal() {
		dialog.style.display = 'none';
		document.getElementsByClassName('backdrop')[0].style.display = 'none';
		dialog.getElementsByTagName('form')[0].reset();
	}
</script>

<Toasts />
<section>
	{#each images as image}
		<div class="imageContainer" data-image={image.name}>
			<div>
				<a href="/asset/{image.name}.{image.type == 1 ? ".mp4" : ".webp"}">
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
								})
							} else {
							addToast({
									type: 'error',
									message: 'Error occured!',
									timeout: 3000
								})}
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
<div id ="modal" role="alert"
	bind:this={dialog}
	onclick={(e) => {
		if (e.target === dialog) {
			closeModal();
			image = undefined;
		}
	}}
>
<div class="form-container">
	<div class="wrapper">
		<h2>{modalType == 'create' ? 'Create new image' : 'Edit image'}</h2>
		<!-- svelte-ignore a11y_autofocus -->
		<button class="close"
			autofocus
			onclick={() => {
				closeModal();
				image = undefined;
			}}>X</button
		>
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
						})
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
						})
					} 
			} else {
						addToast({
									type: 'error',
									message: result.data.message,
									timeout: 3000
								})
					}
				}
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

		<button type="submit">{modalType == 'create' ? 'Add' : 'Update'}</button>
	</form>
</div>
</div>
<div class="backdrop"></div>
<style>
	.backdrop {
		display: none;
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 3;
	}
	.form-container {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	#modal {
		display: none;
		position: absolute;
		top: 50%;
		left: 50%;
		background-color: var(--bg-color);
		transform: translate(-50%, -50%);
		border: 2px outset var(--color-accent);
		width: 50%;
		height: 80%;
		z-index: 4;
		
	}
	#modal .wrapper {
		position: sticky;
		top: 0px;
		padding: 5px;
		border-bottom: 2px outset var(--color-accent);
		background-color: var(--bg-color);
	}
	#modal form {
		padding: 15px;
		overflow: scroll;

	}
	h2 {
		margin: 0;
	}
	.close {
		margin: 0;
		padding: 8px;
		height: min-content;
	}
	.wrapper {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>
