import prisma from '$lib/server/prisma';
import type { Prisma } from '@prisma/client';
import { type RequestEvent } from '@sveltejs/kit';

export async function load({ params, locals, url }: RequestEvent) {
	// TODO: implement filters
	// const maturity = url.searchParams.getAll('maturity');
	// const ordering = url.searchParams.get('ordering');
	let tags = url.searchParams.getAll('tags');
	if (tags.length > 0) {
		tags = tags[0].split(',');
	} else {
		tags = [];
	}
	// const text = url.searchParams.get('text');
	const q: Prisma.GalleryPostFindManyArgs = {
		where: {
			AND: tags.map((tag) => ({ tags: { some: { name: tag } } }))
		},
		select: {
			name: true,
			title: true,
			contentWarning: true,
			maturity: true,
			assets: {
				take: 1,
				select: {
					order: true,
					asset: {
						select: {
							name: true,
							height: true,
							width: true,
							alt: true,
							type: true
						}
					}
				},
				orderBy: { order: 'asc' }
			},
			tags: { select: { name: true } },
			folders: { select: { name: true } }
		},
		orderBy: { creationDate: 'desc' }
	};
	if (!locals.admin) {
		q.where!.visibility = 'PUBLIC';
	}
	const galleryPosts = await prisma.galleryPost.findMany(q);
	return {
		galleryPosts: galleryPosts,
		meta: {
			title: 'Gallery | Berlkot',
			'og:title': 'Gallery | Berlkot',
			description: 'All sorts of artworks for past couple of years',
			'og:description': 'All sorts of artworks for past couple of years'
		}
	};
}
