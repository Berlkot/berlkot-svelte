// TODO: Add comments
import {
	Prisma,
	type GalleryPost as GalleryPostModel,
	type GalleryFolder as GalleryFolderModel
} from '#prisma-generated/client.js';
import { assignPermissionQuery } from '#lib/server/context/auth.js';
import type { Flatten, Override } from '#lib/utils/type-helpers.js';
import { Asset } from '#modules/asset/model.server.js';
import { GALLERY_CARD_RESOLUTION } from './constants';

export type GalleryPostInput = Flatten<
	Override<
		Partial<Omit<GalleryPostModel, 'id' | 'creationDate' | 'updatedAt' | 'effects'>>,
		{
			name: string;
			largeDescription?: string;
			tags?: string[];
			folders?: string[];
			assets?: string[];
			effects?: object;
		}
	>
>;

export type GalleryFolderWithHero = Prisma.GalleryFolderGetPayload<{
	include: { heroImage: true };
}>;

export type GalleryFolderInput = Flatten<
	Override<
		Partial<Omit<GalleryFolderModel, 'id' | 'heroImageId'>>,
		{
			name: string;
			heroImage?: string | null; // asset name string
		}
	>
>;

export type GalleryPostWithRelations = Prisma.GalleryPostGetPayload<{
	include: {
		tags: true;
		folders: true;
		assets: {
			include: { asset: true };
		};
		largeDescription: true;
	};
}>;

export const galleryExtension = Prisma.defineExtension((client) => {
	async function generateGalleryPostThumbnail(assetId: string) {
		const asset = await Asset.newFrom({ id: assetId });
		if (asset) {
			await asset.generateThumbnail(GALLERY_CARD_RESOLUTION.width, GALLERY_CARD_RESOLUTION.height);
		}
	}
	async function removeGalleryPostThumbnail(assetId: string, assetName: string) {
		const usageCount = await client.galleryAsset.count({
			where: {
				assetId,
				order: 0
			}
		});
		if (usageCount === 0) {
			const asset = await Asset.newFrom({ name: assetName });
			if (asset) {
				await asset.removeThumbnail(270, 270);
			}
		}
	}

	async function generateFolderThumbnail(assetId: string, width: number, height: number) {
		const asset = await Asset.newFrom({ id: assetId });
		if (asset) {
			await asset.generateThumbnail(width * 270, height * 270);
		}
	}
	async function removeFolderThumbnail(
		assetId: string,
		assetName: string,
		width: number,
		height: number
	) {
		const usageCount = await client.galleryFolder.count({
			where: {
				heroImageId: assetId,
				width,
				height
			}
		});
		if (usageCount === 0) {
			const asset = await Asset.newFrom({ name: assetName });
			if (asset) {
				await asset.removeThumbnail(width * 270, height * 270);
			}
		}
	}

	return client.$extends({
		query: {
			galleryPost: {
				async findUnique({ args, query }) {
					return query(assignPermissionQuery(args));
				},
				async findUniqueOrThrow({ args, query }) {
					return query(assignPermissionQuery(args));
				},
				async findFirst({ args, query }) {
					return query(assignPermissionQuery(args));
				},
				async findMany({ args, query }) {
					return query(assignPermissionQuery(args));
				},
				async findFirstOrThrow({ args, query }) {
					return query(assignPermissionQuery(args));
				}
			}
		},
		model: {
			galleryPost: {
				async getPost(name: string): Promise<GalleryPostWithRelations | null> {
					return Prisma.getExtensionContext(this).findUnique({
						where: { name },
						include: {
							tags: true,
							folders: true,
							assets: {
								include: { asset: true },
								orderBy: { order: 'asc' }
							},
							largeDescription: true
						}
					}) as Promise<GalleryPostWithRelations | null>;
				},

				async getPosts(
					args: Omit<Prisma.GalleryPostFindManyArgs, 'include'> = {}
				): Promise<GalleryPostWithRelations[]> {
					return Prisma.getExtensionContext(this).findMany({
						...args,
						include: {
							tags: true,
							folders: true,
							assets: {
								include: { asset: true },
								orderBy: { order: 'asc' }
							},
							largeDescription: true
						}
					}) as Promise<GalleryPostWithRelations[]>;
				},

				async createPost(data: GalleryPostInput) {
					const { assets, tags, folders, largeDescription, ...rest } = data;
					const content = await client.content.create({
						data: { markdown: largeDescription || '' }
					});
					let galleryAssetData: Prisma.GalleryAssetCreateWithoutGalleryPostInput[] = [];
					if (assets && assets.length > 0) {
						const dbAssets = await client.asset.findMany({
							where: { name: { in: assets } },
							select: { id: true, name: true }
						});
						const assetNameToId = new Map(dbAssets.map((a) => [a.name, a.id]));
						galleryAssetData = assets
							.map((name, index) => {
								const id = assetNameToId.get(name);
								return id ? { asset: { connect: { id } }, order: index } : null;
							})
							.filter(Boolean) as Prisma.GalleryAssetCreateWithoutGalleryPostInput[];
					}
					const created = await client.galleryPost.create({
						data: {
							...rest,
							largeDescription: { connect: { id: content.id } },
							tags: tags
								? {
										connectOrCreate: tags.map((t) => ({
											where: { name: t },
											create: { name: t }
										}))
									}
								: undefined,
							folders: folders
								? {
										connectOrCreate: folders.map((f) => ({
											where: { name: f },
											create: { name: f }
										}))
									}
								: undefined,
							assets: galleryAssetData.length > 0 ? { create: galleryAssetData } : undefined
						},
						include: {
							tags: true,
							folders: true,
							assets: { include: { asset: true }, orderBy: { order: 'asc' } }
						}
					});

					const firstAsset = created.assets.find((ga) => ga.order === 0);
					if (firstAsset) {
						await generateGalleryPostThumbnail(firstAsset.assetId);
					}

					return created;
				},

				async updatePost(id: string, data: Partial<GalleryPostInput>) {
					const { assets, tags, folders, largeDescription, ...rest } = data;
					const prev = await client.galleryPost.findUniqueOrThrow({
						where: { id },
						include: {
							tags: true,
							folders: true,
							assets: { include: { asset: true } },
							largeDescription: true
						}
					});

					const oldFirstAsset = prev.assets.find((ga) => ga.order === 0);

					const updateData: Prisma.GalleryPostUpdateInput = { ...rest };
					if (largeDescription !== undefined) {
						if (prev.largeDescription) {
							await client.content.update({
								where: { id: prev.largeDescription.id },
								data: { markdown: largeDescription }
							});
						} else {
							await client.content.create({
								data: {
									markdown: largeDescription,
									galleryPost: { connect: { id } }
								}
							});
						}
					}
					if (tags !== undefined) {
						const toDisconnect = prev.tags
							.filter((t) => !tags.includes(t.name))
							.map((t) => ({ id: t.id }));
						updateData.tags = {
							connectOrCreate: tags.map((t) => ({
								where: { name: t },
								create: { name: t }
							})),
							disconnect: toDisconnect.length > 0 ? toDisconnect : undefined
						};
					}
					if (folders !== undefined) {
						const toDisconnect = prev.folders
							.filter((f) => !folders.includes(f.name))
							.map((f) => ({ id: f.id }));
						updateData.folders = {
							connectOrCreate: folders.map((f) => ({
								where: { name: f },
								create: { name: f }
							})),
							disconnect: toDisconnect.length > 0 ? toDisconnect : undefined
						};
					}
					if (assets !== undefined) {
						const dbAssets = await client.asset.findMany({
							where: { name: { in: assets } },
							select: { id: true, name: true }
						});
						const assetNameToId = new Map(dbAssets.map((a) => [a.name, a.id]));
						const operations: Prisma.GalleryAssetUpdateManyWithoutGalleryPostNestedInput = {};
						const createOps: Prisma.GalleryAssetCreateWithoutGalleryPostInput[] = [];
						const updateOps: {
							where: Prisma.GalleryAssetWhereUniqueInput;
							data: Prisma.GalleryAssetUpdateWithoutGalleryPostInput;
						}[] = [];

						for (const [index, name] of assets.entries()) {
							const existing = prev.assets.find((ga) => ga.asset.name === name);
							if (existing) {
								if (existing.order !== index) {
									updateOps.push({
										where: { galleryId_assetId: { galleryId: id, assetId: existing.assetId } },
										data: { order: index }
									});
								}
							} else {
								const assetId = assetNameToId.get(name);
								if (assetId) {
									createOps.push({ asset: { connect: { id: assetId } }, order: index });
								}
							}
						}

						const remaingIds = prev.assets
							.filter((ga) => !assets.includes(ga.asset.name))
							.map((ga) => ga.assetId);

						if (createOps.length > 0) operations.create = createOps;
						if (updateOps.length > 0) operations.update = updateOps;
						if (remaingIds.length > 0) {
							operations.deleteMany = {
								assetId: { in: remaingIds }
							};
						}
						updateData.assets = operations;
					}

					const updated = await client.galleryPost.update({
						where: { id },
						data: updateData,
						include: {
							tags: true,
							folders: true,
							assets: { include: { asset: true }, orderBy: { order: 'asc' } }
						}
					});
					await client.galleryTag.deleteMany({
						where: { galleryPosts: { none: {} } }
					});
					const newFirstAsset = updated.assets.find((ga) => ga.order === 0);
					if (newFirstAsset?.assetId !== oldFirstAsset?.assetId) {
						if (newFirstAsset) {
							await generateGalleryPostThumbnail(newFirstAsset.assetId);
						}
						if (oldFirstAsset) {
							await removeGalleryPostThumbnail(oldFirstAsset.assetId, oldFirstAsset.asset.name);
						}
					} else if (newFirstAsset && assets !== undefined) {
						await generateGalleryPostThumbnail(newFirstAsset.assetId);
					}
					return updated;
				},

				async deletePost(name: string) {
					const post = await client.galleryPost.findUnique({
						where: { name },
						include: { assets: { include: { asset: true }, orderBy: { order: 'asc' } } }
					});
					if (!post) return null;
					const firstAsset = post.assets.find((ga) => ga.order === 0);
					await client.galleryPost.delete({ where: { id: post.id } });
					await client.galleryTag.deleteMany({
						where: { galleryPosts: { none: {} } }
					});
					if (firstAsset) {
						await removeGalleryPostThumbnail(firstAsset.assetId, firstAsset.asset.name);
					}
					return post;
				}
			},
			galleryFolder: {
				async getFolder(name: string): Promise<GalleryFolderWithHero | null> {
					return client.galleryFolder.findUnique({
						where: { name },
						include: { heroImage: true }
					}) as Promise<GalleryFolderWithHero | null>;
				},

				async getFolders(
					args: Omit<Prisma.GalleryFolderFindManyArgs, 'include'> = {}
				): Promise<GalleryFolderWithHero[]> {
					return client.galleryFolder.findMany({
						...args,
						include: { heroImage: true }
					}) as unknown as Promise<GalleryFolderWithHero[]>;
				},

				async createFolder(data: GalleryFolderInput): Promise<GalleryFolderWithHero> {
					const { heroImage, ...rest } = data;
					let heroImageConnect: Prisma.AssetCreateNestedOneWithoutHeroInFolderInput | undefined =
						undefined;
					if (heroImage) {
						const dbAsset = await client.asset.findUnique({
							where: { name: heroImage }
						});
						if (dbAsset) {
							heroImageConnect = { connect: { id: dbAsset.id } };
						}
					}
					const created = (await client.galleryFolder.create({
						data: {
							...rest,
							heroImage: heroImageConnect
						},
						include: { heroImage: true }
					})) as unknown as GalleryFolderWithHero;
					await generateFolderThumbnail(created.heroImage!.id, created.width, created.height);
					return created;
				},

				async updateFolder(
					id: string,
					data: Partial<GalleryFolderInput>
				): Promise<GalleryFolderWithHero> {
					const prev = await client.galleryFolder.findUniqueOrThrow({
						where: { id },
						include: { heroImage: true }
					});

					const { heroImage, ...rest } = data;
					let heroImageUpdate: Prisma.AssetUpdateOneWithoutHeroInFolderNestedInput | undefined =
						undefined;
					if (heroImage !== undefined) {
						if (heroImage) {
							const dbAsset = await client.asset.findUnique({
								where: { name: heroImage }
							});
							if (dbAsset) {
								heroImageUpdate = { connect: { id: dbAsset.id } };
							}
						} else {
							heroImageUpdate = { disconnect: true };
						}
					}
					const updated = (await client.galleryFolder.update({
						where: { id },
						data: {
							...rest,
							heroImage: heroImageUpdate
						},
						include: { heroImage: true }
					})) as unknown as GalleryFolderWithHero;

					const heroChanged = updated.heroImageId !== prev.heroImageId;
					const sizeChanged = updated.width !== prev.width || updated.height !== prev.height;

					if (heroChanged || sizeChanged) {
						if (updated.heroImage) {
							await generateFolderThumbnail(updated.heroImage.id, updated.width, updated.height);
						}
						if (prev.heroImage) {
							await removeFolderThumbnail(
								prev.heroImageId!,
								prev.heroImage.name,
								prev.width,
								prev.height
							);
						}
					}

					return updated;
				},

				async deleteFolder(name: string) {
					const folder = await client.galleryFolder.findUnique({
						where: { name },
						include: { heroImage: true }
					});
					if (!folder) return null;

					const result = await client.galleryFolder.delete({
						where: { name }
					});

					if (folder.heroImage) {
						await removeFolderThumbnail(
							folder.heroImageId!,
							folder.heroImage.name,
							folder.width,
							folder.height
						);
					}

					return result;
				}
			}
		}
	});
});
