import { renderMarkdown } from '$lib/server/services/markdown/render';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const { content } = await request.json();
	return json({ content: await renderMarkdown(content) });
}
