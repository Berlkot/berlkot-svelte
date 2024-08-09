import prisma from '$lib/server/prisma';
import { type RequestEvent } from '@sveltejs/kit';
import { basename } from 'path';


//TODO Remode unused vars
export async function load({ params, locals }: RequestEvent) {
  const images = await prisma.image.findMany(locals.admin ? {where: {inGallery: true}} : { where: { visibility: 0, inGallery: true } });
	for (const image of images) {
	  image.path = `image/${basename(image.path)}`
	}
	return { images: images };
}
