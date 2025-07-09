import prisma from '$lib/server/prisma.js';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const { text } = await request.json();
	const folders = await prisma.galleryFolder.findMany({
		where: {
			name: {
				contains: text
			}
		}
	});
	return json(folders);
}
