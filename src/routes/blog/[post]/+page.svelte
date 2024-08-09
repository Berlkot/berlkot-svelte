<script lang="ts">
	export let data;
</script>

<svelte:head>
	<title>{data.title}</title>
</svelte:head>
<h1>blogpost</h1>

<!--We trust ourself or hacked-->
<!--eslint-disable-next-line svelte/no-at-html-tags-->
<article>{@html data.content}</article>
