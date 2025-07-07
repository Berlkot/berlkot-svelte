<script lang="ts">
	// FIXME
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	import type { Asset } from '@prisma/client';
	import { addToast } from '$lib/stores/toastStore';
	import Modal from '$lib/components/Modal.svelte';
	import ImageContainer from './ImageContainer.svelte';
	import Autocomplete from '$lib/components/Autocomplete.svelte';
	import CloseImg from '$lib/assets/icons/close.svg';
	import { searchFolders, searchTags } from '$lib/client-helpers';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { form, data }: Props = $props();
	let images = $state(data.images);
	let modalIsOpen = $state(false);
</script>

<section>
	{#each images as image}
		<ImageContainer
			{image}
			{form}
			onremove={async () => {
				images = images.filter((i) => i.name != image.name);
			}}
		/>
	{/each}
</section>
<button onclick={() => (modalIsOpen = true)} class="button">Add</button>

{#if modalIsOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
	<Modal>
		<div class="form-container">
			<div class="flex-wr">
				<h2>Create new image</h2>
				<!-- svelte-ignore a11y_autofocus -->
				<button
					class="close"
					autofocus
					onclick={() => {
						modalIsOpen = false;
					}}
				>
					<img src={CloseImg} alt="" />
				</button>
			</div>

			<form
				method="POST"
				enctype="multipart/form-data"
				action="?/create"
				use:enhance={({ formElement, formData, action, cancel, submitter }) => {
					(submitter as HTMLButtonElement).disabled = true;
					return async ({ result, update }) => {
						(submitter as HTMLButtonElement).disabled = false;
						if (result.type === 'success') {
							images = [...images, result.data as Asset];
							addToast({
								type: 'success',
								message: 'Successfully updated!',
								timeout: 3000
							});
							formElement.reset();
							modalIsOpen = false;
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
				{#if form?.message}<p class="error">{form?.message}</p>{/if}
				<label>
					File
					<input name="file" type="file" required={true} />
				</label>
				<label>
					Name
					<input name="name" type="text" required />
				</label>
				<label>
					Author
					<input name="author" type="text" value="Berlkot" />
				</label>
				<label>
					Title
					<input name="title" type="text" />
				</label>
				<label>
					Alt
					<input name="alt" type="text" />
				</label>
				<label>
					Type
					<select name="type">
						<option value="0" selected>picture</option>
						<option value="1">video</option>
					</select>
				</label>
				<label>
					Content warning
					<input name="contentWarning" type="text" />
				</label>
				<label>
					Copyright
					<input name="copyright" type="text" />
				</label>
				<label>
					Small Description
					<textarea name="smallDescription"></textarea>
				</label>
				<label>
					Large Description
					<textarea name="largeDescription" rows="10"></textarea>
				</label>
				<label>
					Creation Date
					<input name="creationDate" type="date" />
				</label>
				<label>
					Gallery image
					<select name="inGallery">
						<option value="true">true</option>
						<option value="false" selected>false</option>
					</select>
				</label>
				<label>
					Visibility
					<select name="visibility">
						<option value="-1" selected>admin</option>
						<option value="0">public</option>
						<option value="1">for subs</option>
					</select>
				</label>
				<label>
					Maturity
					<select name="maturity">
						<option value="0" selected>sfw</option>
						<option value="1">questionable</option>
						<option value="2">nsfw</option>
					</select>
				</label>
				<label>
					Tags
					<div class="tags">
						<Autocomplete
							name="tags"
							optFunction={searchTags}
							key="name"
							defaultSelected={[]}
							multipule={true}
							delay={200}
							allowNew={true}
						/>
					</div>
				</label>
				<label>
					Folders
					<div class="tags">
						<Autocomplete
							name="folders"
							optFunction={searchFolders}
							key="name"
							defaultSelected={[]}
							multipule={true}
							delay={200}
							allowNew={true}
						/>
					</div>
				</label>
				<button class="submit" type="submit">Add</button>
			</form>
		</div>
	</Modal>
{/if}

<style>
	.tags {
		display: flex;
		width: 50%;
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
