import prisma from '$modules/database/prisma.server';
import type { RequestEvent } from './$types';

export async function load({ params }: RequestEvent) {
	const post = await prisma.blogPost.getPost(params.post);
	return {
		post: post ? { ...post, content: post.content?.markdown ?? '' } : null,
		images: await prisma.asset.findMany({ select: { name: true, id: true, hash: true } })
	};
}
