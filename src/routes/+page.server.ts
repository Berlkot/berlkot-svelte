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
	if (!locals.admin) {
		q.where!.visibility = 0;
	}
	const asset = await prisma.asset.findMany(q);
	return { images: asset };
}
