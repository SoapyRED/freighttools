import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { renderMarkdown } from './markdown';
import type { Guide, GuideFrontmatter } from './types';

const GUIDES_DIR = path.join(process.cwd(), 'content', 'guides');

async function readGuideFile(file: string): Promise<{ meta: GuideFrontmatter; content: string }> {
	const raw = await fs.readFile(path.join(GUIDES_DIR, file), 'utf8');
	const { data, content } = matter(raw);
	return { meta: data as GuideFrontmatter, content };
}

export async function listGuideMeta(opts: { includeDrafts?: boolean } = {}): Promise<GuideFrontmatter[]> {
	const includeDrafts = opts.includeDrafts ?? false;
	let files: string[];
	try {
		files = await fs.readdir(GUIDES_DIR);
	} catch {
		return [];
	}
	const mdFiles = files.filter((f) => f.endsWith('.md'));
	const all = await Promise.all(mdFiles.map((f) => readGuideFile(f).then((r) => r.meta).catch(() => null)));
	const valid = all.filter((g): g is GuideFrontmatter => g !== null);
	return valid
		.filter((g) => includeDrafts || !g.draft)
		.sort((a, b) => (a.published_date < b.published_date ? 1 : -1));
}

export async function getGuide(slug: string): Promise<Guide | null> {
	const file = `${slug}.md`;
	let entry: { meta: GuideFrontmatter; content: string };
	try {
		entry = await readGuideFile(file);
	} catch {
		return null;
	}
	const { html, toc } = renderMarkdown(entry.content);
	return { meta: entry.meta, content: entry.content, html, toc };
}

export async function listGuideSlugs(opts: { includeDrafts?: boolean } = {}): Promise<string[]> {
	const metas = await listGuideMeta(opts);
	return metas.map((m) => m.slug);
}

export async function getPrevNext(slug: string): Promise<{ prev: GuideFrontmatter | null; next: GuideFrontmatter | null }> {
	const published = await listGuideMeta({ includeDrafts: false });
	const idx = published.findIndex((g) => g.slug === slug);
	if (idx === -1) return { prev: null, next: null };
	return {
		prev: idx > 0 ? published[idx - 1] : null,
		next: idx < published.length - 1 ? published[idx + 1] : null,
	};
}
