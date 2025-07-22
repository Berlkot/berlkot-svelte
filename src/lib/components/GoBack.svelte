<script lang="ts">
 	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
    interface Props {
      children?: Snippet;
      defaultUrl: string;
    }
    let { children, defaultUrl }: Props = $props();
    let linkback = page.url.searchParams.get('linkback');
</script>

<a class="link" href={linkback || defaultUrl}>
    {#if children}
        {@render children?.()}
    {:else}
        &lt; Back
    {/if}
</a>