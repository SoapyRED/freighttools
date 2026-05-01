# Backlog

Out-of-band items captured here when they don't fit in the current sprint and aren't urgent enough to start immediately. Move to a sprint when ready, delete when done.

## Open

- MCP path cleanup (months out): once Vercel logs show zero traffic on `/api/mcp/mcp`, move `app/api/mcp/[transport]/route.ts` up one folder so `/api/mcp` becomes native, then delete the sibling alias. Do not act until old-path traffic is genuinely zero.
