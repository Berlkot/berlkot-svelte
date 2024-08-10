import prisma from '$lib/server/prisma';
import { error, type RequestEvent } from '@sveltejs/kit';
import { extname } from 'path';

export async function GET({ params, locals }: RequestEvent) {
	try {
    const q = { where: { name: params.image } }
	  if (!locals.admin){
      q.where.visibility = 0
			}
	  const image = await prisma.image.findUniqueOrThrow(q);
		const response = new Response(Bun.file(image.path));
		//response.headers.set("Cache-Control", 'public, max-age=3600')
		return response;
	} catch (err) {
		throw error(404, { message: 'Gallery image not found' });
	}
}
