import type { ActionFailure, RequestEvent } from '@sveltejs/kit';
import type { Actions } from './$types';
import { fail, isActionFailure } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { generateThumbnail, getDimensions, normalizeMedia } from '$lib/server/image-tools';
import { extname } from 'path';
import { mkdir } from 'fs/promises';
import type { Asset, Prisma } from '@prisma/client';
import { rm } from 'fs/promises';



async function validateFields(q: Asset, data: FormData): Promise<Asset | ActionFailure<{invalid: boolean}>> {
  if (data.get("title")) q.title = data.get("title") as string
  if (data.get("alt")) q.alt = data.get("alt") as string
  if (data.get("author")) q.author = data.get("author") as string
  if (data.get("contentWarning")) q.contentWarning = data.get("contentWarning") as string
  if (data.get("copyright")) q.copyright = data.get("copyright") as string
  if (data.get("smallDescription")) q.smallDescription = data.get("smallDescription") as string
  if (data.get("largeDescription")) q.largeDescription = data.get("largeDescription") as string
  const creationDate = data.get("creationDate")
  if (creationDate && !isNaN(Date.parse(creationDate.toString())) ) {
    q.creationDate = new Date(Date.parse(creationDate.toString()))
  } else if (creationDate) {
    return fail(400, {invalid: true})
  }
  const inGallery = data.get("inGallery")
  if (inGallery && (inGallery.toString() === "false" || inGallery.toString() === "true")) {
    q.inGallery = inGallery === "true"
  }
  const type = data.get("type")
  if (type) {
    const p_type = parseInt(type.toString())
    if (!isNaN(p_type) && p_type > -1){
      q.type = p_type
    } else {
      return fail(400, {invalid: true})
    }
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
  const maturity = data.get("maturity")
  if (maturity) {
    const p_maturity = parseInt(maturity.toString())
    if (!isNaN(p_maturity) && p_maturity > -1){
      q.maturity = p_maturity
    } else {
      return fail(400, {invalid: true})
    }
  }
  return q
}

export async function load() {
  return {images: await prisma.asset.findMany()};
}

export const actions = {
  edit: async ({ request }: RequestEvent) => {
    const data = await request.formData()
    const file = data.get("file")
    const name = data.get("name")
    if (!name) {
      return fail(400, {missing: true})
    }
    let q: Prisma.AssetUpdateInput = {
      name: String(name),
    }
    const out = await validateFields(q, data)
    if (isActionFailure(out)) {
      return out
    } else {
      q = out
    }
    if ((file as File).name) {
      await rm(`data/images/${name}`, {force: true, recursive: true})
      await mkdir(`data/images/${name}`)
      const path = `data/images/${name}/${name + extname((file as File).name)}`
      await Bun.write(path, file as File)
      const out_path = await normalizeMedia(path)
      if (!out_path) {
        return fail(422)
      }
      const size = await getDimensions(out_path)
      q.width = size.width
      q.height = size.height
      if (q.inGallery) {
        await generateThumbnail(out_path, `data/images/${q.name}/${q.name}.webp`, 270, 270)
      }
    }
    await prisma.asset.update({where: {name: String(name)}, data: q})
  },
  create: async ({ request }: RequestEvent) => {
    const data = await request.formData()
    const file = data.get("file")
    const name = data.get("name")
    if (!file) {
      return fail(400, {missing: true})
    }
    if (!name) {
      return fail(400, {missing: true})
    }
    await mkdir(`data/images/${name}`)
    const path = `data/images/${name}/${name + extname((file as File).name)}`
    await Bun.write(path, file)
    const out_path = await normalizeMedia(path)
    if (!out_path) {
      return fail(422)
    }
    const size = await getDimensions(out_path)
    let q: Prisma.AssetCreateInput = {
      name: String(name),
      width: size.width,
      height: size.height
    }
    const out = await validateFields(q, data)
    if (isActionFailure(out)) {
      return out
    } else {
      q = out
    }
    if (q.inGallery) {
      await generateThumbnail(out_path, `data/images/${q.name}/${q.name}.webp`, 270, 270)
    }
    await prisma.asset.create({ data: q })
  },
  delete: async ({ request }: RequestEvent) => {
    const data = await request.formData()
    const name = data.get('name') as string
    await prisma.asset.delete({where: { name: name}})
    await rm(`data/images/${name}`, {force: true, recursive: true})
  }
  
} satisfies Actions