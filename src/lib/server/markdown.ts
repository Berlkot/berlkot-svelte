import { getDimensions } from '$lib/server/image-tools';
import { marked } from 'marked';
import path, { basename, extname } from 'path';

const renderer = new marked.Renderer();

renderer.image = function ({href, title, text}) {
	const [url, width, height] = href.split('?');
	if (!width || !height)
		return `<img class="blog_img" src="/${url}" alt="${text}" title="${title}">`;
	return `<img class="blog_img" src="/${url}" alt="${text}" width="${width}" height="${height}" title="${title}">`;
};

renderer.paragraph = function (tokens) {
	const text = this.parser.parseInline(tokens.tokens)
	if (text.startsWith('<img')) return text;
	else return '<p>' + text + '</p>';
};
renderer.link = function ({href, title, tokens}) {
	const text = this.parser.parseInline(tokens)
	if (href.startsWith("http")) 
		return `<a target="_blank" class="link external" href="${href}" ${title ? 'title="' + title +'"': ""}>${text}</a>`
	return `<a class="link" href="${href}" ${title ? 'title="' + title +'"': ""}>${text}</a>`
}

async function walkTokens(token) {
	if (token.type === 'image' && path.basename(token.href) === token.href) {
		const img_name = token.href;
		const img_path = `data/assets/${basename(token.href, extname(token.href))}/${token.href}`;
		// renderer is not async so ... stings. what the fuck
		// don't put / here. For some unknown reason it gets stripped
		try {
			const { width, height } = await getDimensions(img_path);
			token.href = `asset/${img_name}?${width}?${height}`;
		} catch {
			token.href = `asset/${img_name}?${0}?${0}`;
		}
	}
}

marked.use({ walkTokens, renderer, async: true });

export async function renderMarkdown(content: string): Promise<string> {
	return await marked.parse(content);
}
