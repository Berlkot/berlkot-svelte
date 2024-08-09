import { renderMarkdown } from '$lib/server/markdown';

export async function load({ params }) {
	return {
		text: await renderMarkdown(`data/about.md`)
	};
}
