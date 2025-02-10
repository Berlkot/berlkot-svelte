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
	const q: Prisma.AssetFindManyArgs = {
		where: {
			inGallery: true,
			AND: tags.map((tag) => ({ tags: { some: { name: tag } } }))
		},
		select: {
			name: true,
			height: true,
			width: true,
			title: true,
			alt: true,
			type: true,
			contentWarning: true,
			maturity: true,
			tags: { select: { name: true } }
		},
		orderBy: { creationDate: 'desc' }
	};
	if (!locals.admin) {
		q.where!.visibility = 0;
	}
	const asset = await prisma.asset.findMany(q);
	return {
		images: asset,
		meta: {
			title: 'Gallery | Berlkot',
			'og:title': 'Gallery | Berlkot',
			description: 'All sorts of artworks for past couple of years',
			'og:description': 'All sorts of artworks for past couple of years'
		}
	};
}
