import { NextResponse } from 'next/server';
import { SITE_STATS } from '@/lib/constants/siteStats';
import { TOOLS_COUNT } from '@/lib/api-tools-registry';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'no-store',
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export function GET() {
  return NextResponse.json({
    status: 'ok',
    version: SITE_STATS.mcpVersion,
    tools: TOOLS_COUNT,
    endpoints: SITE_STATS.apiEndpointCount,
    timestamp: new Date().toISOString(),
  }, { headers: CORS });
}
