import { renderMarkdown } from '$lib/server/markdown';
import prisma from '$lib/server/prisma';
import type { Prisma } from '@prisma/client';
import { error, type RequestEvent } from '@sveltejs/kit';

const return_string = 'Blogpost not found!';

export async function load({ params, locals }: RequestEvent) {
	try {
		const q: Prisma.PostFindUniqueArgs = {
			where: { name: params.post },
			include: {
				tags: true,
				thumbnail: { select: { name: true, smallDescription: true, alt: true } }
			}
		};
		if (!locals.admin) {
			q.where.visibility = 0;
		}
		const post = await prisma.post.findUniqueOrThrow(q);
		post.content = post.content ? await renderMarkdown(post.content) : 'Blogpost is empty';
		let meta = {
			title: `${post.title} | Berlkot`,
			'og:title': `${post.title} | Berlkot`,
			description: post.description,
			'og:description': post.description,
			author: post.author,
			'og:type': 'article'
		};
		if (post.thumbnail) {
			meta['og:image'] = `https://berlkot.com/asset/${post.thumbnail.name}.webp`;
		}
		return { post, meta };
	} catch {
		throw error(404, return_string);
	}
}
