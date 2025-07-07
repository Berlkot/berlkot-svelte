import prisma from '$lib/server/prisma';
import type { RequestEvent } from './$types';

export async function load({ params }: RequestEvent) {
	return {
		post: await prisma.blogPost.findUnique({
			where: { name: params.post },
			include: { tags: true, heroImage: { select: { name: true, id: true, alt: true } } }
		}),
		images: await prisma.asset.findMany({ select: { name: true, id: true } })
	};
}
