import prisma from '$lib/server/prisma';

export async function GET() {
  const posts = await prisma.blogPost.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: {
      title: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  const body = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>Berlkot Blog</title>
      <description>Some of my thoughts to share with outer world</description>
      <language>en-us</language>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      <link>https://berlkot.com/blog</link>
      <atom:link href="https://berlkot.com/rss/blog.rss" rel="self" type="application/rss+xml" />
      ${posts.map((post) => `
        <item>
          <title>${post.title}</title>
          <description>${post.description}</description>
          <link>https://berlkot.com/blog/${post.name}</link>
          <guid>https://berlkot.com/blog/${post.name}</guid>
          <description>${post.description}</description>
          <pubDate>${post.createdAt}</pubDate>
        </item>
      `).join('')}
    </channel>
  </rss>`
  const headers = {
    'Cache-Control': 'max-age=0, s-maxage=3600',
    'Content-Type': 'application/rss+xml; charset=UTF-8',
  }
  return new Response(body, {headers});
}