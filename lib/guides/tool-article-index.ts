import { listGuideMeta } from './index';
import type { GuideFrontmatter } from './types';

/**
 * Reverse lookup — given a tool slug (e.g. "cbm", "adr"), return the published
 * guides that reference it in their frontmatter `tool_links` array.
 *
 * Built at request time (the page is ISR-cached) so any new guide markdown
 * file lights up downstream tool pages within the page revalidation window
 * without a full deploy.
 */
export async function guidesReferencingTool(toolSlug: string): Promise<GuideFrontmatter[]> {
	const all = await listGuideMeta({ includeDrafts: false });
	const norm = toolSlug.replace(/^\/+/, '');
	return all.filter((g) =>
		(g.tool_links || []).some((link) => {
			const l = link.replace(/^\/+/, '');
			return l === norm || l.startsWith(`${norm}/`);
		}),
	);
}

export async function buildToolArticleIndex(): Promise<Record<string, GuideFrontmatter[]>> {
	const all = await listGuideMeta({ includeDrafts: false });
	const idx: Record<string, GuideFrontmatter[]> = {};
	for (const g of all) {
		for (const link of g.tool_links || []) {
			const key = link.replace(/^\/+/, '');
			if (!idx[key]) idx[key] = [];
			idx[key].push(g);
		}
	}
	return idx;
}
