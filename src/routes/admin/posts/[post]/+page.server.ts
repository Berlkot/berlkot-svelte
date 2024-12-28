import prisma from '$lib/server/prisma';
import type { RequestEvent } from './$types';

export async function load({ params }: RequestEvent) {
	return {
		post: await prisma.post.findUnique({
			where: { name: params.post },
			include: { tags: true, thumbnail: { select: { name: true, id: true } } }
		}),
		images: await prisma.asset.findMany({ select: { name: true, id: true } })
	};
}
