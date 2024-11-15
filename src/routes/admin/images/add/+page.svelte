<script lang="ts">
	import type { ActionData } from './$types';
	
	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();
</script>

<form method="POST" enctype="multipart/form-data">
    {#if form?.missing}<p class="error">File or name not found</p>{/if}
	{#if form?.invalid}<p class="error">Invalid form</p>{/if}
	<label>
		File
		<input name="file" type="file" required />
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
			<option value="0" selected>static</option>
			<option value="1">animated</option>
			<option value="2">video</option>
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
		<select name="inGallery" >
			<option value="true">true</option>
			<option value="false" selected>false</option>
		</select>
	</label>
	<label>
		Visibility
		<select name="visibility" >
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
	<button type="submit">Add</button>
</form>

<style>
    label {
      display: block;
    }
</style>