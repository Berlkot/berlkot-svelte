<script>
	import { fade, scale } from 'svelte/transition';

	let {
		onconfirm = () => {},
		onreject = () => {},
		text = '',
		confirmText = 'Confirm',
		rejectText = 'Cancel'
	} = $props();

	let modal = $state();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="modal"
	role="dialog"
	bind:this={modal}
	onclick={(e) => {
		if (e.target === modal) onreject();
	}}
>
	<div class="wrapper" in:scale={{ start: 0.0, duration: 100 }} out:fade={{ duration: 100 }}>
		<p>{text}</p>
		<div class="flex-wr">
			<button class="button button-danger" onclick={() => onconfirm()}>{confirmText}</button>
			<button class="button" onclick={() => onreject()}>{rejectText}</button>
		</div>
	</div>
</div>

<style>
	.modal {
		position: fixed;
		display: flex;
		align-items: center;
		justify-content: center;
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh;
		background-color: var(--color-shadow);
		z-index: 2;
		overflow: scroll;
	}
	.flex-wr {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		gap: 30px;
	}
	.wrapper {
		max-width: 350px;
		padding: 15px;
		background-color: var(--bg-color);
		border-radius: 5px;
	}
	p {
		margin: 12px 0 28px 0;
	}
</style>
