import type { RequestEvent } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { Validator, type FieldConfig } from '$lib/form-validator';
import type { Prisma } from '@prisma/client';

export async function load() {
	return { posts: await prisma.post.findMany() };
}

const validatorConfig: { [key: string]: FieldConfig } = {
	name: ['string', 'reqired'],
	title: ['string', 'reqired'],
	author: ['string'],
	description: ['string'],
	content: ['string'],
	createdAt: ['date'],
	visibility: ['int', 'range:-1:2']
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
		await prisma.post.update({
			where: { name: String(data.name) },
			data: data as unknown as Prisma.PostUpdateInput
		});
		return { success: true };
	},
	delete: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		await prisma.post.delete({ where: { name: name } });
	}
};
