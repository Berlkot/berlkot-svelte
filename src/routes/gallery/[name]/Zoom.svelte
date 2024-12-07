<script lang="ts">
	import { tick } from 'svelte';

	let { children } = $props();
	let viewport: HTMLDivElement | undefined = $state();
	let activated = $state(false);
	let rect: DOMRect | undefined = $state();
    async function toggleZoom(e: MouseEvent & { currentTarget: EventTarget & HTMLDivElement }) {
    activated = !activated;

    if (!activated) {
        zoom = 1.5;
        translateX = 0;
        translateY = 0;
    } else {
        await tick();
		rect = viewport!.getBoundingClientRect();
        centerx = rect.left + rect.width / 2;
        centery = rect.top + rect.height / 2;
		updateOffset(e);
    }
}



	let zoom = $state(1.5);
	let centerx: number = $state(0);
	let centery: number = $state(0);
	let testx = $state(0);
	let testy = $state(0);
	let translateX = $state(0);
	let translateY = $state(0);
	function wheel(e: WheelEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		e.preventDefault();
		if (e.deltaY < 0) {
			zoom = Math.min(2.8, zoom + 0.2);
		} else {
			zoom = Math.max(0.8, zoom - 0.2);
		}

	}
function onmousemove(e: MouseEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		rect = viewport!.getBoundingClientRect();	
		updateOffset(e)

}
function updateOffset(e: MouseEvent & { currentTarget: EventTarget & HTMLDivElement; }) {
	const signx = Math.sign(centerx - e.pageX);
        const signy = Math.sign(centery - e.pageY);
        let offsetx = Math.abs(centerx - e.pageX);
        let offsety = Math.abs(centery - e.pageY);
		const maxOffsetX = (rect!.width / 4)
		const maxOffsetY = (rect!.height / 4)

		if (offsetx >= maxOffsetX && offsetx - maxOffsetX >= offsety - maxOffsetY) {
			offsety = (offsety / offsetx) * maxOffsetX 
			offsetx = maxOffsetX; 
		} else if (offsety > maxOffsetY && offsety - maxOffsetY >= offsetx - maxOffsetX) {
			offsetx = (offsetx / offsety) * maxOffsetY;
			offsety = maxOffsetY; 
		}
		translateX = offsetx * signx;
		translateY = offsety * signy;
}




</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div onclick={async (e) => toggleZoom(e)}>
	{@render children?.()}
</div>
<div class="test" style:top={`${centery}px`} style:left={`${centerx}px`}></div>
<div class="test" style:top={`${testy}px`} style:left={`${testx}px`}></div>
<!-- <div class="test" style:top={rect?.top + "px"} style:left={rect?.left + "px"} style:width={rect?.width + "px"} style:height={rect?.height + "px"}></div> -->


{#if activated}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="preview" onclick={async (e) => toggleZoom(e)}>
		<div
			bind:this={viewport}
			class="zoomable"
			onwheel={(e) => wheel(e)}
			onmousemove={(e) => onmousemove(e)}
			style:transform={`translate(${translateX}px, ${translateY}px) scale(${zoom})`} style:transform-origin={`50% 50%`}>
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
	.zoomable {
		display: flex;
	}
</style>
