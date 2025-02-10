<script lang="ts">
	import Autocomplete from '$lib/Autocomplete.svelte';

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
</script>

<form action="/admin/posts?/edit" method="POST">
	<input type="hidden" name="id" value={post.id} hidden />
	<label>
		Thumbnail
		<div class="tags">
			<Autocomplete
				name="thumbnail"
				optFunction={searchImages}
				key="name"
				defaultSelected={post.thumbnail ? [post.thumbnail] : []}
				multipule={false}
				delay={200}
				allowNew={false}
			/>
		</div>
	</label>
	<label>
		Name
		<input name="name" type="text" required bind:value={post.name} />
	</label>
	<label>
		Author
		<input name="author" type="text" bind:value={post.author} />
	</label>
	<label>
		Title
		<input name="title" type="text" bind:value={post.title} />
	</label>
	<label>
		Description
		<textarea name="description" bind:value={post.description}></textarea>
	</label>
	<label>
		Tags
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
	</label>
	<label>
		Content
		<textarea name="content" rows="30" bind:value={post.content}></textarea>
	</label>
	<label>
		Creation Date
		<input name="createdAt" type="date" bind:value={formattedDate} />
	</label>
	<label>
		Visibility
		<select name="visibility">
			<option value="-1" selected={post.visibility == -1}>admin</option>
			<option value="0" selected={post.visibility == 0}>public</option>
			<option value="1" selected={post.visibility == 1}>for subs</option>
		</select>
	</label>
	<button>Save</button>
</form>

<style>
	.tags {
		width: 50%;
	}
</style>
