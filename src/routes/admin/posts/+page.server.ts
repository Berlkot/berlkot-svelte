import type { RequestEvent } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { Validator, type FieldConfig } from '$lib/form-validator';
import type { Prisma } from '@prisma/client';
import { generateThumbnail } from '$lib/server/image-tools';

export async function load() {
	return { posts: await prisma.post.findMany() };
}

const validatorConfig: { [key: string]: FieldConfig } = {
	id: ['string'],
	name: ['string', 'reqired'],
	title: ['string', 'reqired'],
	author: ['string'],
	description: ['string'],
	content: ['string'],
	createdAt: ['date'],
	visibility: ['int', 'range:-1:2'],
	tags: ['string'],
	thumbnail: ['string']
};

export const actions = {
	create: async ({ request }: RequestEvent) => {
		const validator = new Validator(validatorConfig);
		const data = validator.parseData(await request.formData());
		if (!data) {
			return fail(400, validator.status);
		}
		
		await prisma.post.create({ data: data as unknown as Prisma.PostCreateInput });
		return { success: true };
	},
	edit: async ({ request }: RequestEvent) => {
		const validator = new Validator(validatorConfig);
		const data = validator.parseData(await request.formData());
		if (!data) {
			return fail(400, validator.status);
		}
		
		const stringTags = data.tags ? (data.tags as string).split(',') : undefined
		const prev = await prisma.post.findUnique({ where: { id: String(data.id) }, include: { tags: true } });
		if (data.thumbnail) {
			
			const thumbnail = (await prisma.asset.findUnique({ where: { name: String(data.thumbnail) } }))!
			data.thumbnail = {};
			data.thumbnail.connect = { id: thumbnail.id }
			await generateThumbnail(`data/assets/${thumbnail.name}/${thumbnail.name}.webp`, `data/assets/${thumbnail.name}/${thumbnail.name}.webp`, 465, 260);
			await generateThumbnail(`data/assets/${thumbnail.name}/${thumbnail.name}.webp`, `data/assets/${thumbnail.name}/${thumbnail.name}.webp`, 1280, 720);
		}

		const q: Prisma.PostUpdateInput = {
			...data
		}
		if (stringTags) {
			q.tags = {}
			const toDisconnect = prev!.tags.filter((tag) => !stringTags.includes(tag.name)).map((tag) => ({ id: tag.id }));
			q.tags.connectOrCreate = stringTags.map((tag) => ({ where: { name: tag }, create: { name: tag } }));
			if (toDisconnect) {
				q.tags.disconnect = toDisconnect;
			}
		}
		await prisma.post.update({
			where: { id: String(data.id) },
			data: q
		});
		await prisma.postTag.deleteMany({ where: {posts: { none: {}}}})
		return { success: true };
	},
	delete: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		await prisma.post.delete({ where: { name: name } });
	}
};
