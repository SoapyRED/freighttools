import { NextResponse } from 'next/server';
import { withAuditRest } from '@/lib/observability/audit';
import { TOOLS } from '@/lib/api-tools-registry';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

async function _handleGET() {
  return NextResponse.json({
    count: TOOLS.length,
    tools: TOOLS,
    meta: {
      base_url: 'https://www.freightutils.com',
      docs: 'https://www.freightutils.com/api-docs',
      openapi: 'https://www.freightutils.com/openapi.json',
      mcp: 'https://www.freightutils.com/api/mcp/mcp',
    },
  }, { headers: CORS });
}

// Audit-wrapped handler exports — see lib/observability/audit.ts.
export const GET = withAuditRest(_handleGET);
