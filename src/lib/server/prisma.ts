import { PrismaClient } from '$prisma-generated/client';
import { DATABASE_URL } from '$env/static/private';
import { PrismaBunSqlite } from "prisma-adapter-bun-sqlite";

const adapter = new PrismaBunSqlite({ url: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export default prisma;
