import prisma from '$lib/server/prisma';
import type { Prisma } from '@prisma/client';
import { error, type RequestEvent } from '@sveltejs/kit';
import { basename, extname } from 'path';

export async function GET({ params, locals, url, request }: RequestEvent) {
	// and this prevents any sort of path injection because NaN equals to false lol
	const width = parseInt(url.searchParams.get('w') as string);
	const height = parseInt(url.searchParams.get('h') as string);
	const name = basename(params.name as string, extname(params.name as string));
	try {
		const q: Prisma.AssetFindFirstArgs = { where: { name: name } };
		if (!locals.admin) {
			q.where!.visibility = 'PUBLIC';
		}
		await prisma.asset.findFirstOrThrow(q);
		let file;
		if (width && height) {
			file = Bun.file(`data/assets/${name}/${width}_${height}_${params.name}`);
		} else {
			file = Bun.file(`data/assets/${name}/${params.name}`);
		}

		//   161 |
		//   162 | 	const reader = response.body.getReader();
		//               ^
		//       ENOENT: No such file or directory
		//  wo this check sveltekit crashes grasefully
		if (!(await file.exists())) {
			throw Error();
		}
		const hasher = new Bun.CryptoHasher('sha256');
		hasher.update(file.lastModified.toString());
		hasher.update(name);
		hasher.update(width.toString());
		hasher.update(height.toString());
		const header = hasher.digest('base64');
		if (request.headers.get('If-None-Match') === header) {
			return new Response(null, {
				status: 304,
				headers: { Etag: header, 'Cache-Control': 'max-age=7200, must-revalidate' }
			});
		}
		const response = new Response(file);
		response.headers.set('Etag', header);
		response.headers.set('Cache-Control', 'max-age=7200, must-revalidate');
		return response;
	} catch {
		throw error(404, { message: 'Image not found' });
	}
}
