import { NextResponse } from 'next/server';
import { listGuideMeta } from '@/lib/guides';
import { categoryLabel } from '@/lib/guides/types';

export const revalidate = 3600;

const SITE = 'https://www.freightutils.com';

function esc(s: string): string {
	return s.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]!));
}

export async function GET() {
	const guides = await listGuideMeta({ includeDrafts: false });

	const items = guides.slice(0, 50).map((g) => {
		const pubDate = new Date(g.published_date + 'T12:00:00Z').toUTCString();
		const link = `${SITE}/guides/${g.slug}`;
		return `    <item>
      <title>${esc(g.title)}</title>
      <link>${esc(link)}</link>
      <guid isPermaLink="true">${esc(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${esc(categoryLabel(g.category))}</category>
      <description>${esc(g.summary)}</description>
      <author>contact@freightutils.com (${esc(g.author)})</author>
    </item>`;
	}).join('\n');

	const lastBuild = new Date().toUTCString();
	const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>FreightUtils Guides</title>
    <link>${SITE}/guides</link>
    <atom:link href="${SITE}/guides/rss.xml" rel="self" type="application/rss+xml"/>
    <description>Practitioner-written reference for freight operations, compliance, and agent integration.</description>
    <language>en-gb</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>`;

	return new NextResponse(rss, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
			'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
		},
	});
}
