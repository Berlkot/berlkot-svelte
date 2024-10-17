import prisma from '$lib/server/prisma';
import { error, type RequestEvent } from '@sveltejs/kit';
import { basename, extname } from 'path';

export async function GET({ params, locals, url }: RequestEvent) {
  // and this prevents any sort of path injection because NaN equals to false lol 
	const width = parseInt(url.searchParams.get('w'));
	const height = parseInt(url.searchParams.get('h'));
	const name = basename(params.image, extname(params.image))
	try {
		const q = { where: { name: name } };
		if (!locals.admin) {
			q.where.visibility = 0;
		}
		await prisma.asset.findFirstOrThrow(q);
		let file
		if (width && height) {
		  file = Bun.file(`data/images/${name}/${width}_${height}_${params.image}`);
		} else {
		  file = Bun.file(`data/images/${name}/${params.image}`);
		}
		
	//   161 |
	//   162 | 	const reader = response.body.getReader();
  //               ^
  //       ENOENT: No such file or directory
  //  wo this check sveltekit crashes grasefully
		if (!await file.exists()) {
		  throw Error()
		}
		const response = new Response(file)
		//response.headers.set("Cache-Control", 'public, max-age=3600')
		return response;
	} catch {
		throw error(404, { message: 'Image not found' });
	}
}
