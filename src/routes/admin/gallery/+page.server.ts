// FIXME
import type { RequestEvent } from '@sveltejs/kit';
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { Prisma } from '@prisma/client';
import { Validator, type FieldConfig } from '$lib/form-validator';

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
		galleryPosts: await prisma.galleryPost.findMany({
			include: {
				tags: true,
				folders: true,
				assets: {
					include: {
						asset: true
					},
					orderBy: {
						order: 'asc'
					}
				}
			}
		}),
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
		const { assets, name, tags, folders, ...rest } = data;
		const stringTags = tags ? (tags as string).split(',') : [];
		const stringFolders = folders ? (folders as string).split(',') : [];
		const stringAssets = (assets as string).split(',');
		const q: Prisma.GalleryPostUpdateInput = {
			name: String(name),
			...rest
		};
		const prev = await prisma.galleryPost.findUnique({
			where: { id: String(data.id) },
			include: {
				tags: true,
				folders: true,
				assets: { include: { asset: true }, orderBy: { order: 'asc' } }
			}
		});
		const allAssets = await prisma.asset.findMany();

		if (stringTags) {
			q.tags = {};
			const toDisconnect = prev!.tags
				.filter((tag) => !stringTags.includes(tag.name))
				.map((tag) => ({ id: tag.id }));
			q.tags.connectOrCreate = [
				...stringTags.map((tag) => ({ where: { name: tag }, create: { name: tag } }))
			];
			if (toDisconnect) {
				q.tags.disconnect = toDisconnect;
			}
		}
		if (stringFolders) {
			q.folders = {};
			const toDisconnect = prev!.folders
				.filter((folder) => !stringFolders.includes(folder.name))
				.map((folder) => ({ id: folder.id }));
			q.folders.connectOrCreate = [
				...stringFolders.map((folder) => ({ where: { name: folder }, create: { name: folder } }))
			];
			if (toDisconnect) {
				q.folders.disconnect = toDisconnect;
			}
		}
		if (stringAssets) {
			q.assets = {};
			q.assets.update = [];
			q.assets.create = [];
			for (const [index, asset] of stringAssets.entries()) {
				const created = prev!.assets.find((el) => el.asset.name === asset);
				if (created) {
				  if (created.order === index) continue;
					q.assets.update.push({
						where: {
							galleryId_assetId: { assetId: created.assetId, galleryId: created.galleryId }
						},
						data: { order: index }
					});
				} else {
					const id = allAssets.find((el) => el.name === asset);
					q.assets.create.push({
						asset: { connect: { id: id!.id } },
						order: index
					});
				}
			}
			const remaingIds = prev!.assets
				.filter((asset) => !stringAssets.includes(asset.asset.name))
				.map((asset) => asset.asset.id);
			q.assets.deleteMany = {
				assetId: {
					in: remaingIds
				}
			};
		}
		const galleryPost = await prisma.galleryPost.update({
			where: { id: String(data.id) },
			data: q,
			include: { tags: true, assets: {include: {asset: true}, orderBy: {order: 'asc'}}, folders: true }
		});
		await prisma.galleryTag.deleteMany({ where: { galleryPosts: { none: {} } } });
		return galleryPost;
	},
	create: async ({ request }: RequestEvent) => {
		const validator = new Validator(validatorConfigNew);
		const data = validator.parseData(await request.formData());
		if (!data) {
			return fail(400, validator.status);
		}
		const { assets, name, tags, folders, ...rest } = data;
		const stringTags = tags ? (tags as string).split(',') : [];
		const stringFolders = folders ? (folders as string).split(',') : [];
		const stringAssets = (assets as string).split(',');
		let objTags;
		if (stringTags) {
			objTags = await Promise.all([
				...stringTags.map((tag) =>
					prisma.galleryTag.upsert({ where: { name: tag }, update: {}, create: { name: tag } })
				)
			]);
		}
		let objFolders;
		if (stringFolders) {
			objFolders = await Promise.all([
  			...stringFolders.map((folder) =>
  				prisma.galleryFolder.upsert({ where: { name: folder }, update: {}, create: { name: folder } })
				)
			]);
		}
		let objAssets;
		if (stringAssets) {
			objAssets = await Promise.all([
				...stringAssets.map((asset) =>
					prisma.asset.findUnique({ where: { name: asset }})
				)
			]);
		}
		const q: Prisma.GalleryPostCreateInput = {
			name: String(name),
			...rest
		};
		if (objTags) {
			q.tags = {
				connect: objTags.map((tag) => ({ id: tag.id }))
			};
		}
		if (objFolders) {
			q.folders = {
				connect: objFolders.map((folder) => ({ id: folder.id }))
			};
		}
		if (objAssets) {
			q.assets = {
				create: objAssets.map((asset, index) => ({
						asset: { connect: { id: asset.id } },
						order: index
					}))
				
			};
		}
		console.log(q)
		return await prisma.galleryPost.create({ data: q, include: { tags: true, assets: {include: {asset: true}, orderBy: {order: 'asc'}}, folders: true } });
	},
	delete: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		await prisma.galleryPost.delete({ where: { name: name } });
		await prisma.galleryTag.deleteMany({ where: { galleryPosts: { none: {} } } });
	}
} satisfies Actions;
