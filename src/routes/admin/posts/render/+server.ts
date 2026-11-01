import { renderMarkdown } from '#modules/markdown/render.server.js';

export async function POST({ request }) {
	const { content } = await request.json();
	return Response.json({ content: await renderMarkdown(content) });
}
