<script lang="ts">

	export let data;
</script>

<h1>Gallery</h1>
<section>
{#each data.images as image}
    <a href='/gallery/{image.name}'>
        {#if image.maturity > 0}
            <div class="readcted">redacted</div>
        {:else}
            <img src='/image/{image.basename}?w=270&h=270' alt={image.alt} width=270 height=270 />
        {/if}
        
	</a>
{/each}
</section>

<style>
    .readcted {
        width: 270px;
        height: 270px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: grey;
    }
    section {
        display: flex;
    }
</style>