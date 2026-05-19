import { Prisma } from '$prisma-generated/client';
import { assignPermissionQuery } from '$lib/server/context/auth';
import { Asset } from '$modules/asset/model.server';
import { ARTICLE_HERO_RESOLUTION, ARTICLE_PREVIEW_RESOLUTION } from './constants';

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
		}
	});
});
