---
title: "LHR Shed Codes: Operational Truth vs Regulated Truth"
slug: lhr-shed-codes-operational-vs-regulated-truth
summary: "Why HMRC's shed list doesn't match what actually happens at Heathrow, and how to navigate the gap without delays."
category: reference-data
tool_links: []
read_time: 8
published_date: 2026-04-25
updated_date: 2026-04-25
author: Marius Cristoiu
draft: true
---

## The two truths

TK — intro paragraph. Frame: HMRC publishes a regulated list of approved shed codes (ITSF/ETSF). Practitioners know a different operational reality. Both are "correct" in their context. Neither is complete without the other.

## What HMRC's shed list actually is

### ITSF and ETSF defined

TK — distinguish the two. Internal Temporary Storage Facility vs External Temporary Storage Facility. What approval covers. What it doesn't.

### How often it updates

TK — monthly ODS publication cadence. Recent example: [entity] removed on [date].

## Where the regulated view diverges from practice

### The American Airlines example

TK — canonical example. `GBAULHRLHRAAS` removed from HMRC 12 Nov 2024 but still in active operational use across the industry. Airlines still route consignments to AA's handler. Paperwork still references the old code. Enforcement gap rather than policy gap.

### Horseshoe sheds and prefix allocation

TK — 549/550A/550B/552 share one email despite being separate ITSF entries. Prefix 001 Horseshoe → AA (552-email). 607 physically at 549, 618+098 physically at 552. The "one shed, one code" mental model breaks down here.

### JZS vs ZCS at Building 582

TK — ASC's JZS existing, Swissport's ZCS added 20 Jan 2026. Same building, two codes, different operators. Which one do you use? Depends on who's handling the consignment.

## How to work with both views

### For prealert generation

TK — don't use the HMRC list alone. Operational overrides matter for on-time delivery. Validate against current industry practice via the shed's own contact email.

### For compliance and audit

TK — HMRC's list is authoritative for regulatory purposes. Operational overrides don't protect against compliance action. When in doubt on an audit, the regulated code wins.

### For AI agents and automated workflows

TK — this is why practitioner-curated data matters at the agent layer. An agent relying solely on HMRC's monthly ODS will route consignments to codes that work on paper and fail in practice. Link to FreightUtils API endpoint + operational-truth dataset.

## Further reading

- Link to the /airports/lhr/sheds tool when public
- Link to CBM calculator, chargeable weight calculator, ADR lookup
