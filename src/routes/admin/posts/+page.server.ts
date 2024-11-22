import type { RequestEvent } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';


export async function load() {
  return {posts: await prisma.post.findMany()};
}

export const actions = {
  create: async ({ request }: RequestEvent) => {
    const data = await request.formData()
    const name = data.get("name")
    const title = data.get("title")
    if (!name) {
      return fail(400, {missing: true})
    }
    const q = {
      name: String(name),
      title: String(title,)
    }
    if (data.get("title")) q.title = data.get("title")
    if (data.get("author")) q.author = data.get("author")
    if (data.get("description")) q.description = data.get("description")
    if (data.get("content")) q.content = data.get("content")
    const createdAt = data.get("createdAt")
    if (createdAt && !isNaN(Date.parse(createdAt.toString())) ) {
      q.createdAt = new Date(Date.parse(createdAt.toString()))
    } else if (createdAt) {
      return fail(400, {invalid: true})
    }
    const visibility = data.get("visibility")
    if (visibility) {
      const p_visibility = parseInt(visibility.toString())
      if (!isNaN(p_visibility) && p_visibility > -2){
        q.visibility = p_visibility
      } else {
        return fail(400, {invalid: true})
      }
    }
    await prisma.post.create({ data: q })
    return {success: true}
  }
}