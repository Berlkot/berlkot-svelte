import prisma from "$lib/server/prisma";
import type { RequestEvent } from "@sveltejs/kit";

export async function load({ params, locals }: RequestEvent) {
  const q = {select: {title: true, name: true, description: true, createdAt: true, updatedAt: true}}
  if (!locals.admin){
    q.where = {}
    q.where.visibility = 0
  }
  const posts = await prisma.post.findMany(q)
	return { posts };
}
