import prisma from '#modules/database/prisma.server.js';
import { Prisma } from '#prisma-generated/client.js';
import { type RequestEvent } from '@sveltejs/kit';

export async function load({ url }: RequestEvent) {
	let tags = url.searchParams.getAll('tags');
	if (tags.length > 0) {
		tags = tags[0].split(',');
	} else {
		tags = [];
	}
	const folder = url.searchParams.get('folder');
	if (!folder && !tags.length) {
		const folders = await prisma.galleryFolder.getFolders();
		return {
			folders: folders,
			meta: {
				title: 'Gallery | Berlkot',
				'og:title': 'Gallery | Berlkot',
				description: 'All sorts of artworks for past couple of years',
				'og:description': 'All sorts of artworks for past couple of years'
			}
		};
	}
	let folderObj;
	const andQuery: Prisma.GalleryPostWhereInput[] = tags.map((tag) => ({
		tags: { some: { name: tag } }
	}));
	if (folder) {
		andQuery.push({ folders: { some: { name: folder } } });
		folderObj = await prisma.galleryFolder.getFolder(folder);
	}
	const q: Omit<Prisma.GalleryPostFindManyArgs, 'include'> = {
		where: {
			AND: andQuery
		},
		orderBy: { creationDate: 'desc' }
	};
	const galleryPosts = await prisma.galleryPost.getPosts(q);
	return {
		galleryPosts: galleryPosts,
		folder: folderObj,
		meta: {
			title: `Gallery ${folder ? `- ${folder}` : ''} | Berlkot`,
			'og:title': `Gallery ${folder ? `- ${folder}` : ''} | Berlkot`,
			description: folderObj
				? folderObj.description
				: 'All sorts of artworks for past couple of years',
			'og:description': folderObj
				? folderObj.description
				: 'All sorts of artworks for past couple of years'
		}
	};
}
