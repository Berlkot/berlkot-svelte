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
import { rename } from 'fs';
import { readdir } from 'fs/promises';

const validatorConfig: { [key: string]: FieldConfig } = {
	id: ['string', 'reqired'],
	file: ['file'],
	name: ['string', 'reqired'],
	alt: ['string'],
	credit: ['string'],
	type: ['string', 'enum:IMAGE:VIDEO'],
	visibility: ['string', 'enum:ADMIN:PUBLIC:SUB_ONLY'],
};
const validatorConfigWithFile = { ...validatorConfig };
validatorConfigWithFile.file.push('reqired');
delete validatorConfigWithFile.id;

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
		const prev = await prisma.asset.findUnique({
			where: { id: String(data.id) },
		});
		if (prev!.name !== name) {
			rename(`data/assets/${prev!.name}`, `data/assets/${name}`, () => {});
			await Bun.$`rename ${prev!.name} ${name} data/assets/${name}/*`;
		}
		if ((file as File).name) {
			const thumbnails = (await readdir(`data/assets/${name}`, { withFileTypes: true })).filter(
				(f) => f.name !== `${name}.webp` && f.name !== `${name}.mp4`
			);
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
				for (const thumbnail of thumbnails) {
					await generateThumbnail(
						out_path,
						`data/assets/${q.name}/${q.name}.webp`,
						parseInt(thumbnail.name.split('_')[0]),
						parseInt(thumbnail.name.split('_')[1])
					);
				}
			} catch {
				return fail(422, { message: 'Failed to proccess media' });
			}
		}
		const asset = await prisma.asset.update({
			where: { id: String(data.id) },
			data: q,
		});
		return asset;
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
			// also checks if image type is supported by imagemagick
			await generateThumbnail(out_path, `data/assets/${q.name}/${q.name}.webp`, 270, 270);
			await generateThumbnail(out_path, `data/assets/${q.name}/${q.name}.webp`, 465, 260);
			await generateThumbnail(out_path, `data/assets/${q.name}/${q.name}.webp`, 1280, 720);
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
