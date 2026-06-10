import prisma from '$modules/database/prisma.server';
import type { Prisma } from '$prisma-generated/client';

export async function load() {
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
	const blogPosts = (await prisma.blogPost.findMany(q)) as unknown as Prisma.BlogPostGetPayload<{
		select: {
			title: true;
			name: true;
			description: true;
			createdAt: true;
			updatedAt: true;
			tags: true;
			heroImage: { select: { name: true; alt: true } };
		};
	}>[];
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
