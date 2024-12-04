<script lang="ts">
    let { post } = $props();
</script>

<form action="/admin/posts?/edit" method="POST">
    <input type="hidden" name="id" value={post.id} hidden>
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
		Content
		<textarea name="content" rows="30" bind:value={post.content}></textarea>
	</label>
	<label>
		Creation Date
		<input name="createdAt" type="date" bind:value={post.createdAt}/>
	</label>
	<label>
		Visibility
		<select name="visibility" bind:value={post.visibility}>
			<option value="-1" selected={post.visibility == -1}>admin</option>
			<option value="0" selected={post.visibility == 0}>public</option>
			<option value="1" selected={post.visibility == 1}>for subs</option>
		</select>
	</label>
<button>Save</button>
</form>