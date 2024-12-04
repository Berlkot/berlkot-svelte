import prisma from '$lib/server/prisma';
import type { RequestEvent } from './$types';

export async function load({ params }: RequestEvent) {
	return { posts: await prisma.post.findUnique({ where: { name: params.post } }) };
}
