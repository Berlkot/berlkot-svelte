<script>
	let { onclose = () => {}, children } = $props();
	let modal = $state();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="modal"
	role="dialog"
	bind:this={modal}
	onclick={(e) => {
		if (e.target === modal) onclose();
	}}
>
	<div class="wrapper">
		{@render children?.()}
	</div>
</div>

<style>
	.modal {
		display: block;
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		min-height: 100dvh;
		max-height: 100dvh;
		background-color: var(--color-shadow);
		overflow: scroll;
		z-index: 2;
	}
</style>
