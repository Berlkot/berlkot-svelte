import { renderMarkdown } from '$lib/server/markdown';
import prisma from '$lib/server/prisma';
import { error, type RequestEvent } from '@sveltejs/kit';

const return_string = 'Blogpost not found!';

export async function load({ params, locals }: RequestEvent) {
	let post;
	try {
		post = await prisma.post.findUniqueOrThrow({ where: { name: params.post } });
	} catch {
		throw error(404, return_string);
	}
	if (!(post.visibility === 0) && !locals.admin) {
		throw error(404, return_string);
	}
	post.content = post.content ? await renderMarkdown(post.content) : "Blogpost is empty";
	return post;
}
