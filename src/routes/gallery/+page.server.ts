import prisma from '$lib/server/prisma';
import { Prisma } from '@prisma/client';
import { type RequestEvent } from '@sveltejs/kit';

export async function load({ params, locals, url }: RequestEvent) {
	let tags = url.searchParams.getAll('tags');
	if (tags.length > 0) {
		tags = tags[0].split(',');
	} else {
		tags = [];
	}
	const folder = url.searchParams.get('folder');
	if (!folder && !tags.length) {
    const folders = await prisma.galleryFolder.findMany(
      {
        include: {heroImage: true}
      }
    );
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
	let folderObj
	const andQuery: Prisma.GalleryPostWhereInput[] = tags.map((tag) => ({ tags: { some: { name: tag } } }))
	if (folder) {
	  andQuery.push({ folders: { some: { name: folder } } })
		folderObj	= await prisma.galleryFolder.findUnique({
				where: {
					name: folder
				}
			});
	}
	const q: Prisma.GalleryPostFindManyArgs = {
		where: {
      AND: andQuery,
		},
		select: {
			name: true,
			title: true,
			contentWarning: true,
			maturity: true,
			assets: {
				take: 1,
				select: {
					asset: {
						select: {
							name: true,
							height: true,
							width: true,
							alt: true,
							type: true
						}
					}
				},
				orderBy: { order: 'asc' }
			},
			tags: { select: { name: true } },
			folders: { select: { name: true } }
		},
		orderBy: { creationDate: 'desc' }
	};
	if (!locals.admin) {
		q.where!.visibility = 'PUBLIC';
	}
	const galleryPosts = await prisma.galleryPost.findMany(q);
	return {
		galleryPosts: galleryPosts,
		folder: folderObj,
		meta: {
			title: `Gallery ${folder ? `- ${folder}` : ''} | Berlkot`,
			'og:title': `Gallery ${folder ? `- ${folder}` : ''} | Berlkot`,
			description: folderObj ? folderObj.description : 'All sorts of artworks for past couple of years',
			'og:description': folderObj ? folderObj.description : 'All sorts of artworks for past couple of years'
		}
	};
}
