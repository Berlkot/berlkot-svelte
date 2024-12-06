<script lang="ts">
	import { onMount, tick } from 'svelte';

	let { children } = $props();
	let viewport: HTMLDivElement | undefined = $state();
	let activated = $state(false);
	async function toggleZoom(e: MouseEvent & { currentTarget: EventTarget & HTMLDivElement; }) {
		activated = !activated;
		if (!activated) {
			zoom = 1.5;
			translateX = 0;
			translateY = 0;
		} else {
			await tick();
			let offsetx = centerx - e.pageX;
			let offsety = centery - e.pageY;
            translateX =
                (Math.min(
                    (viewport!.clientWidth / 2) * zoom - Math.abs(offsetx),
                    Math.abs(offsetx * zoom)
                ) * Math.sign(offsetx)) / zoom;
            translateY =
                (Math.min(
                    (viewport!.clientHeight / 2) * zoom - Math.abs(offsety),
                    Math.abs(offsety * zoom)
                ) * Math.sign(offsety)) / zoom;
		}
	}
	let zoom = $state(1.5);
	let centerx: number;
	let centery: number;
	let translateX = $state(0);
	let translateY = $state(0);
	let image;
	onMount(() => {
		const windowWidth = window.innerWidth;
		const windowHeight = window.innerHeight;
		centerx = windowWidth / 2;
		centery = windowHeight / 2;
	});
	function wheel(e: WheelEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		e.preventDefault();
		if (e.deltaY < 0) {
			zoom = Math.min(4, zoom + 0.2);
		} else {
			zoom = Math.max(0.8, zoom - 0.2);
		}
	}
	function onmousemove(e: MouseEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		let offsetx = centerx - e.pageX;
		let offsety = centery - e.pageY;
        translateX =
			(Math.min(
				(viewport!.clientWidth / 2) * zoom - Math.abs(offsetx),
				Math.abs(offsetx * zoom)
			) * Math.sign(offsetx)) / zoom;
		translateY =
			(Math.min(
				(viewport!.clientHeight / 2) * zoom - Math.abs(offsety),
				Math.abs(offsety * zoom)
			) * Math.sign(offsety)) / zoom;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div onclick={async (e) => toggleZoom(e)} bind:this={image}>
	{@render children?.()}
</div>

{#if activated}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="preview" onclick={async (e) => toggleZoom(e)}>
		<div
			bind:this={viewport}
			class="zoomable"
			onwheel={(e) => wheel(e)}
			onmousemove={(e) => onmousemove(e)}
			style:transform={`scale(${zoom}) translate(${translateX}px, ${translateY}px)`}
		>
			{@render children?.()}
		</div>
	</div>
{/if}

<style>
	div {
		cursor: zoom-in;
	}
	div img {
		opacity: 0;
	}
	.preview {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		min-height: 100vh;
		max-height: 100vh;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		overflow: hidden;
		align-items: center;
		justify-content: center;
	}
</style>
