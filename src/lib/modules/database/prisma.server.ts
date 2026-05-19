import { PrismaClient } from '$prisma-generated/client';
import { DATABASE_URL } from '$env/static/private';
import { PrismaBunSqlite } from 'prisma-adapter-bun-sqlite';
import { articleExtension } from '$modules/article/extension.server';
import { assetExtension } from '$modules/asset/extension.server';
import { markdownExtension } from '$modules/markdown/extension.server';

const adapter = new PrismaBunSqlite({ url: DATABASE_URL });
const prisma = new PrismaClient({ adapter })
	.$extends(assetExtension)
	.$extends(articleExtension)
	.$extends(markdownExtension);

export default prisma;
