import { renderMarkdown } from '$lib/server/markdown';
import prisma from '$lib/server/prisma';
import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { Prisma } from '@prisma/client';

export async function load({ params, locals }: RequestEvent) {
	try {
		const q: Prisma.AssetFindFirstArgs = {
			where: { inGallery: true, name: params.name },
			include: {
				tags: true
			}
		};
		if (!locals.admin) {
			q.where!.visibility = 0;
		}
		const asset = await prisma.asset.findFirstOrThrow(q);
		asset.largeDescription = asset.largeDescription
			? await renderMarkdown(asset.largeDescription)
			: 'No description provided';
		return {
			asset: asset,
			meta: {
				title: `${asset.title} | Berlkot`,
				'og:type': 'image',
				'og:title': `${asset.title} | Berlkot`,
				'og:image': `https://berlkot.com/asset/${asset.name}.webp`,
				description: asset.smallDescription,
				'og:description': asset.smallDescription,
				author: asset.author
			}
		};
	} catch {
		throw error(404, 'Gallery image not found');
	}
}
