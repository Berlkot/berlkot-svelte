<script lang="ts">
	// FIXME
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	import type { GalleryPost } from '@prisma/client';
	import { addToast } from '$lib/stores/toastStore';
	import Modal from '$lib/components/Modal.svelte';
	import Autocomplete from '$lib/components/Autocomplete.svelte';
	import CloseImg from '$lib/assets/icons/close.svg';
	import { searchFolders, searchTags } from '$lib/client-helpers';
	import GalleryCard from '$lib/components/GalleryCard.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import { page } from '$app/state';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { form, data }: Props = $props();
	let images = data.assets;
	let galleryPosts: GalleryPost[] = $state(data.galleryPosts);
	let modalIsOpen = $state(false);
	let currentPost: GalleryPost | null = $state(null);
	let editing = $state(false)
	let showConfirm = $state(false)
	
	function getRandomInt(max: number) {
		return Math.floor(Math.random() * max);
	}
	
	async function searchImages(keyword: string) {
		return images.filter((i) => i.name.includes(keyword));
	}
</script>

{#snippet optionItem(image)}
	<div>
		<img src="/asset/{image.name}.webp?w=270&h=270" alt="" width="50" height="50" />
		<p>{image.name}</p>
	</div>
{/snippet}

{#if showConfirm}
	<ConfirmDialog
		onconfirm={() => {
			showConfirm = false;
			let data = new FormData();
			data.append('name', currentPost!.name);
			fetch('?/delete', {
				method: 'POST',
				body: data
			})
				.then(() => {
					galleryPosts.splice(galleryPosts.indexOf(currentPost!), 1);
					currentPost = null;
					addToast({
						type: 'success',
						message: 'Successfully deleted!',
						timeout: 3000
					});
				})
				.catch(() => {
					currentPost = null;
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

<section>
    <ul class="gallery">
    	{#each galleryPosts as galleryPost (galleryPost.id)}
         <li data-image={galleryPost.id}>
    		<GalleryCard
    			{galleryPost}
    		/>
   			<div class="wrapper">
				<button
					onclick={() => {
						currentPost = galleryPost;
						modalIsOpen = true;
						editing = true;
					}}
					class="button">Edit</button
				>
				<button
					class="button button-danger"
					onclick={() => {
						currentPost = galleryPost;
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
			    <h2>{editing ? 'Edit post' : 'Create new post'}</h2>
				<button
					class="close"
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
				action={editing ? '?/edit' : '?/create'}
				use:enhance={({ formElement, formData, action, cancel, submitter }) => {
					(submitter as HTMLButtonElement).disabled = true;
					return async ({ result, update }) => {
						(submitter as HTMLButtonElement).disabled = false;
						if (result.type === 'success') {
							if (editing) {
								galleryPosts[galleryPosts.findIndex((post) => post.id === (result.data as GalleryPost).id)] =
									result.data as GalleryPost;
							} else {
								galleryPosts = [...galleryPosts, result.data as GalleryPost];
							}
							const imageel = document.querySelector(
								`[data-image="${result.data!.id}"] a`
							) as HTMLAnchorElement;
							imageel.href += `?${getRandomInt(1000)}` 
							addToast({
								type: 'success',
								message: 'Successfully updated!',
								timeout: 3000
							});
							modalIsOpen = false;
							editing = false;
							currentPost = null;
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
    				<input name="id" type="hidden" value={currentPost!.id} hidden />
    			{/if}
				{#if form?.message}<p class="error">{form?.message}</p>{/if}
				<div class="input-container">
    				<label for="assets">Images</label>
                    <div class="tags">
        				<Autocomplete
           					name="assets"
           					optFunction={searchImages}
           					{optionItem}
           					selectedItem={optionItem}
           					key="name"
           					defaultSelected={currentPost && currentPost.assets ? currentPost.assets.map((asset) => asset.asset) : []}
           					multipule={true}
           					delay={200}
           					allowNew={false}
                            required={true}
        				/>
                    </div>
				</div>
				<div class="input-container">
				    <label for="name">Name</label>
					<input id="name" name="name" type="text" required value={currentPost?.name}/>
				</div>
				<div class="input-container">
				    <label for="title">Title</label>
					<input id="title" name="title" type="text" value="{currentPost?.title}"/>
				</div>
				<div class="input-container">
				    <label for="contentWarning">Content warning</label>
					<input id="contentWarning" name="contentWarning" type="text" value={currentPost?.contentWarning} />
				</div>
				<div class="input-container">
				    <label for="copyright">Copyright</label>
					<input id="copyright" name="copyright" type="text" value={currentPost?.copyright} />
				</div>
				<div class="input-container">
				    <label for="smallDescription">Small Description</label>
					<textarea id="smallDescription" name="smallDescription" value={currentPost?.smallDescription}></textarea>
				</div>
				<div class="input-container">
				    <label for="largeDescription">Large Description</label>
					<textarea id="largeDescription" name="largeDescription" rows="10"  value={currentPost?.largeDescription}></textarea>
				</div>
				<div class="input-container">
				    <label for="creationDate">Creation Date</label>
					<input id="creationDate" name="creationDate" type="date"  value="{currentPost?.creationDate.toISOString().substring(0, 10)}"/>
				</div>
				<div class="input-container">
					<label for="visibility"> Visibility </label>
					<select id="visibility" name="visibility">
						<option value="ADMIN" selected={currentPost?.visibility === 'ADMIN' || !currentPost}>admin</option>
						<option value="PUBLIC" selected={currentPost?.visibility === 'PUBLIC'}>public</option>
						<option value="SUB_ONLY" selected={currentPost?.visibility === 'SUB_ONLY'}>for subs</option>
					</select>
				</div>
				<div class="input-container">
					<label for="maturity"> Maturity </label>
					<select id="maturity" name="maturity">
						<option value="SFW" selected={currentPost?.maturity === 'SFW' || !currentPost}>sfw</option>
						<option value="QUESTIONABLE" selected={currentPost?.maturity === 'QUESTIONABLE'}>questionable</option>
						<option value="NSFW" selected={currentPost?.maturity === 'NSFW'}>nsfw</option>
					</select>
				</div>
				<div class="input-container">
					<label for="tags">Tags</label>
					<div class="tags">
						<Autocomplete
							name="tags"
							optFunction={searchTags}
							key="name"
							defaultSelected={currentPost?.tags || []}
							multipule={true}
							delay={200}
							allowNew={true}
						/>
					</div>
				</div>
				<div class="input-container">
				<label for="folders">Folders</label>
					<div class="tags">
						<Autocomplete
							name="folders"
							optFunction={searchFolders}
							key="name"
							defaultSelected={currentPost?.folders || []}
							multipule={true}
							delay={200}
							allowNew={true}
						/>
					</div>
				</div>
				<button class="submit" type="submit">{currentPost ? 'Update' : 'Add'}</button>
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
</style>
