// ─────────────────────────────────────────────────────────────
//  Clean /api/mcp alias for the MCP Streamable-HTTP endpoint
//
//  The canonical handler lives at app/api/mcp/[transport]/route.ts and
//  is served at /api/mcp/mcp. That deeper URL is kept alive forever —
//  Smithery, PulseMCP, the official MCP Registry, Claude Desktop
//  configs, and countless user integrations already point at it.
//
//  We expose the shorter /api/mcp URL here by delegating to the same
//  handler with a reconstructed request whose pathname is /api/mcp/mcp.
//  A simple next.config rewrite is not sufficient: the @vercel/mcp
//  handler reads req.url to determine which transport segment was
//  matched, and Next rewrites preserve the original request.url.
// ─────────────────────────────────────────────────────────────

import {
  GET as TransportGET,
  POST as TransportPOST,
  DELETE as TransportDELETE,
  HEAD as TransportHEAD,
  OPTIONS as TransportOPTIONS,
} from './[transport]/route';

async function forwardToTransport(
  req: Request,
  inner: (r: Request) => Promise<Response>,
): Promise<Response> {
  const url = new URL(req.url);
  url.pathname = '/api/mcp/mcp';

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const body = hasBody ? await req.arrayBuffer() : undefined;

  const forwarded = new Request(url.toString(), {
    method: req.method,
    headers: req.headers,
    body,
  });

  return inner(forwarded);
}

export async function GET(req: Request) {
  return forwardToTransport(req, TransportGET);
}

export async function POST(req: Request) {
  return forwardToTransport(req, TransportPOST);
}

export async function DELETE(req: Request) {
  return forwardToTransport(req, TransportDELETE);
}

export async function HEAD() {
  return TransportHEAD();
}

export async function OPTIONS() {
  return TransportOPTIONS();
}
