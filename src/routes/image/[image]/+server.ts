import { error, type RequestEvent } from '@sveltejs/kit';
import { extname } from 'path';

export async function GET({ params }: RequestEvent) {
	const pathName = `data/images/${params.image}`;
  if (extname(pathName) === ".json") throw error(404, { message: "Gallery image not found" })
	try {
		const response = new Response(Bun.file(pathName));
		//response.headers.set("Cache-Control", 'public, max-age=3600')
		return response;
	} catch {
		throw error(404, { message: 'Gallery image not found' });
	}
}
