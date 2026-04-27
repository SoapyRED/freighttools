# sheds-preview-apr2026 — branch state report

*Generated 2026-04-27. Read-only assessment for Soap; no commits to main.*

## Verdict: **Curation pending**

The LHR shed-codes feature is functionally complete on this branch — page, search, print, API route, and a 222-shed dataset all in place. Two specific blockers prevent a clean merge to main:

1. The page's own DRAFT banner declares the data **"not for operational use"** with publish date "later April 2026".
2. Six open domain questions in `data/lhr-sheds-merged.json.questions_for_soap_on_shift` need Soap's answers before the data is publishable.

Plus the branch is **27 commits behind main** (only 2 ahead). Significant rebase work to merge.

---

## Position vs main

```
ahead of main:  2 commits
behind main:    27 commits
last commit:    2026-04-21 16:45  (~6 days stale)
HEAD:           9eb5546
```

### Commits on branch (top of branch first)

| SHA | Message |
|-----|---------|
| `9eb5546` | chore(data): redact personal email and ex-employer narrative from merged JSON; HMRC register entries preserved |
| `4d6a728` | chore(lhr-sheds): curation pass — remove CEVA refs, AA email misattribution, personal email, reviewer names; add DRAFT banner; rename pending label |

Both commits are curation passes on the LHR work. The original feature commits (`830081f` / `f7cd73c` / `dae277f` / `e8af2b4` from 2026-04-21) are reachable in the reflog but were reverted on main and aren't on this branch's chain — meaning the LHR feature on `sheds-preview-apr2026` came from a different commit lineage that recreated the work. Worth noting if Soap wants to reconstruct the history.

---

## What's on the branch (vs main)

### Added (LHR feature)
- `app/airports/lhr/sheds/page.tsx` — 439 lines, the main reference page with DRAFT banner, search, sheds table, print link, reviewers placeholder, corrections/licence footer
- `app/airports/lhr/sheds/LhrShedsSearch.tsx` — 493 lines, client-side search component (airline / shed code / handler / HMRC code / email)
- `app/airports/lhr/sheds/LhrShedsPrint.tsx` — 131 lines, print-optimised layout
- `app/api/locations/lhr/sheds/route.ts` — 197 lines, JSON API endpoint
- `lib/calculations/lhr-sheds.ts` — read-time redaction layer (CEVA refs, ex-employer, personal email scrubs)
- `scripts/merge-lhr-sheds.mjs` — pipeline for merging HMRC ITSF + ETSF + operational data
- `data/lhr-sheds-merged.json` — **222 sheds**, structured: `_meta`, `critical_rules`, `airline_prefix_overrides`, `sheds[]`, `other_airports[]`, `questions_for_soap_on_shift[]`
- `data/operational-context-lhr.json` — operational source data
- `data/hmrc-itsf-locations.json` — HMRC ITSF Appendix 16D snapshot (101 records, 21 LHR-related)
- `data/hmrc-etsf-locations.json` — HMRC ETSF snapshot (709 records, LHR subset)
- `data/hmrc-changelog.json` — track changes to HMRC source over time

### Modified
- `app/components/NavLinks.tsx` — adds the LHR sheds link to nav
- `app/sitemap.ts` — registers `/airports/lhr/sheds`

### Conspicuously NOT on this branch (because main moved on without it)
The 27 commits ahead on main include features that don't exist on this branch:
- `app/api/auth/whoami/route.ts` (B028 fix)
- `app/api/cron/status-ping/route.ts`
- `app/changelog.xml/route.ts`
- `app/docs/deprecation/page.tsx`, `app/docs/versioning/page.tsx`
- `app/guides/[slug]/page.tsx`, `app/guides/page.tsx`, `app/guides/rss.xml/route.ts` (guides system!)
- `app/roadmap/page.tsx`, `app/status/page.tsx`
- `content/guides/lhr-shed-codes-operational-vs-regulated-truth.md` — a stub article that already exists on main, would need reconciling

Plus the snake_case migration commits (`636bfb1`), the tool count SSOT, the `/api/auth/whoami` endpoint, the OpenAPI work, the smoke + lint tooling, the parser symmetry on `/api/consignment` and `/api/shipment/summary`. None of those are on this branch.

---

## Curation items — what stops a merge today

### 1. DRAFT banner (intentional — Soap-blocked)

`app/airports/lhr/sheds/page.tsx:128-141`. Live copy:

> **DRAFT — under expert review.** This document is under curation. Data is not yet consolidated across overlapping HMRC codes (some records may appear twice under old and new codes). Not for operational use. Expected publish: later April 2026.

Removing the banner is a Soap call — depends on whether the consolidation is done and whether the data is signed off.

### 2. Six open domain questions in the dataset

Embedded in `data/lhr-sheds-merged.json` under `questions_for_soap_on_shift` (literal field name). Each is a domain question only Soap can answer from shift experience:

1. **BA has TWO HMRC codes at the same address** (BAC and BAS). Which is Ascentis (Main)? Which is Premia (Express)?
2. **XBQ vs DAX** — is XBQ still actively used, or has DAX (Bldg 875, Dunwoody) replaced it for BARC prealerts?
3. **BARC subject code for BA 125 prefix slips** — what's used operationally? (Expecting LHRDAX or LHRBBS.)
4. **ASC (Aviation Servicing Company at Bldg 582, JZS code)** — is ASC still routed separately, or has Swissport (ZCS) absorbed all operations there?
5. **CFL** — any subject code used operationally? Email is `spx@cfl.aero`.
6. **Swissport vs Heathrow Cargo Handling** — does HCH brand show up anywhere operationally, or is it purely the legal ITSF holder while Swissport is what everyone knows it as?

These need to be resolved (answers folded into the 222-shed dataset, then this `questions_for_soap_on_shift` array removed) before publish.

### 3. Reviewer credits unfilled

`app/airports/lhr/sheds/page.tsx:352-379` — "Expert reviewers" section currently reads "Reviewer credits pending contributor confirmation. If you have reviewed or contributed data to this dataset and wish to be credited, please contact contact@freightutils.com…". If anyone has reviewed, their attribution lands here.

### 4. 27 commits of main drift

The branch was last touched on 2026-04-21. Since then main has shipped:
- snake_case API migration + parser polyglot
- `/api/auth/whoami` (B028)
- Tool count SSOT (B003)
- API casing audit + build-time lint
- Site-wide snake_case smoke enforcement
- The site's `/guides/` system (`app/guides/[slug]/page.tsx` etc.)
- Status / Roadmap / Versioning / Deprecation pages
- Glama verification file
- The /api/consignment + /api/shipment/summary input-parser symmetry

Merging the LHR work to main today requires rebasing onto current main. The conflict surface is moderate — most of main's new work doesn't touch the same files as the LHR feature. Likely conflicts:
- `app/components/NavLinks.tsx` (both add nav links)
- `app/sitemap.ts` (both register routes)
- `data/operational-context-lhr.json` if main has touched it (unlikely)

### 5. Ancillary

- The dataset's `_meta.licence` field is set; check Soap is happy with the chosen licence string before publish.
- `data/lhr-sheds-merged.json` includes a `critical_rules` block that drives the page's hover hints — confirm those rules are accurate post-curation.
- The page links to a (now-deleted-from-this-branch) `/guides/lhr-shed-codes-operational-vs-regulated-truth.md` article. Main has its own scaffolded article slot (`content/guides/lhr-shed-codes-operational-vs-regulated-truth.md` was on main per the diff). Cross-reference between the page and the article needs to be one consistent path post-merge.

---

## Recommended next moves (Soap chooses)

### Option A — Finish curation, then rebase onto main, then merge

1. Soap answers the 6 `questions_for_soap_on_shift`; the answers are folded into `data/lhr-sheds-merged.json` and the array deleted.
2. Reviewer credits added (or the placeholder section removed).
3. DRAFT banner removed (or kept as "v0.1 — feedback welcome").
4. Rebase `sheds-preview-apr2026` onto current `main`. Resolve conflicts in `NavLinks.tsx` and `sitemap.ts` (additive, low risk).
5. Smoke test against new deploy — ensure `/airports/lhr/sheds` route lints clean, `/api/locations/lhr/sheds` returns 200, snake_case-only smoke doesn't regress.
6. Merge.

### Option B — Move just the LHR data onto a cleaner branch

If the rebase looks scary, branch off current main, copy across:
- The 12 LHR-specific files (`app/airports/lhr/sheds/*`, `app/api/locations/lhr/sheds/*`, `lib/calculations/lhr-sheds.ts`, `scripts/merge-lhr-sheds.mjs`, the four data files)
- Plus the targeted edits to `app/components/NavLinks.tsx` and `app/sitemap.ts`

Skip the 2 curation commits' history; treat the branch as a clean snapshot. Then proceed as in Option A from step 5.

### Option C — Park the branch indefinitely

If the publish date has slipped beyond useful, park the branch as-is and revisit when the consolidation is ready. The branch is 6 days stale today; another month would make the rebase larger but not impossible.

---

## Pro key requests used during this assessment
0 — branch state assessment is filesystem + git only.
