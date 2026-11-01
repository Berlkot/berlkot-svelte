import { PrismaClient } from '#prisma-generated/client.js';
import { DATABASE_URL } from '$app/env/private';
import { PrismaBunSqlite } from 'prisma-adapter-bun-sqlite';
import { articleExtension } from '#modules/article/extension.server.js';
import { assetExtension } from '#modules/asset/extension.server.js';
import { markdownExtension } from '#modules/markdown/extension.server.js';
import { galleryExtension } from '#modules/gallery/extension.server.js';

const adapter = new PrismaBunSqlite({ url: DATABASE_URL });
/* WARN: extentions are order-dependent
         dont you dare put dependent before dependence */
const prisma = new PrismaClient({ adapter })
	.$extends(assetExtension)
	.$extends(markdownExtension)
	.$extends(articleExtension)
	.$extends(galleryExtension);

export default prisma;
