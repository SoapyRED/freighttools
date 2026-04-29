import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/app/components/PageHero';
import { listGuideMeta } from '@/lib/guides';
import { categoryDataAttr, categoryHex, categoryLabel, categoryTint, type GuideCategory } from '@/lib/guides/types';

export const revalidate = 3600;

const ogUrl = '/api/og?title=Guides&desc=Practitioner-written+reference+for+freight+operations%2C+compliance%2C+and+agent+integration&badge=GUIDES';

export const metadata: Metadata = {
	title: 'Guides — FreightUtils',
	description:
		'Practitioner-written reference for freight operations, compliance, and agent integration. Authority-grade content from someone who does the job.',
	alternates: {
		canonical: 'https://www.freightutils.com/guides',
		types: { 'application/rss+xml': 'https://www.freightutils.com/guides/rss.xml' },
	},
	openGraph: { images: [{ url: ogUrl, width: 1200, height: 630, alt: 'FreightUtils Guides' }] },
	twitter: { card: 'summary_large_image', images: [ogUrl] },
};

function fmtDate(iso: string): string {
	try {
		return new Date(iso + (iso.length === 10 ? 'T00:00:00Z' : '')).toLocaleDateString('en-GB', {
			day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
		});
	} catch { return iso; }
}

export default async function GuidesHubPage() {
	const guides = await listGuideMeta({ includeDrafts: false });
	const categories = Array.from(new Set(guides.map((g) => g.category))) as GuideCategory[];

	return (
		<>
			<PageHero
				title="Guides"
				subtitle="Practitioner-written reference for freight operations, compliance, and agent integration. Written by someone who does the job."
				category="ref"
				differentiators={['Authority-grade', 'Citable sources', 'Updated when reality changes']}
			/>

			<main data-category="ref" style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px 80px' }}>
				{guides.length === 0 ? (
					<div style={{
						background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 12,
						padding: '48px 32px', textAlign: 'center',
					}}>
						<div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
							Guides coming soon
						</div>
						<p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto 16px', lineHeight: 1.7 }}>
							First articles publish in April 2026. Authority-citation pieces on ADR exemptions, AWB prefix routing, and HS code edge cases. Subscribe to know when they land.
						</p>
						<a href="/guides/rss.xml" style={{
							display: 'inline-block', fontSize: 13, fontWeight: 700, letterSpacing: '0.5px',
							color: 'var(--page-cat, var(--accent))', textDecoration: 'none',
							padding: '6px 14px', border: '1px solid currentColor', borderRadius: 4,
						}}>
							RSS →
						</a>
					</div>
				) : (
					<>
						{categories.length >= 2 && (
							<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
								{categories.map((cat) => (
									<span
										key={cat}
										style={{
											fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 4,
											letterSpacing: '0.5px', textTransform: 'uppercase',
											color: categoryHex(cat), background: categoryTint(cat), border: `1px solid ${categoryHex(cat)}33`,
										}}
									>
										{categoryLabel(cat)}
									</span>
								))}
							</div>
						)}
						<div style={{
							display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16,
						}}>
							{guides.map((g) => (
								<Link
									key={g.slug}
									href={`/guides/${g.slug}`}
									className="guide-card"
									style={{
										display: 'block', padding: '20px 22px', textDecoration: 'none',
										background: 'var(--bg-card)', border: '1px solid var(--border)',
										borderLeft: `4px solid ${categoryHex(g.category)}`, borderRadius: 10,
										transition: 'border-color 0.15s, transform 0.15s',
									}}
								>
									<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 12 }}>
										<span style={{
											fontSize: 11, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
											color: categoryHex(g.category), background: categoryTint(g.category),
											padding: '3px 8px', borderRadius: 4,
										}}>
											{categoryLabel(g.category)}
										</span>
										<span style={{ fontSize: 12, color: 'var(--text-faint)' }}>
											{g.read_time} min read
										</span>
									</div>
									<h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', lineHeight: 1.3, margin: 0, letterSpacing: '-0.2px' }}>
										{g.title}
									</h2>
									<p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, margin: '10px 0 12px' }}>
										{g.summary}
									</p>
									<div style={{ fontSize: 12, color: 'var(--text-faint)' }}>
										{fmtDate(g.published_date)}
									</div>
								</Link>
							))}
						</div>
						<div style={{ marginTop: 36, fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
							Subscribe to new guides — <a href="/guides/rss.xml" style={{ color: 'var(--page-cat, var(--accent))' }}>RSS feed</a>.
						</div>
					</>
				)}
				<style>{`
					.guide-card:hover { border-color: var(--page-cat, var(--accent)) !important; transform: translateY(-2px); }
				`}</style>
			</main>
		</>
	);
}
