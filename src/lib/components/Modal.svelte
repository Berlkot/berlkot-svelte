<script>
    import { trapFocus } from 'trap-focus-svelte'
	let { onclose = () => {}, children } = $props();
	let modal = $state();
</script>


<div
	class="modal"
	role="dialog"
	aria-modal="true"
	bind:this={modal}
	tabindex=-1
	use:trapFocus
	onclick={(e) => {
		if (e.target === modal) onclose();
	}}
	onkeydown={(e) => {
		if (e.key === 'Escape') onclose();
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
