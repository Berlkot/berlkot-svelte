<!-- @migration-task Error while migrating Svelte code: Can only bind to an Identifier or MemberExpression -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import Toasts from '$lib/toasts.svelte';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { form, data }: Props = $props();
	let images = $state(data.images);
	let showModal = $state(false);
	let dialog: HTMLDialogElement | undefined = $state();
	let modalType: '' | 'create' | 'edit'  = $state('')
	type Image = PageData['images'][0]
	let image: Image | undefined = $state()
	function openModal(imageinp: undefined | Image) {
		if (imageinp) {
			image = imageinp
			modalType = 'edit'
			dialog.showModal()
		} else {
			modalType = 'create'
			dialog.showModal()
		}
		
	}
	function getRandomInt(max: number) {
  		return Math.floor(Math.random() * max);
	}
</script>

<Toasts/>
<section>
	{#each images as image}
		<div class="imageContainer" data-image={image.name}>
			<div>
				<a href="/image/{image.name}.webp">
					<img
						src="/image/{image.name}.webp?w=270&h=270"
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
<button onclick={() => (openModal(undefined))} class="button">Add</button>
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialog}
	onclick={(e) => {
		if (e.target === dialog) {dialog.close(); image = undefined};
	}}
>
<div class="wrapper">


	<h2>{modalType == 'create' ? 'Create new image' : 'Edit image'}</h2>
	<!-- svelte-ignore a11y_autofocus -->
	<button autofocus onclick={() => {dialog.close();image = undefined}}>X</button>
</div>
	<form method="POST" enctype="multipart/form-data" action="?/{ modalType }"   	use:enhance={({ formElement, formData, action, cancel, submitter }) => {
		// `formElement` is this `<form>` element
		// `formData` is its `FormData` object that's about to be submitted
		// `action` is the URL to which the form is posted
		// calling `cancel()` will prevent the submission
		// `submitter` is the `HTMLElement` that caused the form to be submitted

		return async ({ result, update }) => {
			//console.log(result)
			if (result.type === 'success') {
				if (modalType == 'create') {
					images = [...images, result.data]
					image = undefined
				}
				else {
					Object.assign(image, result.data)
					const imageel = document.querySelector(`[data-image="${image.name}"] img`)
					imageel.src = `/image/${image.name}.webp?w=270&h=270&${getRandomInt(1000)}`
					//console.log(image)
				}
			}
			// `result` is an `ActionResult` object
			// `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
			
		};
	}}>
		{#if form?.message}<p class="error">{form?.message}</p>{/if}
		<label>
			File
			<input name="file" type="file" required={modalType == 'edit' ? false : true} />
		</label>
		<label>
			Name
			<input name="name" type="text" required value={image ? image.name : ''}/>
		</label>
		<label>
			Author
			<input name="author" type="text" value={image ? image.author : 'Berlkot'} />
		</label>
		<label>
			Title
			<input name="title" type="text" value={image ? image.title : ''}/>
		</label>
		<label>
			Alt
			<input name="alt" type="text" value={image ? image.alt : ''}/>
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
			<input name="creationDate" type="date" value={image ? image.creationDate.toISOString().substring(0, 10) : ''} />
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
	
</dialog>

<style>
	.wrapper {
		display: flex;
		justify-content: space-between;
	}
</style>
