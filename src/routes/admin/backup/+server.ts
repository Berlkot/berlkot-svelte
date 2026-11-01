import { DATABASE_URL } from '$app/env/private';
import { MEDIA_BASE_PATH } from '#modules/asset/service.server.js';
import { Archive, Glob } from 'bun';
const DATABASE_PATH = DATABASE_URL.split(':')[1];
export async function GET() {
	const date = new Date();
	const files: Record<string, ArrayBuffer> = {};
	files[DATABASE_PATH] = await Bun.file(DATABASE_PATH).arrayBuffer();
	for await (const path of new Glob(`${MEDIA_BASE_PATH}/**`).scan('.')) {
		files[path] = await Bun.file(path).arrayBuffer();
	}
	return new Response(await new Archive(files, { compress: 'gzip' }).blob(), {
		headers: {
			'Content-Disposition': `attachment; filename="backup-${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.tar.gz"`
		}
	});
}
