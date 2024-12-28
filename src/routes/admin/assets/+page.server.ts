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

const validatorConfig: { [key: string]: FieldConfig } = {
	id: ['string', 'reqired'],
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
	maturity: ['int', 'range:0:3'],
	tags: ['string'],
	folders: ['string']
};
const validatorConfigWithFile = { ...validatorConfig };
validatorConfigWithFile.file.push('reqired');
delete validatorConfigWithFile.id;

export async function load() {
	return { images: await prisma.asset.findMany({include: {tags: true}}) };
}

export const actions = {
	edit: async ({ request }: RequestEvent) => {
		const validator = new Validator(validatorConfig);
		const data = validator.parseData(await request.formData());
		if (!data) {
			return fail(400, validator.status);
		}
		const { file, name, tags, folders, ...rest } = data;
		const stringTags = tags ? (tags as string).split(',') : []
		const foldersTags = folders ? (folders as string).split(',') : []
		const q: Prisma.AssetUpdateInput = {
			name: String(name),
			...rest
		};
		const prev = await prisma.asset.findUnique({ where: { id: String(data.id) }, include: { tags: true } });

		if (stringTags || foldersTags) {
			q.tags = {}
			const toDisconnect = prev!.tags.filter((tag) => !stringTags.includes(tag.name) && !foldersTags?.includes(tag.name)).map((tag) => ({ id: tag.id }));
			q.tags.connectOrCreate = [...stringTags.map((tag) => ({ where: { name: tag }, create: { name: tag } })), ...foldersTags.map((tag) => ({ where: { name: tag }, create: { name: tag, type: 1 } }))];
			if (toDisconnect) {
				q.tags.disconnect = toDisconnect;
			}
		}
		if (prev!.name !== name) {
		rename(`data/assets/${prev!.name}`, `data/assets/${name}`, () => {});
		await Bun.$`rename ${prev!.name} ${name} data/assets/${name}/*`
		}
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
		const asset = await prisma.asset.update({ where: { id: String(data.id) }, data: q, include: { tags: true } });
		await prisma.assetTag.deleteMany({ where: {assets: { none: {}}}})
		return asset;
	},
	create: async ({ request }: RequestEvent) => {
		const validator = new Validator(validatorConfigWithFile);
		const data = validator.parseData(await request.formData());
		if (!data) {
			return fail(400, validator.status);
		}
		const { file, name, tags, folders, ...rest } = data;
		const stringTags = tags ? (tags as string).split(',') : []
		const foldersTags = folders ? (folders as string).split(',') : []
		try {
			await mkdir(`data/assets/${name}`);
		} catch {
			return fail(400, { message: 'Image already exists' });
		}
		let objTags
		if (stringTags || foldersTags) {
			objTags = await Promise.all([...stringTags.map((tag) => prisma.assetTag.upsert({ where: { name: tag }, update: {}, create: { name: tag } })), ...foldersTags.map((tag) => prisma.assetTag.upsert({ where: { name: tag }, update: {}, create: { name: tag, type: 1 } }))]);
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
			...rest,
		};
		if (objTags) {
			q.tags = {
				connect: objTags.map((tag) => ({ id: tag.id }))
			}
		}
		try {
			await generateThumbnail(out_path, `data/assets/${q.name}/${q.name}.webp`, 270, 270);
		} catch {
			return fail(422, { message: 'Failed to proccess media' });
		}
		return await prisma.asset.create({ data: q, include: { tags: true } });
	},
	delete: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		await prisma.asset.delete({ where: { name: name } });
		await rm(`data/assets/${name}`, { force: true, recursive: true });
		await prisma.assetTag.deleteMany({ where: {assets: { none: {}}}})
	}
} satisfies Actions;
