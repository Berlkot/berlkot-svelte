import type { RequestEvent } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { Validator, type FieldConfig } from '$lib/form-validator';
import type { Prisma } from '@prisma/client';

export async function load() {
	return {
		folders: await prisma.galleryFolder.findMany({ include: { heroImage: true } }),
		images: await prisma.asset.findMany({ select: { name: true, id: true } })
	};
}

const validatorConfig: { [key: string]: FieldConfig } = {
	id: ['string'],
	name: ['string', 'reqired'],
	description: ['string', 'reqired'],
	width: ['int'],
	height: ['int'],
	heroImage: ['string']
};

export const actions = {
	create: async ({ request }: RequestEvent) => {
		const validator = new Validator(validatorConfig);
		const data = validator.parseData(await request.formData());
		if (!data) {
			return fail(400, validator.status);
		}
		if (data.heroImage) {
			const heroImage = (await prisma.asset.findUnique({
				where: { name: String(data.heroImage) }
			}))!;
			data.heroImage = {};
			data.heroImage.connect = { id: heroImage.id };
		}

		return await prisma.galleryFolder.create({ data: data as unknown as Prisma.GalleryFolderCreateInput, include: { heroImage: true } });
	},
	edit: async ({ request }: RequestEvent) => {
		const validator = new Validator(validatorConfig);
		const data = validator.parseData(await request.formData());
		if (!data) {
			return fail(400, validator.status);
		}
		if (data.heroImage) {
			const heroImage = (await prisma.asset.findUnique({
				where: { name: String(data.heroImage) }
			}))!;
			data.heroImage = {};
			data.heroImage.connect = { id: heroImage.id };
		}

		const q: Prisma.GalleryFolderUpdateInput = {
			...data
		};
		return await prisma.galleryFolder.update({
			where: { id: String(data.id) },
			data: q,
			include: {
			heroImage:true
			}
		});;
	},
	delete: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		await prisma.galleryFolder.delete({ where: { name: name } });
	}
};
