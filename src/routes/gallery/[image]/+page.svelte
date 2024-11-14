<script lang="ts">
    export let data;
    let options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric"
    };
</script>

<svelte:head>
	<title>{data.title}</title>
</svelte:head>
<p>{new Intl.DateTimeFormat(undefined, options).format(data.creationDate)}</p>
<img src='/image/{data.name}.webp' alt={data.alt} width={data.width} height={data.height} />
<!--We trust ourself or hacked-->
<!--eslint-disable-next-line svelte/no-at-html-tags-->
<div>{@html data.largeDescription}</div>
<p>By {data.author}</p>
{#each data.tags as tag}
    <p>{tag.name}</p>
{/each}

<style>
	img {
		width: 1000px;
		height: auto;
		object-fit: contain;
	}
</style>