import prisma from '$lib/server/prisma';
import type { Prisma } from '@prisma/client';
import { type RequestEvent } from '@sveltejs/kit';

export async function load({ locals }: RequestEvent) {
	const q: Prisma.AssetFindManyArgs = {
		take: 4,
		where: { inGallery: true },
		select: {
			name: true,
			height: true,
			width: true,
			title: true,
			alt: true,
			type: true,
			contentWarning: true,
			maturity: true,
			creationDate: true,
			tags: { select: { name: true } }
		},
		orderBy: { creationDate: 'desc' }
	};
	const qp: Prisma.PostFindManyArgs = {
		take: 3,
		select: {
			thumbnail: true,
			name: true,
			title: true,
			description: true,
			createdAt: true,
			tags: true
		},
		orderBy: { createdAt: 'desc' }
	};
	if (!locals.admin) {
		q.where!.visibility = 0;
		qp.where = {};
		qp.where!.visibility = 0;
	}
	const asset = await prisma.asset.findMany(q);
	const posts = await prisma.post.findMany(qp);
	return {
		images: asset,
		posts: posts,
		meta: {
			title: `Berlkot | Artist & Developer`,
			'og:title': 'Berlkot | Artist & Developer',
			description: 'Website of Berlkot, artist and developer obsessed with cats, tech and comics.',
			'og:description':
				'Website of Berlkot, artist and developer obsessed with cats, tech and comics.'
		}
	};
}
