import type { RequestEvent } from '@sveltejs/kit';
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { generateThumbnail, getDimensions, normalizeMedia } from '$lib/server/image-tools';
import { extname } from 'path';
import { mkdir } from 'fs/promises';
import type { Prisma } from '@prisma/client';
import { rm } from 'fs/promises';
import { Validator, type FieldConfig } from '$lib/form-validator';

const validatorConfig: { [key: string]: FieldConfig } = {
	file: ['file'],
	name: ['string', 'reqired'],
	title: ['string'],
	alt: ['string'],
	author: ['string'],
	contentWarning: ['string'],
	copyright: ['string'],
	smallDescription: ['string'],
	largeDescription: ['string'],
	creationDate: ['date'],
	inGallery: ['bool'],
	type: ['int', 'range:0:2'],
	visibility: ['int', 'range:-1:2'],
	maturity: ['int', 'range:0:3']
};
const validatorConfigWithFile = { ...validatorConfig };
validatorConfigWithFile.file.push('reqired');

export async function load() {
	return { images: await prisma.asset.findMany() };
}

export const actions = {
	edit: async ({ request }: RequestEvent) => {
		const validator = new Validator(validatorConfig);
		const data = validator.parseData(await request.formData());
		if (!data) {
			return fail(400, validator.status);
		}
		const { file, name, ...rest } = data;
		const q: Prisma.AssetUpdateInput = {
			name: String(name),
			...rest
		};
		if ((file as File).name) {
			await rm(`data/assets/${name}`, { force: true, recursive: true });
			await mkdir(`data/assets/${name}`);
			const path = `data/assets/${name}/${name + extname((file as File).name)}`;
			await Bun.write(path, file as File);
			const out_path = await normalizeMedia(path);
			if (!out_path) {
				return fail(422, { message: 'Failed to proccess media' });
			}
			const size = await getDimensions(out_path);
			q.width = size.width;
			q.height = size.height;
			try {
				await generateThumbnail(out_path, `data/assets/${q.name}/${q.name}.webp`, 270, 270);
			} catch {
				return fail(422, { message: 'Failed to proccess media' });
			}
		}
		return await prisma.asset.update({ where: { name: String(name) }, data: q });
	},
	create: async ({ request }: RequestEvent) => {
		const validator = new Validator(validatorConfigWithFile);
		const data = validator.parseData(await request.formData());
		if (!data) {
			return fail(400, validator.status);
		}
		const { file, name, ...rest } = data;
		try {
			await mkdir(`data/assets/${name}`);
		} catch {
			return fail(400, { message: 'Image already exists' });
		}

		const path = `data/assets/${name}/${name + extname((file as File).name)}`;
		await Bun.write(path, file as File);
		const out_path = await normalizeMedia(path);
		if (!out_path) {
			return fail(422, { message: 'Failed to proccess media' });
		}
		const size = await getDimensions(out_path);
		const q: Prisma.AssetCreateInput = {
			name: String(name),
			width: size.width,
			height: size.height,
			...rest
		};
		try {
			await generateThumbnail(out_path, `data/assets/${q.name}/${q.name}.webp`, 270, 270);
		} catch {
			return fail(422, { message: 'Failed to proccess media' });
		}
		return await prisma.asset.create({ data: q });
	},
	delete: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		await prisma.asset.delete({ where: { name: name } });
		await rm(`data/assets/${name}`, { force: true, recursive: true });
	}
} satisfies Actions;
