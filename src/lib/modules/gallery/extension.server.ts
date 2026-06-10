import {
	Prisma,
	type GalleryPost as GalleryPostModel,
	type GalleryFolder as GalleryFolderModel
} from '$prisma-generated/client';
import { assignPermissionQuery } from '$lib/server/context/auth';
import type { Flatten, Override } from '$lib/utils/type-helpers';

export type GalleryPostInput = Flatten<
	Override<
		Partial<Omit<GalleryPostModel, 'id' | 'creationDate' | 'updatedAt' | 'effects'>>,
		{
			name: string;
			largeDescription?: string; // markdown content
			tags?: string[];
			folders?: string[];
			assets?: string[]; // array of asset names in order
			effects?: any;
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
	return client.$extends({
		query: {
			galleryPost: {
				async findUnique({ args, query }) {
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
				/**
				 * Fetch a single gallery post by name with tags, folders, largeDescription, and ordered assets.
				 */
				async getPost(name: string): Promise<GalleryPostWithRelations | null> {
					return client.galleryPost.findUnique({
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

				/**
				 * Fetch multiple gallery posts with tags, folders, and ordered assets.
				 */
				async getPosts(
					args: Omit<Prisma.GalleryPostFindManyArgs, 'include'> = {}
				): Promise<GalleryPostWithRelations[]> {
					return client.galleryPost.findMany({
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

				/**
				 * Creates a new GalleryPost along with its Content, tag connections, folder connections, and ordered assets.
				 */
				async createPost(data: GalleryPostInput) {
					const { assets, tags, folders, largeDescription, ...rest } = data;

					// 1. Create content for largeDescription (required relation)
					const content = await client.content.create({
						data: { markdown: largeDescription || '' }
					});

					// 2. Resolve asset names to IDs and prepare GalleryAsset connections
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

					// 3. Create the post
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

					return created;
				},

				/**
				 * Updates a GalleryPost and diff-syncs its relations (tags, folders, assets and order) and Content.
				 */
				async updatePost(id: string, data: Partial<GalleryPostInput>) {
					const { assets, tags, folders, largeDescription, ...rest } = data;

					// Fetch previous state to perform diffs
					const prev = await client.galleryPost.findUniqueOrThrow({
						where: { id },
						include: {
							tags: true,
							folders: true,
							assets: { include: { asset: true } },
							largeDescription: true
						}
					});

					const updateData: Prisma.GalleryPostUpdateInput = { ...rest };

					// 1. Update largeDescription content if provided
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

					// 2. Diff and update tags
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

					// 3. Diff and update folders
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

					// 4. Diff and update assets (GalleryAsset relations)
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

					// Cleanup orphan gallery tags
					await client.galleryTag.deleteMany({
						where: { galleryPosts: { none: {} } }
					});

					return updated;
				},

				/**
				 * Deletes a GalleryPost, cascading to its associated Content and cleaning up tags.
				 */
				async deletePost(name: string) {
					const post = await client.galleryPost.findUnique({
						where: { name },
						select: { id: true }
					});
					if (!post) return null;

					// Delete the post
					await client.galleryPost.delete({ where: { id: post.id } });

					// Cleanup orphan tags
					await client.galleryTag.deleteMany({
						where: { galleryPosts: { none: {} } }
					});

					return post;
				}
			},
			galleryFolder: {
				/**
				 * Fetch a single gallery folder by name with hero image.
				 */
				async getFolder(name: string): Promise<GalleryFolderWithHero | null> {
					return client.galleryFolder.findUnique({
						where: { name },
						include: { heroImage: true }
					}) as Promise<GalleryFolderWithHero | null>;
				},

				/**
				 * Fetch all gallery folders with hero images.
				 */
				async getFolders(
					args: Omit<Prisma.GalleryFolderFindManyArgs, 'include'> = {}
				): Promise<GalleryFolderWithHero[]> {
					return client.galleryFolder.findMany({
						...args,
						include: { heroImage: true }
					}) as unknown as Promise<GalleryFolderWithHero[]>;
				},

				/**
				 * Create a gallery folder.
				 */
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
					return client.galleryFolder.create({
						data: {
							...rest,
							heroImage: heroImageConnect
						},
						include: { heroImage: true }
					}) as unknown as Promise<GalleryFolderWithHero>;
				},

				/**
				 * Update a gallery folder.
				 */
				async updateFolder(
					id: string,
					data: Partial<GalleryFolderInput>
				): Promise<GalleryFolderWithHero> {
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
					return client.galleryFolder.update({
						where: { id },
						data: {
							...rest,
							heroImage: heroImageUpdate
						},
						include: { heroImage: true }
					}) as unknown as Promise<GalleryFolderWithHero>;
				},

				/**
				 * Delete a gallery folder.
				 */
				async deleteFolder(name: string) {
					return client.galleryFolder.delete({
						where: { name }
					});
				}
			}
		}
	});
});
