<script>
	import { page } from '$app/state';

	let { href, children, ...other } = $props();
</script>

<a
	{href}
	{...other}
	class:active={page.url.pathname === href}
	aria-current={page.url.pathname === href}
>
	{@render children?.()}
</a>

<style>
	.active {
		color: #ff295f;
		cursor: default;
		filter: var(--chromatic-aberration);
	}
	.active:hover {
		color: #ff295f;
	}
	a {
		font: bold 1.9rem/1.6em var(--ff-display);
		padding: 10px;
		line-height: 1em;
		color: var(--color-accent);
		transition:
			color 0.2s ease-in-out,
			filter 0.2s ease-in-out;
	}
	a:hover {
		color: var(--color-accent-hover);
		filter: var(--chromatic-aberration);
	}
</style>
