<script lang="ts">
	import type { Snippet } from 'svelte';
	import Toasts from '$lib/toasts.svelte';
	import AvatarImg from '$lib/assets/avatar.png';
	import NavLink from '$lib/NavLink.svelte';
	import Instagram from '$lib/assets/icons/instagram.svg';
	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<Toasts />
<div class="wrapper">
	<header>
		<label for="menu" class="burger">
			<svg
				height="32px"
				id="Layer_1"
				style="enable-background:new 0 0 32 32;"
				version="1.1"
				viewBox="0 0 32 32"
				width="32px"
				xml:space="preserve"
				xmlns="http://www.w3.org/2000/svg"
				xmlns:xlink="http://www.w3.org/1999/xlink"
				><path
					d="M4,10h24c1.104,0,2-0.896,2-2s-0.896-2-2-2H4C2.896,6,2,6.896,2,8S2.896,10,4,10z M28,14H4c-1.104,0-2,0.896-2,2  s0.896,2,2,2h24c1.104,0,2-0.896,2-2S29.104,14,28,14z M28,22H4c-1.104,0-2,0.896-2,2s0.896,2,2,2h24c1.104,0,2-0.896,2-2  S29.104,22,28,22z"
				/></svg
			>
		</label>
		<input type="checkbox" id="menu" />
		<nav>
			<div class="left">
				<NavLink href="/blog">Blog</NavLink>
				<NavLink href="/about">About</NavLink>
			</div>
			<div class="home">
				<a href="/">
					<img class="avatar" src={AvatarImg} alt="" />
				</a>
			</div>
			<div class="right">
				<NavLink href="/gallery">Gallery</NavLink>
				<NavLink href="" class="disabled">Projects</NavLink>
			</div>
		</nav>
	</header>
	<main>
		{@render children?.()}
	</main>
</div>
<footer>
	<div class="wrapper">
		<div class="social">
			<p><b>Contact</b><br>I can be found on those social media platforms</p>
			<ul>
				<li>
					<a href="https://www.instagram.com/berlkot/" target="_blank">
						<img src={Instagram} alt="instagram" />
					</a>
				</li>
			</ul>
			<p>
				You can also contact me <a class="link" href="mailto:contact@berlkot.com">via "E"mail</a>
			</p>
		</div>
		<p>
			<b>License</b><br />Each artwork has its own license (read specific description).
			<br />
			Reuse of website assets for commercial purposes is strictly prohibited.
		</p>

		<div class="real-footer">
			<p>
				&copy; Berlkot 2024-2025 &bull; Site sourse code can be found <a
					class="link link-decor"
					href="https://github.com/Berlkot/berlkot-svelte"
					target="_blank">here</a
				>
			</p>
		</div>
	</div>
</footer>

<style>
	.burger {
		display: flex;
		position: fixed;
		top: 2px;
		right: 8px;
		z-index: 1;
	}
	.burger svg path {
		fill: var(--color-accent);
	}
	main {
		margin: 1rem 1rem 8rem 1rem;
	}

	footer {
		width: 100%;
		margin-top: auto;
	}
	footer .wrapper {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.avatar {
		width: 60px;
		height: 60px;
		border-radius: 50%;
	}
	footer ul {
		margin: 0;
		padding: 0;
		margin-top: 0.1rem;
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		justify-content: center;
	}
	footer ul li {
		width: 2rem;
	}
	footer ul li:hover {
		filter: var(--chromatic-aberration);
	}
	footer p {
		margin: 0;
		font-weight: 100;
		text-align: center;
		font: 1.3rem/1.3em var(--ff-paragraph);
		color: #ffd2c0ad;
	}
	footer b {
		color: var(--color-text);
	}
	footer .link {
		color: #ff5e86d2;
	}
	footer {
		padding-top: 10rem;
		padding-bottom: 4rem;
		background: linear-gradient(#00000000, #180b20 40%);
	}
	#menu {
		display: none;
	}
	@media (max-width: 730px) {
		main {
			margin: 1rem 2rem 8rem 2rem;
		}
		header {
			height: 53px;
			position: sticky;
			top: 0;
			left: 0;
			z-index: 2;
		}
		header :not(input[type='checkbox']:checked) + nav .left {
			display: none;
		}
		header :not(input[type='checkbox']:checked) + nav .right {
			display: none;
		}
		header nav {
			width: 100vw;
			position: fixed;
			padding-top: 53px;
			background-color: var(--bg-color);
			text-align: center;
		}
		.left {
			display: flex;
			flex-direction: column;
		}
		.right {
			display: flex;
			flex-direction: column;
		}
		.home {
			display: flex;
			width: 100%;
			border-bottom: var(--color-accent) 1px solid;
			position: absolute;
			top: 0;
			left: 0;
			padding: 7px 0 4px 1rem;
		}
		.home img {
			width: 40px;
			height: 40px;
		}
	}
	@media (min-width: 731px) {
		.burger {
			display: none;
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
			content: url('/assets/images/decoration.svg');
			position: absolute;
			top: 0;
			left: -23px;
			filter: var(--chromatic-aberration);
			display: block;
			width: 2.7rem;
			height: 100%;
		}
		.right::after {
			content: url('/assets/images/decoration.svg');
			position: absolute;
			top: 0;
			right: -23px;
			filter: var(--chromatic-aberration);
			height: 100%;
			width: 2.7rem;
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
		header nav {
			display: grid;
			grid-template-columns: 1fr 0.5fr 1fr;
			align-items: flex-start;
			justify-items: center;
		}
	}
</style>
