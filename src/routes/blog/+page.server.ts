import prisma from "$lib/server/prisma";
import type { RequestEvent } from "@sveltejs/kit";

// TODO remove unused data
export async function load({ params, locals }: RequestEvent) {
  const posts = await prisma.post.findMany(locals.admin ? undefined : { where: {visibility: 0} })
	return { posts };
}
