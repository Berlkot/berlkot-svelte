<script lang="ts">
	import { onMount } from 'svelte';
	let canvas = $state<HTMLCanvasElement>();
	interface Props {
		animationend?: Function;
		framedata: object;
		atlas: string;
	}
	let { animationend, framedata, atlas }: Props = $props();
    let currentAnimation = null;
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = document.documentElement.scrollHeight;
    }
	onMount(async () => {
        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();
		let img = new Image();
		img.src = atlas;
		await img.decode();
		canvas!.offscreenCanvas = document.createElement('canvas');
		canvas!.offscreenCanvas.width = img.width;
		canvas!.offscreenCanvas.height = img.height;
		canvas!.offscreenCanvas.getContext('2d').drawImage(img, 0, 0);
        document.addEventListener('click', function() {
            onclick();
        });
        window.onmousemove = function() {
            onmousemove();
        }

	});
    function onclick() {
        return
    }
    function onmousemove() {
        return
    }
	export async function play_animation(animation: string) {
        if (currentAnimation) {
            currentAnimation.cancel();
        }
		if (!framedata.animations[animation]) {
			throw new Error('Animation does not exist on spritesheet');
		}
        return new Promise<void>((resolve) => {
            let interval = 1000 / framedata.animations[animation].frame_rate;
            let frames = framedata.animations[animation].length;
            let zero = 0;
            let currentPos = 0;
            let currentDepth = 1;
            let renderedFrames = 0;
            let isCanceled = false;
            function draw(timestamp: EpochTimeStamp) {
                if (isCanceled) return;
                if (zero == 0) {
                    zero = timestamp;
                }
                let currentFrame = Math.floor((timestamp - zero) / interval);
                if (currentFrame >= frames) {
                    if (animationend) animationend();
                    const { x, y, w, h } =
                    framedata.animations[animation].frames[currentPos].clear_rect;
                    canvas!.getContext('2d')!.clearRect(x + Math.round(window.innerWidth / 2), y, w, h);
                    return resolve();
                }
                while (renderedFrames < currentFrame) {
                    if (framedata.animations[animation].frames[currentPos].duration == currentDepth) {
                        if (renderedFrames != 0) {
                            currentDepth = 1;
                            currentPos += 1;
                        }
                        if (framedata.animations[animation].frames[currentPos].clear_rect) {
                            const { x, y, w, h } =
                                framedata.animations[animation].frames[currentPos].clear_rect;
                            canvas.getContext('2d').clearRect(x + Math.round(window.innerWidth / 2), y, w, h);
                        }
                        canvas.getContext('2d')
                            .drawImage(
                                canvas.offscreenCanvas,
                                framedata.animations[animation].frames[currentPos].location.x,
                                framedata.animations[animation].frames[currentPos].location.y,
                                framedata.animations[animation].frames[currentPos].location.w,
                                framedata.animations[animation].frames[currentPos].location.h,
                                framedata.animations[animation].frames[currentPos].position.x + Math.round(window.innerWidth / 2),
                                framedata.animations[animation].frames[currentPos].position.y,
                                framedata.animations[animation].frames[currentPos].location.w,
                                framedata.animations[animation].frames[currentPos].location.h
                            );
                    } else {
                        currentDepth += 1;
                    }
                    renderedFrames += 1;
                }
                window.requestAnimationFrame(draw);
            }
            currentAnimation = { cancel: () => (isCanceled = true) };
            window.requestAnimationFrame(draw);
        });
	}
</script>

<canvas bind:this={canvas}> </canvas>

<style>
	canvas {
		position: absolute;
        pointer-events: none;
	}
</style>
