<script lang="ts">
	import type { PageData } from './$types';
	import Edit from './Edit.svelte';
	import Preview from './Preview.svelte';
	interface Props {
		data: PageData;
	}
	let inPreview = $state(false);
	let { data }: Props = $props();
</script>

<h1>Post managment</h1>
<div>
	<button onclick={() => (inPreview = false)}>Code</button>
	<button onclick={() => (inPreview = true)}>Preview</button>
</div>

{#if inPreview}
	<Preview post={data.post}/>
{:else}
	<Edit post={data.post}/>
{/if}
