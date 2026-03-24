/**
 * HS Code Lookup — Harmonized System (HS 2022)
 * Data sourced from UN Comtrade / datasets/harmonized-system
 */

import rawData from '@/lib/data/hs-codes.json';

// ─── Interfaces ──────────────────────────────────────────────────

export interface HsSection {
  numeral: string;   // lowercase: "i", "ii", "xxi"
  name: string;
}

export interface HsCode {
  hscode: string;
  description: string;
  level: number;     // 2=chapter, 4=heading, 6=subheading
  parent: string;    // parent code or "TOTAL"
  section: string;   // Roman numeral "I", "II", etc.
}

export interface HsCodeWithAncestors extends HsCode {
  ancestors: HsCode[];
  children: HsCode[];
  sectionName: string;
}

export interface HsSlimEntry {
  hscode: string;
  description: string;
  level: number;
  section: string;
}

// ─── Module-level data structures ────────────────────────────────

const ALL_SECTIONS: HsSection[] = (rawData as { sections: HsSection[]; codes: HsCode[] }).sections;
const ALL_CODES: HsCode[] = (rawData as { sections: HsSection[]; codes: HsCode[] }).codes;

const CODE_MAP = new Map<string, HsCode>();
const SECTION_MAP = new Map<string, HsSection>();
const CHAPTERS_BY_SECTION = new Map<string, HsCode[]>();
const HEADINGS_BY_CHAPTER = new Map<string, HsCode[]>();
const SUBHEADINGS_BY_HEADING = new Map<string, HsCode[]>();

// Build section lookup
for (const s of ALL_SECTIONS) {
  SECTION_MAP.set(s.numeral, s);
}

// Build code indexes
for (const c of ALL_CODES) {
  CODE_MAP.set(c.hscode, c);

  if (c.level === 2) {
    const sectionKey = c.section.toLowerCase();
    const arr = CHAPTERS_BY_SECTION.get(sectionKey) ?? [];
    arr.push(c);
    CHAPTERS_BY_SECTION.set(sectionKey, arr);
  } else if (c.level === 4) {
    const arr = HEADINGS_BY_CHAPTER.get(c.parent) ?? [];
    arr.push(c);
    HEADINGS_BY_CHAPTER.set(c.parent, arr);
  } else if (c.level === 6) {
    const arr = SUBHEADINGS_BY_HEADING.get(c.parent) ?? [];
    arr.push(c);
    SUBHEADINGS_BY_HEADING.set(c.parent, arr);
  }
}

// ─── Constants ───────────────────────────────────────────────────

export const TOTAL_CODES = ALL_CODES.length;
export const SECTION_COUNT = ALL_SECTIONS.length;
export const CHAPTER_COUNT = ALL_CODES.filter(c => c.level === 2).length;
export const HEADING_COUNT = ALL_CODES.filter(c => c.level === 4).length;
export const SUBHEADING_COUNT = ALL_CODES.filter(c => c.level === 6).length;

// ─── Exported functions ─────────────────────────────────────────

export function getAllSections(): HsSection[] {
  return ALL_SECTIONS;
}

export function getSectionByNumeral(numeral: string): HsSection | null {
  return SECTION_MAP.get(numeral.toLowerCase()) ?? null;
}

export function getChaptersBySection(numeral: string): HsCode[] {
  return CHAPTERS_BY_SECTION.get(numeral.toLowerCase()) ?? [];
}

export function getHeadingsByChapter(chapterCode: string): HsCode[] {
  return HEADINGS_BY_CHAPTER.get(chapterCode) ?? [];
}

export function getSubheadingsByHeading(headingCode: string): HsCode[] {
  return SUBHEADINGS_BY_HEADING.get(headingCode) ?? [];
}

export function getCodeDetails(hscode: string): HsCodeWithAncestors | null {
  const code = CODE_MAP.get(hscode);
  if (!code) return null;

  // Walk parent chain to build ancestors
  const ancestors: HsCode[] = [];
  let current = code;
  while (current.parent && current.parent !== 'TOTAL') {
    const parent = CODE_MAP.get(current.parent);
    if (!parent) break;
    ancestors.unshift(parent);
    current = parent;
  }

  // Get children
  let children: HsCode[] = [];
  if (code.level === 2) {
    children = HEADINGS_BY_CHAPTER.get(code.hscode) ?? [];
  } else if (code.level === 4) {
    children = SUBHEADINGS_BY_HEADING.get(code.hscode) ?? [];
  }

  const section = SECTION_MAP.get(code.section.toLowerCase());

  return {
    ...code,
    ancestors,
    children,
    sectionName: section?.name ?? '',
  };
}

export function searchCodes(query: string, limit = 50): HsCode[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const results: HsCode[] = [];
  for (const code of ALL_CODES) {
    if (
      code.hscode.includes(q) ||
      code.description.toLowerCase().includes(q)
    ) {
      results.push(code);
      if (results.length >= limit) break;
    }
  }
  return results;
}

export function getAllCodes(): HsCode[] {
  return ALL_CODES;
}

// For client-side search component
export function getSlimIndex(): HsSlimEntry[] {
  return ALL_CODES.map(c => ({
    hscode: c.hscode,
    description: c.description,
    level: c.level,
    section: c.section,
  }));
}

// For generateStaticParams
export function getAllSectionNumerals(): string[] {
  return ALL_SECTIONS.map(s => s.numeral);
}

export function getAllChapterCodes(): string[] {
  return ALL_CODES.filter(c => c.level === 2).map(c => c.hscode);
}

export function getAllHeadingCodes(): string[] {
  return ALL_CODES.filter(c => c.level === 4).map(c => c.hscode);
}

export function getAllSubheadingCodes(): string[] {
  return ALL_CODES.filter(c => c.level === 6).map(c => c.hscode);
}

// Helper: format code for display (XX.XX.XX)
export function formatHsCode(code: string): string {
  if (code.length === 6) return `${code.slice(0, 2)}.${code.slice(2, 4)}.${code.slice(4, 6)}`;
  if (code.length === 4) return `${code.slice(0, 2)}.${code.slice(2, 4)}`;
  return code;
}

// Helper: level label
export function levelLabel(level: number): string {
  if (level === 2) return 'Chapter';
  if (level === 4) return 'Heading';
  if (level === 6) return 'Subheading';
  return 'Code';
}
