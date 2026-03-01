import { renderMarkdown } from '$lib/server/markdown';
import prisma from '$lib/server/prisma';
import type { Prisma } from '$prisma-generated/client';
import { error, type RequestEvent } from '@sveltejs/kit';

const return_string = 'Blogpost not found!';

export async function load({ params, locals }: RequestEvent) {
	try {
		const q: Prisma.BlogPostFindUniqueArgs = {
			where: { name: params.post },
			include: {
				tags: true,
				heroImage: { select: { name: true, credit: true, alt: true } }
			}
		};
		if (!locals.admin) {
			q.where.visibility = 'PUBLIC';
		}
		const blogPost = await prisma.blogPost.findUniqueOrThrow(q);
		blogPost.content = blogPost.content ? await renderMarkdown(blogPost.content) : 'Blogpost is empty';
		const meta = {
			title: `${blogPost.title} | Berlkot`,
			'og:title': `${blogPost.title} | Berlkot`,
			description: blogPost.description,
			'og:description': blogPost.description,
			author: blogPost.author,
			'og:type': 'article'
		};
		if (blogPost.heroImage) {
			meta['og:image'] = `https://berlkot.com/asset/${blogPost.heroImage.name}.webp`;
		}
		return { blogPost, meta };
	} catch {
		throw error(404, return_string);
	}
}
