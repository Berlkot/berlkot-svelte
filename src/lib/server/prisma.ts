// i admit, im a lazy fuck who dont wanna to maintain
// own orm approach based on json metadata
// it just became too clunky
import { PrismaClient } from '@prisma/client';
// import { PrismaBetterSQLite3 } from '@prisma/adapter-better-sqlite3';
import { DATABASE_URL } from '$env/static/private';
// const adapter = new PrismaBetterSQLite3(
//   { url: DATABASE_URL }
// );
const prisma = new PrismaClient(/*{ adapter }*/);

export default prisma;
