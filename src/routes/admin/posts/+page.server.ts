import type { RequestEvent } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { Validator, type FieldConfig } from '$lib/form-validator';
import type { Prisma } from '@prisma/client';
import { generateThumbnail } from '$lib/server/image-tools';

export async function load() {
	return { posts: await prisma.blogPost.findMany() };
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
	heroImage: ['string']
};

export const actions = {
	create: async ({ request }: RequestEvent) => {
		const validator = new Validator(validatorConfig);
		const data = validator.parseData(await request.formData());
		if (!data) {
			return fail(400, validator.status);
		}

		await prisma.blogPost.create({ data: data as unknown as Prisma.BlogPostCreateInput });
		return { success: true };
	},
	edit: async ({ request }: RequestEvent) => {
		const validator = new Validator(validatorConfig);
		const data = validator.parseData(await request.formData());
		if (!data) {
			return fail(400, validator.status);
		}

		const stringTags = data.tags ? (data.tags as string).split(',') : undefined;
		const prev = await prisma.blogPost.findUnique({
			where: { id: String(data.id) },
			include: { tags: true }
		});
		if (data.heroImage) {
			const heroImage = (await prisma.asset.findUnique({
				where: { name: String(data.heroImage) }
			}))!;
			data.heroImage = {};
			data.heroImage.connect = { id: heroImage.id };
			let end = 'webp';
			if (heroImage.type === 'VIDEO') {
				end = 'mp4';
			}
			await generateThumbnail(
				`data/assets/${heroImage.name}/${heroImage.name}.${end}`,
				`data/assets/${heroImage.name}/${heroImage.name}.webp`,
				465,
				260
			);
			await generateThumbnail(
				`data/assets/${heroImage.name}/${heroImage.name}.${end}`,
				`data/assets/${heroImage.name}/${heroImage.name}.webp`,
				1280,
				720
			);
		}

		const q: Prisma.BlogPostUpdateInput = {
			...data
		};
		if (stringTags) {
			q.tags = {};
			const toDisconnect = prev!.tags
				.filter((tag) => !stringTags.includes(tag.name))
				.map((tag) => ({ id: tag.id }));
			q.tags.connectOrCreate = stringTags.map((tag) => ({
				where: { name: tag },
				create: { name: tag }
			}));
			if (toDisconnect) {
				q.tags.disconnect = toDisconnect;
			}
		}
		await prisma.blogPost.update({
			where: { id: String(data.id) },
			data: q
		});
		await prisma.blogPostTag.deleteMany({ where: { posts: { none: {} } } });
		return { success: true };
	},
	delete: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		await prisma.blogPost.delete({ where: { name: name } });
	}
};
