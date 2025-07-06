import prisma from '$lib/server/prisma';
import type { Prisma } from '@prisma/client';
import type { RequestEvent } from '@sveltejs/kit';

export async function load({ params, locals }: RequestEvent) {
	const q: Prisma.BlogPostFindManyArgs = {
		select: {
			title: true,
			name: true,
			description: true,
			createdAt: true,
			updatedAt: true,
			tags: true,
			heroImage: { select: { name: true, alt: true } }
		}
	};
	if (!locals.admin) {
		q.where = {};
		q.where.visibility = 'PUBLIC';
	}
	const blogPosts = await prisma.blogPost.findMany(q);
	return {
		blogPosts,
		meta: {
			title: 'Blog | Berlkot',
			'og:title': 'Blog | Berlkot',
			description: 'Some of my thoughts to share with outer world',
			'og:description': 'Some of my thoughts to share with outer world'
		}
	};
}
