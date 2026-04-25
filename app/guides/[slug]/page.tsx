import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getGuide, getPrevNext, listGuideSlugs } from '@/lib/guides';
import {
	categoryDataAttr, categoryHex, categoryLabel, categoryTint, type GuideCategory,
} from '@/lib/guides/types';

export const revalidate = 3600;
export const dynamicParams = true;

const SITE = 'https://www.freightutils.com';

const TOOL_LABELS: Record<string, string> = {
	cbm: 'CBM Calculator',
	ldm: 'LDM Calculator',
	'chargeable-weight': 'Chargeable Weight Calculator',
	pallet: 'Pallet Fitting Calculator',
	containers: 'Container Capacity',
	'consignment-calculator': 'Consignment Calculator',
	convert: 'Unit Converter',
	adr: 'ADR Lookup',
	'adr-calculator': 'ADR Exemption Calculator',
	'adr/lq-eq-checker': 'ADR LQ/EQ Checker',
	'adr/changes-2025': 'ADR 2025 Changes',
	'adr/tunnel-codes': 'ADR Tunnel Codes',
	'adr/limited-quantities': 'ADR Limited Quantities',
	'adr/training-guide': 'ADR Training Guide',
	hs: 'HS Code Lookup',
	incoterms: 'INCOTERMS 2020',
	duty: 'UK Import Duty',
	airlines: 'Airline Codes',
	unlocode: 'UN/LOCODE Lookup',
	uld: 'ULD Types',
	vehicles: 'Vehicle Types',
};

function fmtDate(iso: string): string {
	try {
		return new Date(iso + (iso.length === 10 ? 'T00:00:00Z' : '')).toLocaleDateString('en-GB', {
			day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
		});
	} catch { return iso; }
}

export async function generateStaticParams() {
	const slugs = await listGuideSlugs({ includeDrafts: false });
	return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const { slug } = await params;
	const guide = await getGuide(slug);
	if (!guide) return { title: 'Guide not found' };
	const meta = guide.meta;
	const title = `${meta.title} — FreightUtils Guide`;
	const description = meta.summary.length > 160 ? meta.summary.slice(0, 157) + '…' : meta.summary;
	const og = `/api/og?title=${encodeURIComponent(meta.title)}&desc=${encodeURIComponent(meta.summary.slice(0, 80))}&badge=GUIDE`;
	return {
		title,
		description,
		alternates: { canonical: `${SITE}/guides/${meta.slug}` },
		robots: meta.draft ? { index: false, follow: false } : undefined,
		openGraph: {
			title,
			description,
			type: 'article',
			authors: [meta.author],
			publishedTime: meta.published_date,
			modifiedTime: meta.updated_date,
			images: [{ url: og, width: 1200, height: 630, alt: meta.title }],
		},
		twitter: { card: 'summary_large_image', title, description, images: [og] },
	};
}

export default async function GuideArticlePage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const guide = await getGuide(slug);
	if (!guide) notFound();

	const { meta, html, toc } = guide;
	const { prev, next } = await getPrevNext(slug);
	const url = `${SITE}/guides/${meta.slug}`;
	const og = `/api/og?title=${encodeURIComponent(meta.title)}&desc=${encodeURIComponent(meta.summary.slice(0, 80))}&badge=GUIDE`;

	const articleSchema = {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: meta.title,
		description: meta.summary,
		image: SITE + og,
		datePublished: meta.published_date,
		dateModified: meta.updated_date,
		author: { '@type': 'Person', name: meta.author },
		publisher: {
			'@type': 'Organization',
			name: 'FreightUtils',
			url: SITE,
			logo: { '@type': 'ImageObject', url: `${SITE}/favicon.svg` },
		},
		mainEntityOfPage: { '@type': 'WebPage', '@id': url },
	};

	const breadcrumbSchema = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
			{ '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE}/guides` },
			{ '@type': 'ListItem', position: 3, name: meta.title, item: url },
		],
	};

	const xShareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(meta.title)}&url=${encodeURIComponent(url)}`;
	const liShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

			<main data-category={categoryDataAttr(meta.category)} style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 20px 80px' }}>
				{/* Breadcrumb */}
				<nav aria-label="Breadcrumb" style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
					<Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
					<span style={{ margin: '0 6px', color: 'var(--text-faint)' }}>›</span>
					<Link href="/guides" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Guides</Link>
					<span style={{ margin: '0 6px', color: 'var(--text-faint)' }}>›</span>
					<span style={{ color: 'var(--text)' }}>{meta.title}</span>
				</nav>

				{/* Header */}
				<header style={{ marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
					<div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 14 }}>
						<span style={{
							fontSize: 11, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
							color: categoryHex(meta.category), background: categoryTint(meta.category),
							padding: '3px 8px', borderRadius: 4, border: `1px solid ${categoryHex(meta.category)}33`,
						}}>
							{categoryLabel(meta.category)}
						</span>
						<span style={{ fontSize: 12, color: 'var(--text-faint)' }}>{meta.read_time} min read</span>
						{meta.draft && (
							<span style={{
								fontSize: 11, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
								color: '#B45309', background: '#fef3c7', padding: '3px 8px', borderRadius: 4,
							}}>
								Draft
							</span>
						)}
					</div>
					<h1 style={{ fontSize: 'clamp(26px, 5vw, 38px)', fontWeight: 800, color: 'var(--text)', margin: '0 0 14px', lineHeight: 1.2, letterSpacing: '-0.5px' }}>
						{meta.title}
					</h1>
					<p style={{ fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 16px', maxWidth: 720 }}>
						{meta.summary}
					</p>
					<div style={{ fontSize: 13, color: 'var(--text-faint)', lineHeight: 1.6 }}>
						By <strong style={{ color: 'var(--text-muted)' }}>{meta.author}</strong> — ADR-certified freight transport planner, Heathrow
						{' · '}Published {fmtDate(meta.published_date)}
						{meta.updated_date && meta.updated_date !== meta.published_date && (
							<> · Updated {fmtDate(meta.updated_date)}</>
						)}
					</div>
				</header>

				{/* Article body + ToC sidebar */}
				<div className="guide-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 36, alignItems: 'start' }}>
					<article className="guide-prose" dangerouslySetInnerHTML={{ __html: html }} />

					{toc.length > 0 && (
						<aside className="guide-toc" aria-label="Table of contents" style={{ position: 'sticky', top: 80, fontSize: 13 }}>
							<div style={{
								fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
								color: 'var(--text-faint)', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid var(--border)',
							}}>
								On this page
							</div>
							<ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
								{toc.map((item) => (
									<li key={item.slug} style={{ paddingLeft: item.level === 3 ? 12 : 0 }}>
										<a href={`#${item.slug}`} style={{
											color: item.level === 2 ? 'var(--text-muted)' : 'var(--text-faint)',
											textDecoration: 'none', lineHeight: 1.5,
											fontSize: item.level === 2 ? 13 : 12,
										}}>
											{item.text}
										</a>
									</li>
								))}
							</ul>
						</aside>
					)}
				</div>

				{/* Related Tools */}
				{meta.tool_links && meta.tool_links.length > 0 && (
					<section style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
						<h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', margin: '0 0 14px', letterSpacing: '-0.2px' }}>
							Related tools
						</h2>
						<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
							{meta.tool_links.map((toolSlug) => {
								const label = TOOL_LABELS[toolSlug] || toolSlug;
								return (
									<Link key={toolSlug} href={`/${toolSlug}`} style={{
										display: 'block', padding: '12px 14px', textDecoration: 'none',
										background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8,
									}}>
										<div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{label}</div>
										<div style={{ fontSize: 12, color: 'var(--text-faint)', fontFamily: 'monospace', marginTop: 2 }}>/{toolSlug}</div>
									</Link>
								);
							})}
						</div>
					</section>
				)}

				{/* Share */}
				<section style={{ marginTop: 36, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
					<span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Share:</span>
					<a href={xShareUrl} target="_blank" rel="noopener noreferrer" style={shareBtn}>X</a>
					<a href={liShareUrl} target="_blank" rel="noopener noreferrer" style={shareBtn}>LinkedIn</a>
					<a href={url} style={shareBtn} title="Copy link"
					   data-copy-url>
						Copy link
					</a>
				</section>

				{/* Prev / Next */}
				{(prev || next) && (
					<nav aria-label="Article navigation" style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
						{prev ? (
							<Link href={`/guides/${prev.slug}`} style={prevNextStyle}>
								<div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>← Previous</div>
								<div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{prev.title}</div>
							</Link>
						) : <div />}
						{next ? (
							<Link href={`/guides/${next.slug}`} style={{ ...prevNextStyle, textAlign: 'right' as const }}>
								<div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Next →</div>
								<div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{next.title}</div>
							</Link>
						) : <div />}
					</nav>
				)}

				<style>{`
					.guide-prose { color: var(--text); font-size: 16px; line-height: 1.75; }
					.guide-prose h2 { font-size: clamp(20px, 4vw, 26px); font-weight: 800; color: var(--text); margin: 36px 0 14px; letterSpacing: -0.3px; line-height: 1.25; scroll-margin-top: 80px; }
					.guide-prose h2:first-child { margin-top: 8px; }
					.guide-prose h3 { font-size: 18px; font-weight: 700; color: var(--text); margin: 26px 0 10px; line-height: 1.3; scroll-margin-top: 80px; }
					.guide-prose p { color: var(--text-muted); margin: 0 0 14px; }
					.guide-prose strong { color: var(--text); font-weight: 700; }
					.guide-prose a { color: var(--page-cat, var(--accent)); text-decoration: underline; text-underline-offset: 2px; }
					.guide-prose code { background: var(--bg-card-hover); padding: 2px 6px; border-radius: 4px; font-size: 14px; font-family: 'Courier New', monospace; }
					.guide-prose pre { background: var(--bg-code); border-radius: 10px; padding: 16px 20px; overflow-x: auto; margin: 16px 0; }
					.guide-prose pre code { background: transparent; padding: 0; font-size: 13px; }
					.guide-prose ul, .guide-prose ol { color: var(--text-muted); margin: 0 0 14px; padding-left: 22px; }
					.guide-prose li { margin: 4px 0; line-height: 1.7; }
					.guide-prose blockquote { border-left: 4px solid var(--page-cat, var(--accent)); padding: 4px 16px; margin: 16px 0; color: var(--text-muted); background: var(--bg-card); border-radius: 0 8px 8px 0; }
					.guide-prose table { border-collapse: collapse; margin: 16px 0; width: 100%; font-size: 14px; }
					.guide-prose th, .guide-prose td { border: 1px solid var(--border); padding: 8px 12px; text-align: left; }
					.guide-prose th { background: var(--bg-card); font-weight: 700; color: var(--text); }

					@media (max-width: 900px) {
						.guide-layout { grid-template-columns: 1fr !important; }
						.guide-toc { position: relative !important; top: auto !important; order: -1; padding: 14px 18px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; }
					}
				`}</style>
			</main>
		</>
	);
}

const shareBtn: React.CSSProperties = {
	fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
	textDecoration: 'none', padding: '6px 12px', borderRadius: 4,
	border: '1px solid var(--border)', background: 'var(--bg-card)',
};

const prevNextStyle: React.CSSProperties = {
	display: 'block', textDecoration: 'none', padding: '14px 18px',
	background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10,
};
