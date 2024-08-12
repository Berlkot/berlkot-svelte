import prisma from '$lib/server/prisma';
import { error, type RequestEvent } from '@sveltejs/kit';

export async function GET({ params, locals, url }: RequestEvent) {
	const width = parseInt(url.searchParams.get('w'));
	const height = parseInt(url.searchParams.get('h'));
	if (!width || !height) {
		throw error(400, { message: 'Unsufficient parameter count' });
	}

	try {
		const q = {
			where: { basename: params.image },
			select: {
				thumbnailImages: {
					where: { OR: [{ width: width }, { height: height }] }
				}
			}
		};
		if (!locals.admin) {
			q.where.visibility = 0;
		}
		const asset = await prisma.asset.findFirstOrThrow(q);
		const response = new Response(Bun.file(asset.thumbnailImages[0].path));
		//response.headers.set("Cache-Control", 'public, max-age=3600')
		return response;
	} catch (err) {
		throw error(404, { message: 'Thumbnail not found' });
	}
}
