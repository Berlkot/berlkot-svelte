import prisma from '$lib/server/prisma';
import type { Prisma } from '@prisma/client';
import type { RequestEvent } from '@sveltejs/kit';

export async function load({ params, locals }: RequestEvent) {
	const q: Prisma.PostFindManyArgs = {
		select: {
			title: true,
			name: true,
			description: true,
			createdAt: true,
			updatedAt: true,
			tags: true,
			thumbnail: { select: { name: true, smallDescription: true, alt: true } }
		}
	};
	if (!locals.admin) {
		q.where = {};
		q.where.visibility = 0;
	}
	const posts = await prisma.post.findMany(q);
	return {
		posts,
		meta: {
			title: 'Blog | Berlkot',
			'og:title': 'Blog | Berlkot',
			description: 'Some of my thoughts to share with outer world',
			'og:description': 'Some of my thoughts to share with outer world'
		}
	};
}
