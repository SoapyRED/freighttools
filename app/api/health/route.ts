import { NextResponse } from 'next/server';
import { SITE_STATS } from '@/lib/constants/siteStats';

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
    tools: SITE_STATS.toolCount,
    endpoints: SITE_STATS.apiEndpointCount,
    timestamp: new Date().toISOString(),
  }, { headers: CORS });
}
