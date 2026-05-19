import { Prisma } from '$prisma-generated/client';
import { renderMarkdown } from './render.server';
import { marked } from 'marked';
import { basename, extname } from 'path';

export const markdownExtension = Prisma.defineExtension((client) => {
	function extractAssetNames(markdown: string): string[] {
		const tokens = marked.lexer(markdown);
		const names: string[] = [];
		// i'm still not sure what type to use here
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const walk = (ts: any[]) => {
			for (const t of ts) {
				if (t.type === 'image') {
					const href = t.href;
					if (href && !href.startsWith('http')) {
						if (basename(href) === href) {
							const nameOnly = basename(href, extname(href));
							names.push(nameOnly);
						}
					}
				}
				if (t.tokens) walk(t.tokens);
			}
		};
		walk(tokens);
		return Array.from(new Set(names));
	}

	async function syncAssets(markdown: string, contentId: string) {
		const names = extractAssetNames(markdown);
		if (names.length === 0) return;
		const assets = await client.asset.findMany({
			where: { name: { in: names } }
		});
		await client.content.update({
			where: { id: contentId },
			data: { usedAssets: { set: assets.map((a) => ({ id: a.id })) } }
		});
	}

	return client.$extends({
		query: {
			content: {
				async create({ args, query }) {
					if (args.data.markdown) {
						args.data.html = await renderMarkdown(args.data.markdown);
					}
					const result = await query(args);
					if (args.data.markdown) {
						await syncAssets(args.data.markdown, result.id!);
					}
					return result;
				},
				async update({ args, query }) {
					if (args.data.markdown) {
						args.data.html = await renderMarkdown(args.data.markdown.toString());
					}

					const result = await query(args);

					if (args.data.markdown) {
						await syncAssets(args.data.markdown.toString(), result.id!);
					}
					return result;
				}
			}
		}
	});
});
