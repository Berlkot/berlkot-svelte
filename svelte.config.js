// Currently svelte-adapter-bun is completely borked both in repo and npm
// And more over ade87929c3f4f4a2ba8f89c2cd4a3907e7637289 commit also has issues with compiling sveltekit code
// Node adapter proved to work fine, but whoever knows when it will fall short
// Should consider evaluating forking svelte-adapter-bun when it eventially does
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
		alias: {
			'$routes/*': 'src/routes/*',
			'$prisma-generated': 'generated/prisma'
		}
	}
};

export default config;
