<script lang="ts">
	import type { ActionData, PageData } from './$types';

	interface Props {
		data: PageData;
		form: ActionData;
	}
	let { form, data }: Props = $props();
</script>

{#each data.posts as post}
	<a href="/blog/{post.name}">{post.title}</a>
{/each}

<form method="POST">
	{#if form?.message}<p class="error">{form?.message}</p>{/if}
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
		Description
		<textarea name="description"></textarea>
	</label>
	<label>
		Content
		<textarea name="content" rows="30"></textarea>
	</label>
	<label>
		Creation Date
		<input name="createdAt" type="date" />
	</label>
	<label>
		Visibility
		<select name="visibility">
			<option value="-1" selected>admin</option>
			<option value="0">public</option>
			<option value="1">for subs</option>
		</select>
	</label>
	<button type="submit">Add</button>
</form>

<style>
	label {
		display: block;
	}
</style>
