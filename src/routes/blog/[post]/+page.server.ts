import prisma from '$modules/database/prisma.server';
import { error, type RequestEvent } from '@sveltejs/kit';

const return_string = 'Blogpost not found!';

export async function load({ params }: RequestEvent) {
	try {
		// fuck me if im wrong about exclamation mark
		const blogPost = await prisma.blogPost.getPost(params.post!);
		if (!blogPost) {
			throw error(404, return_string);
		}

		const contentHtml = blogPost.content?.html ? blogPost.content.html : 'Blogpost is empty';

		const meta = {
			title: `${blogPost.title} | Berlkot`,
			'og:title': `${blogPost.title} | Berlkot`,
			description: blogPost.description,
			'og:description': blogPost.description,
			author: blogPost.author,
			'og:type': 'article'
		};
		if (blogPost.heroImage) {
			meta['og:image'] = `https://berlkot.com/asset/${blogPost.heroImage.name}.webp`;
		}
		return { blogPost: { ...blogPost, content: contentHtml }, meta };
	} catch {
		throw error(404, return_string);
	}
}
