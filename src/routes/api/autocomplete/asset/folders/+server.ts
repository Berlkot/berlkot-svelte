import prisma from '#modules/database/prisma.server.js';

export async function POST({ request }) {
	const { text } = await request.json();
	const folders = await prisma.galleryFolder.findMany({
		where: {
			name: {
				contains: text
			}
		}
	});
	return Response.json(folders);
}
