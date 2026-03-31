import { NextRequest, NextResponse } from 'next/server';
import {
  searchCodes,
  getCodeDetails,
  getChaptersBySection,
  getSectionByNumeral,
  getAllSections,
  TOTAL_CODES,
} from '@/lib/calculations/hs';

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
const CACHE = { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' };

const HS_META = {
  source: 'UN Comtrade HS 2022 (PDDL)',
  edition: 'HS 2022',
  codes: 6940,
};

export function OPTIONS() { return new NextResponse(null, { status: 204, headers: CORS }); }

export function GET(req: NextRequest) {
  const h = { ...CORS, ...CACHE };
  const { searchParams } = req.nextUrl;
  const q = searchParams.get('q');
  const code = searchParams.get('code');
  const section = searchParams.get('section');

  // Search mode
  if (q) {
    if (q.length < 2) {
      return NextResponse.json({ error: 'Search query must be at least 2 characters.' }, { status: 400, headers: h });
    }
    const results = searchCodes(q, 50);
    return NextResponse.json({ query: q, results, count: results.length, meta: HS_META }, { headers: h });
  }

  // Code lookup mode
  if (code) {
    const details = getCodeDetails(code);
    if (!details) {
      return NextResponse.json({ error: `HS code "${code}" not found.` }, { status: 404, headers: h });
    }
    return NextResponse.json({ ...details, meta: HS_META }, { headers: h });
  }

  // Section browse mode
  if (section) {
    const sec = getSectionByNumeral(section.toLowerCase());
    if (!sec) {
      return NextResponse.json({
        error: `Section "${section}" not found.`,
        valid_sections: getAllSections().map(s => s.numeral.toUpperCase()),
      }, { status: 404, headers: h });
    }
    const chapters = getChaptersBySection(section.toLowerCase());
    return NextResponse.json({ section: sec, chapters, count: chapters.length, meta: HS_META }, { headers: h });
  }

  // No params — usage hint
  return NextResponse.json({
    error: 'Missing required parameter.',
    usage: {
      search: '?q=coffee',
      lookup: '?code=0901',
      browse: '?section=II',
    },
    total_codes: TOTAL_CODES,
  }, { status: 400, headers: h });
}
