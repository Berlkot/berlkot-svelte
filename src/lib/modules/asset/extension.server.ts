import { assignPermissionQuery } from '$lib/server/context/auth';
import { Prisma } from '$prisma-generated/client';

export const assetExtension = Prisma.defineExtension((client) => {
	return client.$extends({
		query: {
			asset: {
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
		}
	});
});
