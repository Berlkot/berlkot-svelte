<script lang="ts">
	import Edit from './Edit.svelte';
	import Preview from './Preview.svelte';

	let inPreview = $state(false);
	let { post } = $props();
</script>

<h1>Post managment</h1>
<div>
	<button>Code</button>
	<button>Preview</button>
</div>

{#if inPreview}
	<Preview />
{:else}
	<Edit />
{/if}
