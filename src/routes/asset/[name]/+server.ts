import prisma from '$modules/database/prisma.server';
import { error, isRedirect, redirect } from '@sveltejs/kit';

import { basename, extname } from 'path';
import { MEDIA_BASE_PATH } from '$modules/asset/service.server';
import type { RequestEvent } from './$types';

export async function GET({ params, url }: RequestEvent) {
	// and this prevents any sort of path injection because NaN equals to false lol
	const width = parseInt(url.searchParams.get('w') as string);
	const height = parseInt(url.searchParams.get('h') as string);
	const rawName = basename(params.name as string, extname(params.name as string));
	const splitIndex = rawName.lastIndexOf('-');
	let name;
	let hash;
	if (splitIndex !== -1) {
		name = rawName.substring(0, splitIndex);
		hash = rawName.substring(splitIndex + 1);
	} else {
		name = rawName;
	}
	const hasParams = width && height;
	if ((width || height) && !hasParams) {
		throw error(400);
	}
	try {
		const asset = await prisma.asset.findFirstOrThrow({ where: { name: name } });
		if (asset.hash && (!hash || hash !== asset.hash)) {
			throw redirect(
				308,
				hasParams
					? `/asset/${asset.name}-${asset.hash}.webp?w=${width}&h=${height}`
					: `/asset/${asset.name}-${asset.hash}.${asset.type === 'VIDEO' ? 'mp4' : 'webp'}`
			);
		}
		const file = Bun.file(
			hasParams
				? `${MEDIA_BASE_PATH}/${asset.name}/${width}_${height}_${asset.name}.webp`
				: `${MEDIA_BASE_PATH}/${asset.name}/${asset.name}.${asset.type === 'VIDEO' ? 'mp4' : 'webp'}`
		);
		//   161 |
		//   162 | 	const reader = response.body.getReader();
		//               ^
		//       ENOENT: No such file or directory
		//  wo this check sveltekit crashes grasefully
		if (!(await file.exists())) {
			throw Error();
		}
		const response = new Response(file);
		response.headers.set('Cache-Control', 'max-age=315360000, public, immutable');
		return response;
	} catch (e) {
		console.log(e);
		if (isRedirect(e)) throw e;
		throw error(404, { message: 'Image not found' });
	}
}
