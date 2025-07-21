<script lang="ts">
	import { tick } from 'svelte';
	import { trapFocus } from 'trap-focus-svelte';

	let { children } = $props();

	let viewport: HTMLDivElement | undefined = $state();
	let activated = $state(false);
	let rect: DOMRect | undefined = $state();

	let zoom = $state(1.0);
	let translateX = $state(0);
	let translateY = $state(0);

	let activePointers = new Map<number, PointerEvent>();
	let lastTap = 0;
	let initialPinchDistance = 0;
	let initialZoom = 1;
	let dragStartX = 0;
	let dragStartY = 0;
	let initialTranslateX = 0;
	let initialTranslateY = 0;

	async function openPreview() {
		activated = true;
		await tick();
		rect = viewport!.getBoundingClientRect();
		zoom = 1.5;
	}

	function closePreview() {
		activated = false;
		zoom = 1.0;
		translateX = 0;
		translateY = 0;
		activePointers.clear();
	}

	function handleDoubleClick() {
		const now = performance.now();
		if (now - lastTap < 300) {
			closePreview();
		}
		lastTap = now;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			closePreview();
			e.stopPropagation();
		}
	}

	function onPointerDown(e: PointerEvent) {
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		e.preventDefault();
		activePointers.set(e.pointerId, e);

		if (activePointers.size === 1) {
			dragStartX = e.clientX;
			dragStartY = e.clientY;
			initialTranslateX = translateX;
			initialTranslateY = translateY;
		} else if (activePointers.size === 2) {
			const pointers = Array.from(activePointers.values());
			initialPinchDistance = getDistance(pointers[0], pointers[1]);
			initialZoom = zoom;
		}
	}

	function onPointerMove(e: PointerEvent) {
		if (!activePointers.has(e.pointerId)) return;
		e.preventDefault();
		activePointers.set(e.pointerId, e);

		if (activePointers.size === 1) {
			const dx = e.clientX - dragStartX;
			const dy = e.clientY - dragStartY;

			const newTranslateX = initialTranslateX + dx;
			const newTranslateY = initialTranslateY + dy;

			if (rect) {
				const maxPanX = (rect.width * (zoom - 1)) / 2;
				const maxPanY = (rect.height * (zoom - 1)) / 2;
				translateX = Math.max(-maxPanX, Math.min(maxPanX, newTranslateX));
				translateY = Math.max(-maxPanY, Math.min(maxPanY, newTranslateY));
			}
		} else if (activePointers.size === 2) {
			const pointers = Array.from(activePointers.values());
			const currentDistance = getDistance(pointers[0], pointers[1]);
			if (initialPinchDistance > 0) {
				const newZoom = initialZoom * (currentDistance / initialPinchDistance);
				zoom = Math.max(1.0, Math.min(3.0, newZoom));
			}
		}
	}

	function onPointerUp(e: PointerEvent) {
		(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
		activePointers.delete(e.pointerId);

		if (activePointers.size === 1) {
			const remainingPointer = activePointers.values().next().value;
			dragStartX = remainingPointer!.clientX;
			dragStartY = remainingPointer!.clientY;
			initialTranslateX = translateX;
			initialTranslateY = translateY;
		}
	}

	function onWheel(e: WheelEvent) {
		e.preventDefault();
		const oldZoom = zoom;
		const zoomFactor = 0.2;

		let newZoom;
		if (e.deltaY < 0) {
			newZoom = Math.min(3.0, zoom + zoomFactor);
		} else {
			newZoom = Math.max(1.0, zoom - zoomFactor);
		}

		if (oldZoom === newZoom) return;

		if (rect) {
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;

			const imageX = (mouseX - translateX) / oldZoom;
			const imageY = (mouseY - translateY) / oldZoom;

			translateX = mouseX - imageX * newZoom;
			translateY = mouseY - imageY * newZoom;
		}

		zoom = newZoom;
	}

	function getDistance(p1: PointerEvent, p2: PointerEvent): number {
		return Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY);
	}
</script>

<div
	onclick={openPreview}
	class="clickable-area"
	role="button"
	tabindex="0"
	onkeydown={(e) => {
		if (e.key === 'Enter') openPreview();
	}}
>
	{@render children?.()}
</div>

{#if activated}
	<div class="modal">
		<div
			class="preview"
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			use:trapFocus
			onkeydown={handleKeyDown}
			onclick={handleDoubleClick}
			onpointerdown={onPointerDown}
			onpointermove={onPointerMove}
			onpointerup={onPointerUp}
			onpointercancel={onPointerUp}
		>
			<div
				bind:this={viewport}
				class="zoomable"
				onwheel={onWheel}
				style:transform={`translate(${translateX}px, ${translateY}px) scale(${zoom})`}
				style:transform-origin="center center"
			>
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}

<style>
	.clickable-area {
		cursor: zoom-in;
		display: inline-block;
	}

	.preview {
		position: fixed;
		width: 100%;
		height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		touch-action: none;
	}

	.zoomable {
		display: flex;
		transition: transform 0.1s ease-out;
		will-change: transform;
	}
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
