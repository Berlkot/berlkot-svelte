<script>
	import { fade } from 'svelte/transition';
	import CloseImg from '$lib/assets/icons/close.svg';

	let { type = 'error', dismissible = true, children, dismiss } = $props();
</script>

<div class="alert {type}" role="alert" transition:fade>
	{#if type === 'success'}
		✓
	{:else if type === 'error'}
		i
	{:else}
		i
	{/if}

	<div class="text">
		{@render children?.()}
	</div>

	{#if dismissible}
		<button class="close" onclick={() => dismiss()}>
			<img src={CloseImg} alt="" />
		</button>
	{/if}
</div>

<style>
	.alert {
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 0.2rem;
		display: flex;
		align-items: center;
		margin: 0 auto 0.5rem auto;
		width: 30rem;
		font: 1.6rem/1.5 var(--ff-paragraph);
		pointer-events: auto;
	}
	.error {
		background: IndianRed;
	}
	.success {
		background: MediumSeaGreen;
	}
	.info {
		background: SkyBlue;
	}
	.text {
		padding: 0 1rem;
	}
	button {
		color: white;
		background: transparent;
		border: 0 none;
		padding: 0;
		margin: 0 0 0 auto;
		line-height: 1;
		font-size: 1rem;
	}
</style>
