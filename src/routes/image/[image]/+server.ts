import prisma from '$lib/server/prisma';
import { error, type RequestEvent } from '@sveltejs/kit';

export async function GET({ params, locals, url }: RequestEvent) {
	const width = parseInt(url.searchParams.get('w'));
	const height = parseInt(url.searchParams.get('h'));
	try {
		const q = { where: { basename: params.image } };
		if (!locals.admin) {
			q.where.visibility = 0;
		}
		if (width && height) {
			q.select = {
				thumbnailImages: {
					where: { width: width, height: height }
				}
			};
		}
		const asset = await prisma.asset.findFirstOrThrow(q);
		const response = new Response(Bun.file(asset.path || asset.thumbnailImages[0].path));
		//response.headers.set("Cache-Control", 'public, max-age=3600')
		return response;
	} catch {
		throw error(404, { message: 'Image not found' });
	}
}
