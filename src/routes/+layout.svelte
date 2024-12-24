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
			<div class="left">
				<NavLink href="/blog">Blog</NavLink>
				<NavLink href="/about">About</NavLink>
			</div>
			<a href="/">
				<img class="avatar" src={AvatarImg} alt="" />
			</a>
			<div class="right">
				<NavLink href="/gallery">Gallery</NavLink>
				<NavLink href="/projects">Projects</NavLink>
			</div>
		</nav>
	</header>
	<main>
		{@render children?.()}
	</main>
</div>
<footer>
	<div class="wrapper">
		<p>Website was built using Svelte and powered by Bun with Nginx</p>
		<p>
			Sourse code can be found <a class="link" href="https://github.com/Berlkot/berlkot-svelte">here</a>
		</p>
	</div>
</footer>

<style>
	main {
		margin: 2.6rem 0 20rem 0;
	}

	footer {
		width: 100%;
		margin-top: auto;
	}
	.left,
	.right {
		position: relative;
		display: grid;
		grid-template-columns: 1fr 1fr;
		align-items: flex-start;
		justify-items: center;
		width: 100%;
	}
	.left {
		margin-left: 45px;
	}
	.right {
		margin-right: 45px;
	}
	.left::after {
		content: url("/assets/images/test.svg");
		position: absolute;
		top: 0;
		left: -23px;
		filter: var(--chromatic-aberration);
		height: 100%;
		width: 40px;
	}
	.right::after {
		content: url("/assets/images/test.svg");
		position: absolute;
		top: 0;
		right: -23px;
		filter: var(--chromatic-aberration);
		height: 100%;
		width: 40px;
		transform: scaleX(-1);
	}
	.left::before,
	.right::before {
		pointer-events: none;
		content: '';
		position: absolute;
		height: 100%;
		width: 100%;
		top: 0;
		left: 0;
		border-bottom: 2px solid var(--color-accent);
		filter: var(--chromatic-aberration);
	}
	nav {
		display: grid;
		grid-template-columns: 1fr 0.5fr 1fr;
		align-items: flex-start;
		justify-items: center;
	}
	.avatar {
		width: 60px;
		height: 60px;
		border-radius: 50%;
	}
	footer p {
		font-weight: 100;
		text-align: center;
		font: var(--subcript);
		color: #ffd2c0ad;
	}
	footer .link {
		color: #ff5e86d2;
	}
	footer {
		padding-top: 10rem;
		padding-bottom: 4rem;
		background: linear-gradient(#00000000, #180b20 70%);
	}
</style>
