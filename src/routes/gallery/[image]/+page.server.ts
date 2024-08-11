import { renderMarkdown } from '$lib/server/markdown';
import prisma from '$lib/server/prisma';
import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

export async function load({ params, locals }: RequestEvent) {
	try {
		const q = {
			where: { inGallery: true, name: params.image },
			select: {
				name: true,
				basename: true,
				height: true,
				width: true,
				title: true,
				alt: true,
				contentWarning: true,
				maturity: true,
        tags: { select: {name: true} },
				copyright: true,
				largeDescription: true,
				creationDate: true,
				author: true
			}
		};
		if (!locals.admin) {
			q.where.visibility = 0;
		}
		const asset = await prisma.asset.findFirstOrThrow(q);
		asset.largeDescription = asset.largeDescription ? await renderMarkdown(asset.largeDescription) : 'No description provided';
		return asset;
	} catch {
		throw error(404, "Gallery image not found");
	}
}
