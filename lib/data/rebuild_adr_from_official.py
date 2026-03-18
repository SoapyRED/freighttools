"""
rebuild_adr_from_official.py — Build adr-2025-official.json from UNECE ADR 2025 Excel
=====================================================================================
Usage:
    python lib/data/rebuild_adr_from_official.py

Reads ADR2025_tabA_E.xlsx → writes lib/data/adr-2025-official.json
Does NOT overwrite adr-2025.json.
"""

import json
import re
import sys
from pathlib import Path

try:
    import pandas as pd
except ImportError:
    print("[ERR] pandas not installed. Run: pip install pandas openpyxl")
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent.parent
EXCEL_PATH = ROOT / "ADR2025_tabA_E.xlsx"
OLD_JSON = ROOT / "lib" / "data" / "adr-2025.json"
NEW_JSON = ROOT / "lib" / "data" / "adr-2025-official.json"


def clean(val):
    """Strip whitespace/newlines, return None for NaN/empty."""
    if pd.isna(val):
        return None
    s = str(val).strip().replace("\r", "")
    # Replace newlines with spaces, collapse multiple spaces
    s = s.replace("\n", " ")
    s = re.sub(r"\s+", " ", s).strip()
    return s if s else None


def clean_number(val):
    """Clean numeric value — strip .0 from floats like 33.0 → '33'."""
    c = clean(val)
    if c is None:
        return None
    # If it looks like a float ending in .0, convert to int string
    try:
        f = float(c)
        if f == int(f):
            return str(int(f))
    except ValueError:
        pass
    return c


def parse_col17(val):
    """
    Parse column 17: transport category + tunnel restriction code.
    Examples:
        "1\n(B1000C)"  → ("1", "(B1000C)")
        "4\n(E)"       → ("4", "(E)")
        "-\n(-)"       → ("-", "(-)")
        "2\n(D/E)"     → ("2", "(D/E)")
        NaN            → (None, None)
    """
    if pd.isna(val):
        return None, None
    s = str(val).strip()
    # Split on newline
    parts = s.split("\n")
    if len(parts) >= 2:
        tc = parts[0].strip()
        tunnel = parts[1].strip()
        return tc if tc else None, tunnel if tunnel else None
    # Fallback: try regex
    m = re.match(r"^(\S+)\s*(\(.*\))$", s)
    if m:
        return m.group(1), m.group(2)
    return s.strip() or None, None


def main():
    if not EXCEL_PATH.exists():
        print(f"[ERR] Excel not found: {EXCEL_PATH}")
        sys.exit(1)

    # ── Read Excel ──
    print(f"Reading {EXCEL_PATH.name}...")
    df = pd.read_excel(EXCEL_PATH, sheet_name="ADR2025", header=0)

    # Filter to data rows (numeric UN number)
    un_col = df.columns[0]
    mask = pd.to_numeric(df[un_col], errors="coerce").notna()
    data = df[mask].copy()
    data[un_col] = data[un_col].astype(int)
    print(f"  {len(data)} data rows, {data[un_col].nunique()} unique UN numbers")

    # Column references
    C = df.columns  # shorthand

    # ── Count variants per UN ──
    variant_counts = data[un_col].value_counts().to_dict()

    # ── Build entries ──
    entries = []
    # Track row index within each UN number
    un_row_index = {}

    for _, row in data.iterrows():
        un_int = int(row[un_col])
        un_str = f"{un_int:04d}"

        # Variant index
        idx = un_row_index.get(un_int, 0)
        un_row_index[un_int] = idx + 1

        vc = variant_counts[un_int]

        # Parse col 17
        tc, tunnel = parse_col17(row[C[17]])

        entry = {
            "un_number": un_str,
            "variant_id": f"{un_str}_{idx}",
            "variant_index": idx,
            "variant_count": vc,
            "proper_shipping_name": clean(row[C[1]]),
            "class": clean(row[C[2]]),
            "classification_code": clean(row[C[3]]),
            "packing_group": clean(row[C[4]]),
            "labels": clean(row[C[5]]),
            "special_provisions": clean(row[C[6]]),
            "limited_quantity": clean(row[C[7]]),
            "excepted_quantity": clean(row[C[8]]),
            "transport_category": tc,
            "tunnel_restriction_code": tunnel,
            "hazard_identification_number": clean_number(row[C[22]]),
            "_source": "ADR2025-Official-UNECE-Excel",
            "_edition": "2025",
        }
        entries.append(entry)

    # ── Write new JSON ──
    with open(NEW_JSON, "w", encoding="utf-8") as f:
        json.dump(entries, f, indent=2, ensure_ascii=False)
    print(f"\nWrote {len(entries)} entries to {NEW_JSON.name}")

    # ── Summary ──
    unique_uns = set(e["un_number"] for e in entries)
    multi = sum(1 for un in unique_uns if variant_counts[int(un)] > 1)

    print(f"\n{'='*60}")
    print(f"  REBUILD SUMMARY")
    print(f"{'='*60}")
    print(f"  Total entries:           {len(entries)}")
    print(f"  Unique UN numbers:       {len(unique_uns)}")
    print(f"  Multi-variant UNs:       {multi}")
    print(f"  Single-variant UNs:      {len(unique_uns) - multi}")
    print(f"{'='*60}")

    # Sample first 3 entries
    print(f"\n  First 3 entries:")
    for e in entries[:3]:
        print(f"  {json.dumps(e, ensure_ascii=False)[:200]}")

    # ── STEP 2: Integrity checks ──
    print(f"\n{'='*60}")
    print(f"  INTEGRITY CHECKS")
    print(f"{'='*60}")

    # Required fields
    missing_un = [e for e in entries if not e["un_number"]]
    missing_psn = [e for e in entries if not e["proper_shipping_name"]]
    missing_cls = [e for e in entries if not e["class"]]
    print(f"  Missing un_number:       {len(missing_un)}")
    print(f"  Missing PSN:             {len(missing_psn)}")
    print(f"  Missing class:           {len(missing_cls)}")

    # German text check
    german_hits = []
    german_words = ["BEFÖRDERUNG", "VERBOTEN", "FREIGESTELLT", "NICHT ZUGELASSEN"]
    for e in entries:
        for field, val in e.items():
            if isinstance(val, str):
                for gw in german_words:
                    if gw in val.upper():
                        german_hits.append((e["variant_id"], field, val[:60]))
                        break
    print(f"  German text found:       {len(german_hits)}")
    if german_hits:
        for vid, fld, txt in german_hits[:5]:
            print(f"    {vid} / {fld}: {txt}")

    # UN number format check
    bad_un = [e for e in entries if not re.match(r"^\d{4}$", e["un_number"])]
    print(f"  Invalid UN format:       {len(bad_un)}")

    un_ints = [int(e["un_number"]) for e in entries]
    print(f"  UN range:                {min(un_ints)} – {max(un_ints)}")

    # Tunnel code spot check
    print(f"\n  Tunnel code spot check (10 samples):")
    import random
    random.seed(42)
    samples = random.sample(entries, min(10, len(entries)))
    for e in samples:
        print(f"    UN{e['un_number']}_{e['variant_index']}: "
              f"tc={e['transport_category']!r}, "
              f"tunnel={e['tunnel_restriction_code']!r}")

    # Variant indexing check
    bad_variants = []
    from collections import defaultdict
    by_un = defaultdict(list)
    for e in entries:
        by_un[e["un_number"]].append(e)
    for un, elist in by_un.items():
        indices = [e["variant_index"] for e in elist]
        expected = list(range(len(elist)))
        if indices != expected:
            bad_variants.append(un)
        if any(e["variant_count"] != len(elist) for e in elist):
            bad_variants.append(un)
    print(f"  Bad variant indexing:    {len(set(bad_variants))}")

    # ── STEP 3: Comparison stats ──
    print(f"\n{'='*60}")
    print(f"  OLD vs NEW COMPARISON")
    print(f"{'='*60}")

    with open(OLD_JSON, encoding="utf-8") as f:
        old_entries = json.load(f)

    old_uns = set(e["un_number"] for e in old_entries)
    new_uns = set(e["un_number"] for e in entries)

    print(f"  Old total entries:       {len(old_entries)}")
    print(f"  New total entries:       {len(entries)}")
    print(f"  Old unique UNs:          {len(old_uns)}")
    print(f"  New unique UNs:          {len(new_uns)}")
    print(f"  New UNs not in old:      {len(new_uns - old_uns)}")
    print(f"  Old UNs not in new:      {len(old_uns - new_uns)}")

    # The 11 new UN numbers with full details
    new_only = sorted(new_uns - old_uns)
    print(f"\n  New UN numbers ({len(new_only)}) with details:")
    for un in new_only:
        elist = by_un[un]
        for e in elist:
            print(f"    UN{e['un_number']}: {e['proper_shipping_name'][:70]}")
            print(f"      class={e['class']}, pg={e['packing_group']}, "
                  f"labels={e['labels']}, tunnel={e['tunnel_restriction_code']}")

    # Field-level change counts (compare first variant only for fair comparison)
    old_lookup = {e["un_number"]: e for e in old_entries}
    # New: take first variant per UN
    new_first = {}
    for e in entries:
        if e["un_number"] not in new_first:
            new_first[e["un_number"]] = e

    common = old_uns & new_uns
    psn_changed = 0
    class_changed = 0
    tunnel_changed = 0
    for un in common:
        o = old_lookup[un]
        n = new_first[un]
        if (o.get("proper_shipping_name") or "") != (n.get("proper_shipping_name") or ""):
            psn_changed += 1
        if (o.get("class") or "") != (n.get("class") or ""):
            class_changed += 1
        # Normalize tunnel for comparison
        ot = (o.get("tunnel_restriction_code") or "").strip("() ")
        nt = (n.get("tunnel_restriction_code") or "").strip("() ")
        if ot != nt:
            tunnel_changed += 1

    print(f"\n  Field changes (common UNs, first variant):")
    print(f"    proper_shipping_name changed:  {psn_changed} / {len(common)}")
    print(f"    class changed:                 {class_changed} / {len(common)}")
    print(f"    tunnel_restriction_code changed:{tunnel_changed} / {len(common)}")

    # Show the class changes (critical)
    if class_changed:
        print(f"\n  CLASS CHANGES (critical review):")
        for un in sorted(common):
            o = old_lookup[un]
            n = new_first[un]
            oc = o.get("class") or ""
            nc = n.get("class") or ""
            if oc != nc:
                print(f"    UN{un}: {oc!r} → {nc!r}  ({n.get('proper_shipping_name', '')[:50]})")

    print(f"\n{'='*60}")
    print(f"  Done. Review adr-2025-official.json before swapping.")
    print(f"  Old file NOT modified.")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
