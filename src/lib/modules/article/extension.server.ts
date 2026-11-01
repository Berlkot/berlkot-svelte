import { Prisma, type BlogPost as BlogPostModel } from '#prisma-generated/client.js';
import { assignPermissionQuery } from '#lib/server/context/auth.js';
import { Asset } from '#modules/asset/model.server.js';
import { ARTICLE_HERO_RESOLUTION, ARTICLE_PREVIEW_RESOLUTION } from './constants';
import type { Flatten, Override } from '#lib/utils/type-helpers.js';

export type BlogPostWithRelations = Prisma.BlogPostGetPayload<{
	include: {
		tags: true;
		heroImage: true;
		content: true;
	};
}>;

export type BlogPostInput = Flatten<
	Override<
		Partial<Omit<BlogPostModel, 'id' | 'createdAt' | 'updatedAt'>>,
		{
			name: string;
			title: string;
			content?: string;
			tags?: string[];
			heroImage?: string | null;
		}
	>
>;

export const articleExtension = Prisma.defineExtension((client) => {
	async function generateBlogThumbnails(assetId: string | null) {
		if (!assetId) return;
		const asset = await Asset.newFrom({ id: assetId });
		if (asset && asset.generateThumbnail) {
			await asset.generateThumbnail(
				ARTICLE_PREVIEW_RESOLUTION.width,
				ARTICLE_PREVIEW_RESOLUTION.height
			);
			await asset.generateThumbnail(ARTICLE_HERO_RESOLUTION.width, ARTICLE_HERO_RESOLUTION.height);
		}
	}
	async function removeBlogThumbnails(assetId: string | null) {
		if (!assetId) return;
		const usageCount = await client.blogPost.count({
			where: { heroImageId: assetId }
		});
		if (usageCount === 0) {
			const asset = await Asset.newFrom({ id: assetId });
			if (asset && asset.removeThumbnail) {
				await asset.removeThumbnail(
					ARTICLE_PREVIEW_RESOLUTION.width,
					ARTICLE_PREVIEW_RESOLUTION.height
				);
				await asset.removeThumbnail(ARTICLE_HERO_RESOLUTION.width, ARTICLE_HERO_RESOLUTION.height);
			}
		}
	}

	return client.$extends({
		query: {
			blogPost: {
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
				},
				async create({ args, query }) {
					const result = await query(args);
					if (result.heroImageId) {
						await generateBlogThumbnails(result.heroImageId);
					}
					return result;
				},
				async update({ args, query }) {
					const oldPost = await client.blogPost.findUnique({
						where: args.where,
						select: { heroImageId: true }
					});
					const result = await query(args);
					if (result.heroImageId !== oldPost?.heroImageId) {
						if (result.heroImageId) await generateBlogThumbnails(result.heroImageId);
						if (oldPost?.heroImageId) await removeBlogThumbnails(oldPost.heroImageId);
					}
					return result;
				},
				async delete({ args, query }) {
					const post = await client.blogPost.findUnique({
						where: args.where,
						select: { heroImageId: true }
					});
					const result = await query(args);
					if (post?.heroImageId) {
						await removeBlogThumbnails(post.heroImageId);
					}
					return result;
				}
			}
		},
		model: {
			blogPost: {
				async getPost(name: string): Promise<BlogPostWithRelations | null> {
					return client.blogPost.findUnique({
						where: { name },
						include: {
							tags: true,
							heroImage: true,
							content: true
						}
					}) as Promise<BlogPostWithRelations | null>;
				},

				async getPosts(
					args: Omit<Prisma.BlogPostFindManyArgs, 'include'> = {}
				): Promise<BlogPostWithRelations[]> {
					return client.blogPost.findMany({
						...args,
						include: {
							tags: true,
							heroImage: true,
							content: true
						}
					}) as Promise<BlogPostWithRelations[]>;
				},

				async createPost(data: BlogPostInput) {
					const { content, tags, heroImage, heroImageId, ...rest } = data;
					const contentRecord = await client.content.create({
						data: { markdown: content || '' }
					});
					let heroImageConnect: Prisma.AssetCreateNestedOneWithoutPostsInput | undefined =
						undefined;
					if (heroImage) {
						const dbAsset = await client.asset.findUnique({
							where: { name: heroImage }
						});
						if (dbAsset) {
							heroImageConnect = { connect: { id: dbAsset.id } };
						}
					}
					const created = await client.blogPost.create({
						data: {
							...rest,
							content: { connect: { id: contentRecord.id } },
							heroImage: heroImageConnect,
							tags: tags
								? {
										connectOrCreate: tags.map((t) => ({
											where: { name: t },
											create: { name: t }
										}))
									}
								: undefined
						},
						include: {
							tags: true,
							heroImage: true,
							content: true
						}
					});

					return created;
				},

				async updatePost(id: string, data: Partial<BlogPostInput>) {
					const { content, tags, heroImage, heroImageId, ...rest } = data;
					const prev = await client.blogPost.findUniqueOrThrow({
						where: { id },
						include: {
							tags: true,
							heroImage: true,
							content: true
						}
					});

					const updateData: Prisma.BlogPostUpdateInput = { ...rest };
					if (content !== undefined) {
						if (prev.content) {
							await client.content.update({
								where: { id: prev.content.id },
								data: { markdown: content }
							});
						} else {
							await client.content.create({
								data: {
									markdown: content,
									blogPost: { connect: { id } }
								}
							});
						}
					}
					if (heroImage !== undefined) {
						if (heroImage) {
							const dbAsset = await client.asset.findUnique({
								where: { name: heroImage }
							});
							if (dbAsset) {
								updateData.heroImage = { connect: { id: dbAsset.id } };
							}
						} else {
							updateData.heroImage = { disconnect: true };
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
					const updated = await client.blogPost.update({
						where: { id },
						data: updateData,
						include: {
							tags: true,
							heroImage: true,
							content: true
						}
					});
					await client.blogPostTag.deleteMany({
						where: { posts: { none: {} } }
					});
					return updated;
				},

				async deletePost(name: string) {
					const post = await client.blogPost.findUnique({
						where: { name },
						select: { id: true }
					});
					if (!post) return null;
					await client.blogPost.delete({ where: { id: post.id } });
					await client.blogPostTag.deleteMany({
						where: { posts: { none: {} } }
					});
					return post;
				}
			}
		}
	});
});
