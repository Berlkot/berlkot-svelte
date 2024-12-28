import prisma from '$lib/server/prisma';
import type { Prisma } from '@prisma/client';
import { type RequestEvent } from '@sveltejs/kit';

export async function load({ params, locals, url }: RequestEvent) {

	// TODO: implement filters
	// const maturity = url.searchParams.getAll('maturity');
	// const ordering = url.searchParams.get('ordering');
	// const tags = url.searchParams.getAll('tag');
	// const text = url.searchParams.get('text');
	const q: Prisma.AssetFindManyArgs = {
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
			tags: { select: { name: true } }
		},
		orderBy: { creationDate: 'desc' }
	};
	if (!locals.admin) {
		q.where!.visibility = 0;
	}
	const asset = await prisma.asset.findMany(q);
	return { images: asset };
}
