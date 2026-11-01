import prisma from '#modules/database/prisma.server.js';
import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

export async function load({ params }: RequestEvent) {
	if (!params.name) {
		throw error(404, 'Gallery image not found');
	}
	const galleryPost = await prisma.galleryPost.getPost(params.name);
	if (!galleryPost) {
		throw error(404, 'Gallery image not found');
	}

	const htmlDescription = galleryPost.largeDescription?.html || 'No description provided';

	return {
		galleryPost: {
			...galleryPost,
			largeDescription: htmlDescription
		},
		meta: {
			title: `${galleryPost.title} | Berlkot`,
			'og:type': 'image',
			'og:title': `${galleryPost.title} | Berlkot`,
			'og:image': galleryPost.assets[0]
				? `https://berlkot.com/asset/${galleryPost.assets[0].asset.name}-${galleryPost.assets[0].asset.hash}.webp`
				: undefined,
			description: galleryPost.smallDescription,
			'og:description': galleryPost.smallDescription
		}
	};
}
