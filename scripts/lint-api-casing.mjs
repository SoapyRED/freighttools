#!/usr/bin/env node
/**
 * Build-time lint — fails if any route handler under app/api/** returns
 * a camelCase property key in a JSON response body.
 *
 * What it checks
 *   For every `NextResponse.json(body, init?)` call site, walks the `body`
 *   argument's object-literal tree and flags any PropertyAssignment /
 *   ShorthandPropertyAssignment whose Identifier name contains a capital
 *   letter. Recurses into nested object literals and array elements.
 *
 * What it doesn't check
 *   - Request-body input parsing (camelCase aliases like `commodityCode`
 *     are kept for backwards compatibility — see middleware + API casing
 *     migration commit 636bfb1).
 *   - Library-call arguments (e.g. `calculateConsignment({lengthCm, ...})`).
 *   - The MCP route at app/api/mcp/[transport]/route.ts — uses the
 *     mcp-handler library, not NextResponse.json, and its output fields
 *     follow MCP protocol conventions (readOnlyHint, destructiveHint, etc).
 *   - The OG image route at app/api/og/route.tsx — returns an ImageResponse
 *     with JSX inline styles (flexDirection, fontFamily) that are CSS-in-JS
 *     conventions, not API responses.
 *   - Boundary-mapper functions (toApiResponse, toItemResponse, etc.) —
 *     when their call appears as a CallExpression in NextResponse.json arg[0],
 *     the lint can't statically resolve the function body. Those are
 *     covered by the runtime testSnakeCaseOnly smoke assertion instead.
 *   - HTTP-header keys — anything inside a `headers:` block is exempt
 *     (HTTP headers conventionally use Title-Case, e.g. `'Cache-Control'`).
 *
 * Pairs with the runtime `testSnakeCaseOnly` smoke assertion. Lint catches
 * inline camelCase keys at build time before they ship; smoke catches
 * boundary-mapped or dynamically-built responses at deploy time.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as ts from 'typescript';

const API_DIR = path.resolve(process.cwd(), 'app/api');

function findRouteFiles(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findRouteFiles(full, results);
    } else if (entry.name === 'route.ts' || entry.name === 'route.tsx') {
      results.push(full);
    }
  }
  return results;
}

function isNextResponseJsonCall(node) {
  if (!ts.isCallExpression(node)) return false;
  const expr = node.expression;
  if (!ts.isPropertyAccessExpression(expr)) return false;
  if (!ts.isIdentifier(expr.expression) || expr.expression.text !== 'NextResponse') return false;
  if (!ts.isIdentifier(expr.name) || expr.name.text !== 'json') return false;
  return true;
}

/**
 * Recursively check property keys of an object literal that's part of a
 * response body. Skips any sub-tree under a `headers:` key.
 */
function checkResponseValue(node, sf, violations, insideHeaders = false) {
  if (insideHeaders) return;

  if (ts.isObjectLiteralExpression(node)) {
    for (const prop of node.properties) {
      if (
        (ts.isPropertyAssignment(prop) || ts.isShorthandPropertyAssignment(prop)) &&
        ts.isIdentifier(prop.name)
      ) {
        const keyText = prop.name.text;
        const isHeadersKey = keyText === 'headers';
        if (/[A-Z]/.test(keyText) && !isHeadersKey) {
          const { line } = sf.getLineAndCharacterOfPosition(prop.name.getStart(sf));
          violations.push({ line: line + 1, key: keyText });
        }
        if (ts.isPropertyAssignment(prop)) {
          checkResponseValue(prop.initializer, sf, violations, isHeadersKey);
        }
      }
      // SpreadAssignment / methods / computed keys: not statically checkable, skip.
    }
  } else if (ts.isArrayLiteralExpression(node)) {
    for (const el of node.elements) {
      checkResponseValue(el, sf, violations, false);
    }
  }
  // Other node kinds (CallExpression, Identifier, ...) aren't statically resolvable here.
}

function checkFile(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const sf = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    ts.ScriptKind.TS,
  );
  const violations = [];

  function visit(node) {
    if (isNextResponseJsonCall(node)) {
      const body = node.arguments[0];
      if (body) checkResponseValue(body, sf, violations);
      // Note: we deliberately do NOT recurse into the second arg (response init).
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
  return violations;
}

function main() {
  if (!fs.existsSync(API_DIR)) {
    console.error(`lint-api-casing: app/api not found at ${API_DIR}`);
    process.exit(2);
  }

  const files = findRouteFiles(API_DIR);
  let total = 0;
  const fileViolations = [];

  for (const file of files) {
    const violations = checkFile(file);
    if (violations.length > 0) {
      fileViolations.push({ file, violations });
      total += violations.length;
    }
  }

  if (total > 0) {
    console.error(`lint-api-casing: ${total} camelCase response key(s) across ${fileViolations.length} file(s):\n`);
    for (const { file, violations } of fileViolations) {
      const rel = path.relative(process.cwd(), file).replace(/\\/g, '/');
      for (const v of violations) {
        console.error(`  ${rel}:${v.line} — "${v.key}"`);
      }
    }
    console.error(`\nAPI responses must use snake_case keys. Convert each flagged key, or wrap the value in a boundary mapper that emits snake_case.`);
    process.exit(1);
  }

  console.log(`lint-api-casing: ${files.length} route file(s) clean — no camelCase response keys.`);
  process.exit(0);
}

main();
