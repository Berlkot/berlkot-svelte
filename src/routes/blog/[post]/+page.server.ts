import { renderMarkdown } from '$lib/server/markdown';
import prisma from '$lib/server/prisma';
import type { Prisma } from '@prisma/client';
import { error, type RequestEvent } from '@sveltejs/kit';

const return_string = 'Blogpost not found!';

export async function load({ params, locals }: RequestEvent) {
	try {
    const q: Prisma.PostFindUniqueArgs = { where: { name: params.post } }
    if (!locals.admin){
      q.where.visibility = 0
    }
		const post = await prisma.post.findUniqueOrThrow(q);
		post.content = post.content ? await renderMarkdown(post.content) : "Blogpost is empty";
		return post;
	} catch {
	 	throw error(404, return_string);
	}
}
