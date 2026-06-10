import prisma from '$modules/database/prisma.server';
import type { Prisma } from '$prisma-generated/client';

export async function load() {
	const q: Prisma.GalleryPostFindManyArgs = {
		take: 4,
		select: {
			name: true,
			title: true,
			assets: {
				take: 1,
				select: {
					asset: {
						select: {
							name: true,
							alt: true
						}
					}
				},
				orderBy: { order: 'asc' }
			},
			contentWarning: true,
			maturity: true,
			creationDate: true
		},
		orderBy: { creationDate: 'desc' }
	};
	const qp: Prisma.BlogPostFindManyArgs = {
		take: 3,
		select: {
			heroImage: true,
			name: true,
			title: true,
			description: true,
			createdAt: true,
			tags: true
		},
		orderBy: { createdAt: 'desc' }
	};
	const galleryPosts = await prisma.galleryPost.findMany(q);
	const blogPosts = (await prisma.blogPost.findMany(qp)) as unknown as Prisma.BlogPostGetPayload<{
		select: {
			heroImage: true;
			name: true;
			title: true;
			description: true;
			createdAt: true;
			tags: true;
		};
	}>[];
	return {
		galleryPosts: galleryPosts,
		blogPosts: blogPosts,
		meta: {
			title: `Berlkot | Artist & Developer`,
			'og:title': 'Berlkot | Artist & Developer',
			description: 'Website of Berlkot, artist and developer obsessed with cats, tech and comics.',
			'og:description':
				'Website of Berlkot, artist and developer obsessed with cats, tech and comics.'
		}
	};
}
