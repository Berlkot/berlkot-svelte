import prisma from '$lib/server/prisma';
import { error, type RequestEvent } from '@sveltejs/kit';

export async function GET({ params, locals, url }: RequestEvent) {
	try {
    const q = { where: { basename: params.image } }
	  if (!locals.admin){
      q.where.visibility = 0
			}
	  const asset = await prisma.asset.findFirstOrThrow(q);
		const response = new Response(Bun.file(asset.path));
		//response.headers.set("Cache-Control", 'public, max-age=3600')
		return response;
	} catch (err) {
		throw error(404, { message: 'Gallery image not found' });
	}
}
