import type { RequestEvent } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import prisma from '#modules/database/prisma.server.js';
import { Validator, type FieldConfig } from '#modules/forms/form-validator.js';

export async function load() {
	const posts = await prisma.blogPost.getPosts();
	return { posts };
}

const validatorConfig: { [key: string]: FieldConfig } = {
	id: ['string'],
	name: ['string', 'reqired'],
	title: ['string', 'reqired'],
	author: ['string'],
	description: ['string'],
	content: ['string'],
	createdAt: ['date'],
	visibility: ['string', 'enum:ADMIN:PUBLIC:SUB_ONLY'],
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

		const stringTags = data.tags ? (data.tags as string).split(',') : undefined;
		const { tags, ...rest } = data;

		await prisma.blogPost.createPost({
			...rest,
			tags: stringTags
		} as any);

		return { success: true };
	},
	edit: async ({ request }: RequestEvent) => {
		const validator = new Validator(validatorConfig);
		const data = validator.parseData(await request.formData());
		if (!data) {
			return fail(400, validator.status);
		}

		const stringTags = data.tags ? (data.tags as string).split(',') : undefined;
		const { id, tags, ...rest } = data;

		await prisma.blogPost.updatePost(String(id), {
			...rest,
			tags: stringTags
		} as any);

		return { success: true };
	},
	delete: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		await prisma.blogPost.deletePost(name);
	}
};
