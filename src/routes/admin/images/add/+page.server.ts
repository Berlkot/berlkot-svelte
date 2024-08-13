import type { RequestEvent } from '@sveltejs/kit';
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { generateThumbnail, getDimensions, normalizeMedia } from '$lib/server/image-tools';
import { unlink } from 'fs/promises';
import { basename, extname } from 'path';

export const actions = {
  default: async ({ request }: RequestEvent) => {
    const data = await request.formData()
    const file = data.get("file")
    const name = data.get("name")
    if (!file) {
      return fail(400, {missing: true})
    }
    if (!name) {
      return fail(400, {missing: true})
    }
    const path = `data/images/${name + extname(file.name)}`
    await Bun.write(path, file)
    const out_path = await normalizeMedia(path)
    if (!out_path) {
      unlink(path)
      return fail(422)
    }
    unlink(path)
    const size = await getDimensions(out_path)
    const q = {
      name: String(name), 
      basename: basename(out_path), 
      path: out_path,
      width: size.width,
      height: size.height
    }
    if (data.get("title")) q.title = data.get("title")
    if (data.get("alt")) q.alt = data.get("alt")
    if (data.get("author")) q.author = data.get("author")
    if (data.get("contentWarning")) q.contentWarning = data.get("contentWarning")
    if (data.get("copyright")) q.copyright = data.get("copyright")
    if (data.get("smallDescription")) q.smallDescription = data.get("smallDescription")
    if (data.get("largeDescription")) q.largeDescription = data.get("largeDescription")
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
    await prisma.asset.create({ data: q })
    if (q.inGallery) {
      generateThumbnail(out_path, `data/thumbnails/${q.name}.avif`, 270, 270)
    }
  }
}