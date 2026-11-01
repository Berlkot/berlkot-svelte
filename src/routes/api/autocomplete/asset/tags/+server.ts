import prisma from '#modules/database/prisma.server.js';

export async function POST({ request }) {
	const { text } = await request.json();
	const tags = await prisma.galleryTag.findMany({
		where: {
			name: {
				contains: text
			}
		}
	});
	return Response.json(tags);
}
