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
		min-height: 100vh;
		max-height: 100vh;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 3;
		overflow: scroll;
	}
</style>
