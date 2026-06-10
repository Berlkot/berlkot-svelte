import type { RequestEvent } from '@sveltejs/kit';
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import prisma from '$modules/database/prisma.server';
import { Validator, type FieldConfig } from '$modules/forms/form-validator';
import type { GalleryPostInput } from '$modules/gallery/extension.server';

const validatorConfig: { [key: string]: FieldConfig } = {
	id: ['string', 'reqired'],
	name: ['string', 'reqired'],
	title: ['string'],
	author: ['string'],
	contentWarning: ['string'],
	copyright: ['string'],
	smallDescription: ['string'],
	largeDescription: ['string'],
	creationDate: ['date'],
	visibility: ['string', 'enum:ADMIN:PUBLIC:SUB_ONLY'],
	maturity: ['string', 'enum:SFW:QUESTIONABLE:NSFW'],
	tags: ['string'],
	folders: ['string'],
	assets: ['string', 'reqired']
};
const validatorConfigNew = { ...validatorConfig };
delete validatorConfigNew.id;

export async function load() {
	return {
		galleryPosts: await prisma.galleryPost.getPosts(),
		assets: await prisma.asset.findMany()
	};
}

export const actions = {
	edit: async ({ request }: RequestEvent) => {
		const validator = new Validator(validatorConfig);
		const data = validator.parseData(await request.formData());
		if (!data) {
			return fail(400, validator.status);
		}
		const { id, tags, folders, assets, ...rest } = data;
		const postInput = {
			...rest,
			tags: tags ? (tags as string).split(',').filter(Boolean) : [],
			folders: folders ? (folders as string).split(',').filter(Boolean) : [],
			assets: assets ? (assets as string).split(',').filter(Boolean) : []
		};

		return await prisma.galleryPost.updatePost(String(id), postInput);
	},
	create: async ({ request }: RequestEvent) => {
		const validator = new Validator(validatorConfigNew);
		const data = validator.parseData(await request.formData());
		if (!data) {
			return fail(400, validator.status);
		}
		const { tags, folders, assets, ...rest } = data;
		const postInput = {
			...rest,
			tags: tags ? (tags as string).split(',').filter(Boolean) : [],
			folders: folders ? (folders as string).split(',').filter(Boolean) : [],
			assets: assets ? (assets as string).split(',').filter(Boolean) : []
		};

		return await prisma.galleryPost.createPost(postInput as GalleryPostInput);
	},
	delete: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		await prisma.galleryPost.deletePost(name);
	}
} satisfies Actions;
