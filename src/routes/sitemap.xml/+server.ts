export async function GET() {
	const body = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>https://berlkot.com</loc>
        <lastmod>${new Date().toISOString()}</lastmod>

      </url>
      <url>
        <loc>https://berlkot.com/blog</loc>
      </url>
    </urlset>
    `;
	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml'
		}
	});
}
