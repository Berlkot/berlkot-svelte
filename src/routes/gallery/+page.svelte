<script lang="ts">

	export let data;
</script>

<h1>Gallery</h1>

{#each data.images as image}
    <a href='/gallery/{image.name}'>
        {#if image.type === 1}
            animated
        {/if}
        <img src='/thumbnail/{image.basename}?w=270&h=270' alt={image.alt} width=270 height=270 />
	</a>
{/each}
