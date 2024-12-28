<script lang="ts">
	import { page } from '$app/state';
	const assets = import.meta.glob('$lib/assets/errors/*.webp', {eager: true, import: 'default' }); 
	const asset = assets[`/src/lib/assets/errors/${page.status}.webp`]
</script>

<h1 class:visually-hidden={asset}>{page.status}: {page.error?.message}</h1>
{#if asset}
<div class="u-center">
	<img src={asset} alt="{page.status}: {page.error?.message}">
</div>
{/if}
