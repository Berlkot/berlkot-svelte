<script lang="ts">
	import type { Snippet } from 'svelte';
	import Toasts from '$lib/toasts.svelte';
	import AvatarImg from '$lib/assets/avatar.png';
	import NavLink from '$lib/NavLink.svelte';
	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<Toasts />
<div class="wrapper">
	<header>
		<nav>
			
			<NavLink href="/blog">Blog</NavLink>
			<NavLink href="/about">About</NavLink>
			<a href="/">
				<img class="avatar" src={AvatarImg} alt="">
			</a>
			<NavLink href="/gallery">Gallery</NavLink>
			<NavLink href="/projects">Projects</NavLink>
		</nav>
	</header>
	<main>
		{@render children?.()}
	</main>
</div>
<footer>
	<div class="wrapper">
		<p>Website was built using Svelte and powered by Bun with Nginx
			Sourse code can be found <a href="https://github.com/Berlkot/berlkot-svelte">here</a></p>
	</div>
</footer>

<style>
	nav {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
		align-items: flex-start;
		justify-items: center;
	}
	.avatar {
		width: 60px;
		height: 60px;
		border-radius: 50%;
	}
</style>
