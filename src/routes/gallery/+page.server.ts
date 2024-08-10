import prisma from '$lib/server/prisma';
import { type RequestEvent } from '@sveltejs/kit';

export async function load({ params, locals }: RequestEvent) {
	const q = {
		where: { inGallery: true },
		select: {
			name: true,
			height: true,
			width: true,
			title: true,
			alt: true,
			contentWarning: true,
			maturity: true,
      tags: { select: {name: true} },
		}
	};
	if (!locals.admin) {
		q.where.visibility = 0;
	}
	const images = await prisma.image.findMany(q);
	return { images: images };
}
