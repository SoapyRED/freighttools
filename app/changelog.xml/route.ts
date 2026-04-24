import { NextResponse } from 'next/server';
import { entries } from '@/lib/changelog-data';

export const revalidate = 3600;

const SITE = 'https://www.freightutils.com';

function esc(s: string): string {
  return s.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]!));
}

export async function GET() {
  const items = entries.slice(0, 50).map((e) => {
    const pubDate = new Date(e.isoDate + 'T12:00:00Z').toUTCString();
    const guid = `${SITE}/changelog#${e.isoDate}-${e.title.replace(/\W+/g, '-')}`;
    const link = e.link ? `${SITE}${e.link}` : `${SITE}/changelog`;
    return `    <item>
      <title>[${esc(e.tag)}] ${esc(e.title)}</title>
      <link>${esc(link)}</link>
      <guid isPermaLink="false">${esc(guid)}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${esc(e.tag)}</category>
      <description>${esc(e.desc)}</description>
    </item>`;
  }).join('\n');

  const lastBuild = new Date().toUTCString();
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>FreightUtils Changelog</title>
    <link>${SITE}/changelog</link>
    <atom:link href="${SITE}/changelog.xml" rel="self" type="application/rss+xml"/>
    <description>FreightUtils data updates, new tools, API changes, and MCP releases.</description>
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
