<script lang="ts">
	import { onMount } from "svelte";

    let { children } = $props();
    let viewport = $state();
    let activated = $state(false);
    function toggleZoom() {
        activated = !activated;
        if (!activated) {
            zoom = 1;
            translateX = 0;
            translateY = 0;
        }
    }
    let zoom = $state(1);
    let centerx: number;
    let centery: number;
    let translateX = $state(0);
    let translateY = $state(0);
    let image
    onMount(() => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        centerx = windowWidth / 2;
        centery = windowHeight / 2;
    })
    function wheel(e) {
        e.preventDefault();
        if (e.wheelDeltaY > 0 ) {
            zoom = Math.min(3, zoom + 0.2);
        } else {
            zoom = Math.max(0.1, zoom - 0.2);
        }
    }
    function onmousemove(e) {
        translateX = Math.min(image.offsetWidth / 2, Math.abs((centerx - e.pageX) * zoom)) * Math.sign((centerx - e.pageX) * zoom);
        translateY = Math.min(image.offsetHeight / 2, Math.abs((centery - e.pageY) * zoom)) * Math.sign((centery - e.pageY) * zoom);
    }
</script>
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
 <div  onclick={()=> toggleZoom()} bind:this={image}>
    {@render children?.()}
 </div>

{#if activated}
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="preview"  onclick={()=> toggleZoom()}>
    <div bind:this={viewport} class="zoomable" onwheel={(e) => wheel(e)} onmousemove={(e) => onmousemove(e)} style:transform={`scale(${zoom}) translate(${translateX}px, ${translateY}px)`}>
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