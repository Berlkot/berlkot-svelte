import type { RequestEvent } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import prisma from '#modules/database/prisma.server.js';
import { Validator, type FieldConfig } from '#modules/forms/form-validator.js';
import type { GalleryFolderInput } from '#modules/gallery/extension.server.js';

export async function load() {
	const folders = await prisma.galleryFolder.getFolders();
	return {
		folders,
		images: await prisma.asset.findMany({ select: { name: true, id: true, hash: true } })
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
		return await prisma.galleryFolder.createFolder(data as GalleryFolderInput);
	},
	edit: async ({ request }: RequestEvent) => {
		const validator = new Validator(validatorConfig);
		const data = validator.parseData(await request.formData());
		if (!data) {
			return fail(400, validator.status);
		}
		const { id, ...rest } = data;

		return await prisma.galleryFolder.updateFolder(String(id), rest);
	},
	delete: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		await prisma.galleryFolder.deleteFolder(name);
	}
};
