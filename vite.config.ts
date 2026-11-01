// Currently svelte-adapter-bun is completely borked both in repo and npm
// And more over ade87929c3f4f4a2ba8f89c2cd4a3907e7637289 commit also has issues with compiling sveltekit code
// Node adapter proved to work fine, but whoever knows when it will fall short
// Should consider evaluating forking svelte-adapter-bun when it eventially does
import adapter from '@sveltejs/adapter-bun';

import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import devtoolsJson from 'vite-plugin-devtools-json';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [
		sveltekit({
			// Consult https://kit.svelte.dev/docs/integrations#preprocessors
			// for more information about preprocessors
			preprocess: vitePreprocess(),
			adapter: adapter(),

			alias: {
				'$routes/*': 'src/routes/*',
				'$prisma-generated': 'generated/prisma',
				'$modules/*': 'src/lib/modules/*'
			},
			paths: { relative: false /* sure, why this is a thing anyway */ }
		}),
		devtoolsJson()
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},

			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
