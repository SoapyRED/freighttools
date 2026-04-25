export type GuideCategory = 'reference-data' | 'freight-ops' | 'customs-trade' | 'dangerous-goods';

export interface GuideFrontmatter {
	title: string;
	slug: string;
	summary: string;
	category: GuideCategory;
	tool_links: string[];
	read_time: number;
	published_date: string;
	updated_date: string;
	author: string;
	draft?: boolean;
}

export interface TocItem {
	level: 2 | 3;
	text: string;
	slug: string;
}

export interface Guide {
	meta: GuideFrontmatter;
	content: string;
	html: string;
	toc: TocItem[];
}

const CATEGORY_TO_DATA: Record<GuideCategory, 'ref' | 'ops' | 'customs' | 'dg'> = {
	'reference-data': 'ref',
	'freight-ops': 'ops',
	'customs-trade': 'customs',
	'dangerous-goods': 'dg',
};

const CATEGORY_LABEL: Record<GuideCategory, string> = {
	'reference-data': 'Reference Data',
	'freight-ops': 'Freight Ops',
	'customs-trade': 'Customs & Trade',
	'dangerous-goods': 'Dangerous Goods',
};

const CATEGORY_HEX: Record<GuideCategory, string> = {
	'reference-data': '#7C3AED',
	'freight-ops': '#15803D',
	'customs-trade': '#2563EB',
	'dangerous-goods': '#DC2626',
};

const CATEGORY_TINT: Record<GuideCategory, string> = {
	'reference-data': '#FAF5FF',
	'freight-ops': '#F0FDF4',
	'customs-trade': '#EFF6FF',
	'dangerous-goods': '#FEF2F2',
};

export const categoryDataAttr = (c: GuideCategory) => CATEGORY_TO_DATA[c];
export const categoryLabel = (c: GuideCategory) => CATEGORY_LABEL[c];
export const categoryHex = (c: GuideCategory) => CATEGORY_HEX[c];
export const categoryTint = (c: GuideCategory) => CATEGORY_TINT[c];
