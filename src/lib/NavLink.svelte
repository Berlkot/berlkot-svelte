<script>
	import { page } from "$app/stores";

    let { href, children, ...other } = $props();
  </script>
  
<a {href} {...other} class:active={$page.url.pathname === href} aria-current={$page.url.pathname === href}>
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
		font: var(--h4);
		padding: 10px;
		line-height: 1em;
        color: var(--color-accent);
        transition: color 0.2s ease-in-out, filter 0.2s ease-in-out;
	}
    a:hover {
        color: var(--color-accent-hover);
        filter: var(--chromatic-aberration);
    }

</style>