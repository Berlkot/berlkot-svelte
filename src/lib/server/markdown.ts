import { getDimensions } from '$lib/server/image-tools';
import { marked } from 'marked';
import path, { basename, extname } from 'path';
import markedAlert from 'marked-alert';
import markedFootnote from 'marked-footnote';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js/lib/common';
import gdscript from './gdscript';

hljs.registerLanguage('gdscript', gdscript);

const renderer = new marked.Renderer();

renderer.image = function ({ href, title, text }) {
	const [url, width, height] = href.split('?');
	if (!width || !height) return `<img src="${url}" alt="${text}" title="${title}">`;
	return `<img class="local-image" src="/${url}" alt="${text}" width="${width}" height="${height}" title="${title}">`;
};

renderer.paragraph = function (tokens) {
	const text = this.parser.parseInline(tokens.tokens);
	if (text.startsWith('<img')) return text;
	else return '<p>' + text + '</p>';
};
renderer.link = function ({ href, title, tokens }) {
	const text = this.parser.parseInline(tokens);
	if (href.startsWith('http'))
		return `<a target="_blank" class="link external" href="${href}" ${title ? 'title="' + title + '"' : ''}>${text}</a>`;
	return `<a class="link" href="${href}" ${title ? 'title="' + title + '"' : ''}>${text}</a>`;
};

renderer.heading = function ({ tokens, depth }) {
	const text = this.parser.parseInline(tokens);
	const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');

	return `
          <h${depth} class="heading-anchor">
            ${text}
            <a name="${escapedText}" class="anchor" href="#${escapedText}">
              <span class="header-link"></span>
            </a>
          </h${depth}>`;
};

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
marked.use(markedAlert());
marked.use(markedFootnote({ headingClass: 'visually-hidden', footnoteDivider: true }));
marked.use(
	markedHighlight({
		emptyLangClass: 'hljs',
		langPrefix: 'hljs language-',
		highlight(code, lang, info) {
			const language = hljs.getLanguage(lang) ? lang : 'plaintext';
			return hljs.highlight(code, { language }).value;
		}
	})
);

export async function renderMarkdown(content: string): Promise<string> {
	return await marked.parse(content);
}
