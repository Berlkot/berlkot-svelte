<script lang="ts">
	import Autocomplete from '$lib/components/Autocomplete.svelte';

	let { post = $bindable(), images } = $props();

	async function searchTags(keyword: string) {
		const url = '/api/autocomplete/post';
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ text: keyword })
		});
		const data = await response.json();
		return data;
	}
	async function searchImages(keyword: string) {
		return images.filter((i) => i.name.includes(keyword));
	}
	let formattedDate = $state(post.createdAt.toISOString().substring(0, 10));
	$effect(() => {
		post.createdAt = new Date(formattedDate);
	});
	let focused = $state(false);
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

<form action="/admin/posts?/edit" method="POST">
	<input type="hidden" name="id" value={post.id} hidden />
	<div class="input-container">
		<label for="heroImage">Thumbnail</label>
		<div class="tags">
			<Autocomplete
				name="heroImage"
				optFunction={searchImages}
				{optionItem}
				{selectedItem}
				key="name"
				defaultSelected={post.heroImage ? [post.heroImage] : []}
				multipule={false}
				delay={200}
				allowNew={false}
				onChange={(value) => {
					post.heroImage = images.find((i) => i.name === value);
				}}
				onFocusChange={(val) => {
					focused = val;
				}}
			/>
		</div>
	</div>
	<div class="input-container">
		<label for="name">Name</label>
		<input id="name" name="name" type="text" required bind:value={post.name} />
	</div>
	<div class="input-container">
		<label for="author">Author</label>
		<input id="author" name="author" type="text" bind:value={post.author} />
	</div>
	<div class="input-container">
		<label for="title">Title</label>
		<input id="title" name="title" type="text" bind:value={post.title} />
	</div>
	<div class="input-container">
		<label for="description">Description</label>
		<textarea id="description" name="description" bind:value={post.description}></textarea>
	</div>
	<div class="input-container">
		<label for="tags">Tags</label>
		<div class="tags">
			<Autocomplete
				name="tags"
				optFunction={searchTags}
				key="name"
				defaultSelected={post.tags}
				multipule={true}
				delay={200}
				allowNew={true}
			/>
		</div>
	</div>
	<div class="input-container">
		<label for="content">Content</label>
		<textarea id="content" name="content" rows="30" bind:value={post.content}></textarea>
	</div>
	<div class="input-container">
		<label for="createdAt">Creation Date</label>
		<input id="createdAt" name="createdAt" type="date" bind:value={formattedDate} />
	</div>

	<div class="input-container">
		<label for="visibility">Visibility</label>
		<select id="visibility" name="visibility">
			<option value="ADMIN" selected={post.visibility == 'ADMIN'}>admin</option>
			<option value="PUBLIC" selected={post.visibility == 'PUBLIC'}>public</option>
			<option value="SUB_ONLY" selected={post.visibility == 'SUB_ONLY'}>for subs</option>
		</select>
	</div>
	<button>Save</button>
</form>

<style>
	.tags {
		width: 50%;
	}
	.image-select-item {
		display: flex;
		align-items: center;
		margin: 5px;
		margin-right: -20%;
		gap: 1rem;
		transition: filter 0.3s ease-in-out;
		z-index: -1;
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
