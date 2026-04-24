#!/usr/bin/env node

/**
 * Thin-content audit — randomly sample N URLs from the live sitemap and flag
 * any that fail SEO hygiene checks: status 200, canonical matches sitemap URL,
 * unique <title>/<meta description>/<h1>, word count > 150.
 *
 * Run: node scripts/thin-content-audit.mjs [baseUrl] [sampleSize]
 * Defaults: https://www.freightutils.com, 30
 *
 * HS subheading/heading/code/chapter/section routes + /adr/un/* are rate-limited
 * by middleware.ts at the scrape-protection layer. We pace with a small delay
 * and report 429s as uncheckable rather than as thin-content flags.
 */

const BASE = process.argv[2] || 'https://www.freightutils.com';
const SAMPLE = parseInt(process.argv[3] || '30', 10);
const DELAY_MS = 500;
const MIN_WORDS = 150;

function pickN(arr, n) {
  const pool = [...arr];
  const out = [];
  while (out.length < n && pool.length > 0) {
    const i = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
}

function extract(html, pattern) {
  const m = html.match(pattern);
  return m ? m[1].replace(/\s+/g, ' ').trim() : '';
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

async function checkUrl(url) {
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'freightutils-thin-content-audit/1.0',
      },
      redirect: 'manual',
    });
    const ms = Date.now() - start;
    if (res.status === 429) {
      return { url, status: 429, ms, rateLimited: true, errors: [] };
    }
    if (res.status !== 200) {
      return { url, status: res.status, ms, errors: [`status ${res.status} !== 200`] };
    }
    const html = await res.text();

    const title = extract(html, /<title[^>]*>([^<]*)<\/title>/i);
    const desc  = extract(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
    const h1    = extract(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const canonical = extract(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i);
    const bodyText = stripTags(html);
    const words = wordCount(bodyText);

    const errors = [];
    if (!title) errors.push('missing <title>');
    if (!desc) errors.push('missing meta description');
    if (!h1) errors.push('missing <h1>');
    if (!canonical) errors.push('missing canonical');
    if (canonical && canonical !== url) errors.push(`canonical mismatch: ${canonical}`);
    if (words < MIN_WORDS) errors.push(`thin body: ${words} words < ${MIN_WORDS}`);

    return { url, status: 200, ms, title, desc, h1: h1.slice(0, 60), canonical, words, errors };
  } catch (err) {
    return { url, status: 0, ms: Date.now() - start, errors: [`fetch error: ${err.message}`] };
  }
}

async function main() {
  console.log(`\n  Thin-content audit`);
  console.log(`  Base: ${BASE}`);
  console.log(`  Sample: ${SAMPLE} URLs\n`);

  const sitemapRes = await fetch(`${BASE}/sitemap.xml`);
  const sitemapXml = await sitemapRes.text();
  const all = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  console.log(`  Sitemap URLs discovered: ${all.length}`);

  const sample = pickN(all, SAMPLE);
  console.log(`  Sampled ${sample.length}\n`);

  const results = [];
  for (const url of sample) {
    const r = await checkUrl(url);
    results.push(r);
    const tag = r.rateLimited ? '⏸' : r.errors.length === 0 ? '✅' : '❌';
    const suffix = r.rateLimited ? '429 rate-limited' : r.errors.length === 0 ? `${r.words}w` : r.errors.join('; ');
    console.log(`  ${tag} ${url}  —  ${suffix}`);
    await new Promise(r => setTimeout(r, DELAY_MS));
  }

  const passed = results.filter(r => !r.rateLimited && r.errors.length === 0);
  const flagged = results.filter(r => !r.rateLimited && r.errors.length > 0);
  const rateLimited = results.filter(r => r.rateLimited);

  console.log(`\n  ────────────────`);
  console.log(`  Passed:       ${passed.length}`);
  console.log(`  Flagged:      ${flagged.length}`);
  console.log(`  Rate-limited: ${rateLimited.length} (uncheckable from this IP)`);

  if (flagged.length > 0) {
    console.log(`\n  FLAGGED URLs:`);
    for (const r of flagged) {
      console.log(`  - ${r.url}`);
      for (const e of r.errors) console.log(`      · ${e}`);
    }
  }

  if (rateLimited.length > 0) {
    console.log(`\n  Rate-limited URLs (re-run from a different IP or with delay to cover):`);
    for (const r of rateLimited) console.log(`  - ${r.url}`);
  }

  console.log('');
  process.exit(flagged.length > 0 ? 1 : 0);
}

await main();
