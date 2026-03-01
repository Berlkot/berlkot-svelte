<script lang="ts">
	import { page } from '$app/state';
	const assets = import.meta.glob('$lib/assets/errors/*.webp', { eager: true, import: 'default' });
	const asset = assets[`/src/lib/assets/errors/${page.status}.webp`];
</script>
<svelte:head>
    <title>{page.status} | {page.error?.message}</title>
    <meta name="og:title" content="{page.status} | {page.error?.message}" />
    <meta name="description" content="Server returned error {page.error?.message} with status code {page.status}" />
    <meta name="og:description" content="Server returned error {page.error?.message} with status code {page.status}" />
    <meta name="robots" content="noindex, nofollow" />
</svelte:head>
<h1 class:visually-hidden={asset}>{page.status}: {page.error?.message}</h1>
{#if asset}
	<div class="u-center">
		<img src={asset} alt="{page.status}: {page.error?.message}" />
	</div>
{/if}
