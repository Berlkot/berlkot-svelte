<script lang="ts">
    let { data } = $props();
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric"
    };
</script>

<svelte:head>
	<title>{data.title}</title>
</svelte:head>
<p>{new Intl.DateTimeFormat(undefined, options).format(data.creationDate)}</p>
{#if data.type == 1} 

  <!-- svelte-ignore a11y_media_has_caption -->
  <video controls loop src="/asset/{data.name}.mp4"></video>
{:else}
  <img src="/asset/{data.name}.webp" alt={data.alt} width={data.width} height={data.height} />
{/if}
<!--We trust ourself or hacked-->
<!--eslint-disable-next-line svelte/no-at-html-tags-->
<div>{@html data.largeDescription}</div>
<p>By {data.author}</p>
<!-- eslint doesnt know that prisma has related queries-->
{#each (data as any).tags as tag}
    <p><b>{tag.name}</b></p>
{/each}

<style>
	img {
		width: 1000px;
		height: auto;
		object-fit: contain;
	}
  
</style>