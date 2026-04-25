import { Marked } from 'marked';
import type { TocItem } from './types';

function slugify(s: string): string {
	return s
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');
}

interface RenderResult {
	html: string;
	toc: TocItem[];
}

export function renderMarkdown(md: string): RenderResult {
	const toc: TocItem[] = [];
	const usedSlugs = new Set<string>();

	const marked = new Marked({
		gfm: true,
		breaks: false,
	});

	marked.use({
		renderer: {
			heading({ text, depth }) {
				const baseSlug = slugify(text);
				let slug = baseSlug;
				let i = 2;
				while (usedSlugs.has(slug)) slug = `${baseSlug}-${i++}`;
				usedSlugs.add(slug);
				if (depth === 2 || depth === 3) {
					toc.push({ level: depth as 2 | 3, text, slug });
				}
				return `<h${depth} id="${slug}">${text}</h${depth}>\n`;
			},
		},
	});

	const html = marked.parse(md, { async: false }) as string;
	return { html, toc };
}

export { slugify };
