import { renderMarkdown } from '$lib/server/markdown';
import prisma from '$lib/server/prisma';
import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { Prisma } from '@prisma/client';

export async function load({ params, locals }: RequestEvent) {
	try {
		const q: Prisma.GalleryPostFindFirstArgs = {
			where: {name: params.name },
			include: {
				tags: true,
				folders: true,
				assets: {
          include: {
            asset: true
          },
          orderBy: {
            order: 'asc'
          }
				}
			}
		};
		if (!locals.admin) {
			q.where!.visibility = 'PUBLIC';
		}
		const galleryPost = await prisma.galleryPost.findFirstOrThrow(q);
		galleryPost.largeDescription = galleryPost.largeDescription
			? await renderMarkdown(galleryPost.largeDescription)
			: 'No description provided';
		return {
			galleryPost: galleryPost,
			meta: {
				title: `${galleryPost.title} | Berlkot`,
				'og:type': 'image',
				'og:title': `${galleryPost.title} | Berlkot`,
				'og:image': `https://berlkot.com/asset/${galleryPost.assets[0].asset.name}.webp`,
				description: galleryPost.smallDescription,
				'og:description': galleryPost.smallDescription,
			}
		};
	} catch {
		throw error(404, 'Gallery image not found');
	}
}
