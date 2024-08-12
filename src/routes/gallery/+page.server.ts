import prisma from '$lib/server/prisma';
import { type RequestEvent } from '@sveltejs/kit';

export async function load({ params, locals }: RequestEvent) {
	const q = {
		where: { inGallery: true },
		select: {
			name: true,
			basename: true,
			height: true,
			width: true,
			title: true,
			alt: true,
			type: true,
			contentWarning: true,
			maturity: true,
      tags: { select: {name: true} }
		}
	};
	if (!locals.admin) {
		q.where.visibility = 0;
	}
	const asset = await prisma.asset.findMany(q);
	return { images: asset };
}
