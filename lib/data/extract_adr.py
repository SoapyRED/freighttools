"""
extract_adr.py — ADR 2025 Table A dataset builder
===================================================
Produces: lib/data/adr-2025.json

Sources:
  - lib/data/ADR2023_Substances.csv  — all regulatory fields (German language, ADR 2023)
  - lib/data/adr-2025-source.pdf     — English proper_shipping_name (ADR 2025, downloaded
                                        from https://unece.org/transport/dangerous-goods/adr-2025)

Run from the project root:
    python lib/data/extract_adr.py
"""

import json
import re
import sys
from pathlib import Path

import pandas as pd
import pdfplumber

# ─────────────────────────────────────────────────────────────────────────────
#  PATHS  (relative to project root — run script from there)
# ─────────────────────────────────────────────────────────────────────────────
ROOT       = Path(__file__).parent.parent.parent   # …/freightutils.com
CSV_PATH   = ROOT / "lib" / "data" / "ADR2023_Substances.csv"
PDF_PATH   = ROOT / "lib" / "data" / "adr-2025-source.pdf"
OUT_PATH   = ROOT / "lib" / "data" / "adr-2025.json"

# ─────────────────────────────────────────────────────────────────────────────
#  HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def null_if_dash(v: str):
    """Return None for dash/empty, otherwise strip and return the string."""
    v = v.strip()
    return None if v in ("-", "", "–", "—") else v


def parse_labels(raw: str) -> list[str]:
    """
    "3+6.1" -> ["3", "6.1"]
    "6.2"   -> ["6.2"]
    "siehe 5.2.2.1.12" -> ["siehe 5.2.2.1.12"]  (keep special refs as-is)
    "-"     -> []
    """
    raw = raw.strip()
    if raw in ("-", "", "–"):
        return []
    parts = re.split(r"[+,\s]+", raw)
    return [p.strip() for p in parts if p.strip() and p.strip() not in ("-",)]


def parse_special_provisions(raw: str) -> list[str]:
    """
    "243 534 664" -> ["243", "534", "664"]
    "-"           -> []
    """
    raw = raw.strip()
    if raw in ("-", "", "–"):
        return []
    parts = re.split(r"[\s,]+", raw)
    return [p.strip() for p in parts if p.strip() and p.strip() not in ("-",)]


def parse_transport_category(raw: str):
    """
    "2 (D/E)"           -> (2, "D/E",  False)
    "0 (-)"             -> (0, None,   False)
    "1 (B1000C)"        -> (1, "B1000C", False)
    "(E)"               -> (None, "E", False)  tunnel code only, no category
    "-"                 -> (None, None, False)
    "BEFORDERUNG VERBOTEN" -> (None, None, True)  transport prohibited
    Returns: (transport_category, tunnel_restriction_code, transport_prohibited)
    """
    raw = raw.strip()
    if raw in ("-", "", "–"):
        return None, None, False

    # Transport prohibited (German: BEFÖRDERUNG VERBOTEN)
    if "VERBOTEN" in raw.upper() or "PROHIBITED" in raw.upper():
        return None, None, True

    # Tunnel code only, no category number: "(E)" or "(D/E)"
    m_tunnel_only = re.match(r'^\((.+?)\)$', raw)
    if m_tunnel_only:
        tunnel_raw = m_tunnel_only.group(1)
        tunnel_code = None if tunnel_raw in ("-", "–") else tunnel_raw.strip()
        return None, tunnel_code, False

    # Standard pattern: digit, optional spaces, optional parenthesised tunnel code
    m = re.match(r'^(\d)\s*(?:\((.+?)\))?', raw)
    if not m:
        return None, None, False

    category = int(m.group(1))
    tunnel_raw = m.group(2) if m.group(2) else None

    # Normalise tunnel code: "-" means no restriction
    if tunnel_raw in ("-", "–", None):
        tunnel_code = None
    else:
        tunnel_code = tunnel_raw.strip()

    return category, tunnel_code, False


# ─────────────────────────────────────────────────────────────────────────────
#  PHASE A — Load CSV (regulatory fields)
# ─────────────────────────────────────────────────────────────────────────────

def load_csv(path: Path) -> dict[str, dict]:
    """
    Returns dict keyed by zero-padded UN number: {"1203": {...}, ...}
    """
    print(f"\n{'='*60}")
    print("PHASE A — Loading CSV regulatory data")
    print(f"{'='*60}")
    print(f"  Source: {path}")

    # Row index 0 = headers, Row index 1 = column indicators (1);(2);(3a)... — skip it
    df = pd.read_csv(
        path,
        sep=";",
        encoding="utf-8",
        skiprows=[1],    # skip the (1);(2);(3a)... indicator row
        dtype=str,
        keep_default_na=False,
    )
    df = df.fillna("-")

    print(f"  Rows read: {len(df):,}  |  Columns: {len(df.columns)}")

    entries = {}
    parse_errors = []

    for idx, row in df.iterrows():
        raw_un = str(row.get("UN-Nummer", "")).strip()

        # Skip non-numeric / empty UN numbers
        if not re.match(r'^\d{1,4}$', raw_un):
            parse_errors.append({"row": idx, "raw_un": raw_un, "reason": "non-numeric UN"})
            continue

        un = raw_un.zfill(4)

        transport_cat, tunnel_code, transport_prohibited = parse_transport_category(
            row.get("Befoerderungskategorie", "-")
        )

        entry = {
            "un_number":                   un,
            "proper_shipping_name":        row.get("Benennung und Beschreibung", "").strip(),  # German placeholder
            "class":                       null_if_dash(row.get("Klasse", "-")),
            "classification_code":         null_if_dash(row.get("Klassifizierungscode", "-")),
            "packing_group":               null_if_dash(row.get("Verpackungsgruppe", "-")),
            "labels":                      parse_labels(row.get("Gefahrzettel", "-")),
            "special_provisions":          parse_special_provisions(row.get("Sondervorschriften", "-")),
            "limited_quantity":            null_if_dash(row.get("Begrenzte und freigestellte Mengen A", "-")),
            "excepted_quantity":           null_if_dash(row.get("Begrenzte und freigestellte Mengen B", "-")),
            "transport_category":          transport_cat,
            "tunnel_restriction_code":     tunnel_code,
            "transport_prohibited":        transport_prohibited,
            "hazard_identification_number": null_if_dash(row.get("Nummer_Gefahr", "-")),
            "_source":                     "ADR2023-DE",
            "_needs_english_name":         True,
        }
        entries[un] = entry

    print(f"  Entries loaded: {len(entries):,}")
    if parse_errors:
        print(f"  [WARN]  Parse errors: {len(parse_errors)}")
        for e in parse_errors[:10]:
            print(f"     Row {e['row']}: UN={e['raw_un']!r} — {e['reason']}")

    return entries, parse_errors


# ─────────────────────────────────────────────────────────────────────────────
#  PHASE B — Extract English names from PDF
# ─────────────────────────────────────────────────────────────────────────────

def extract_english_names(path: Path) -> dict[str, str]:
    """
    Returns dict keyed by zero-padded UN number: {"1203": "GASOLINE or PETROL...", ...}

    Strategy:
    - Scan every page for tables
    - A valid Table A row: cell[0] matches ^\d{4}$ (UN number)
                           cell[1] is the proper shipping name
    - Multi-line names: rows where cell[0] is empty/None continue the previous entry
    """
    print(f"\n{'='*60}")
    print("PHASE B — Extracting English names from PDF")
    print(f"{'='*60}")
    print(f"  Source: {path}")

    # Quick sanity check — real PDF should be > 100 KB
    size_kb = path.stat().st_size / 1024
    print(f"  File size: {size_kb:,.0f} KB")
    if size_kb < 100:
        print("  [WARN]  WARNING: PDF appears to be a stub/placeholder (< 100 KB).")
        print("     Download the real ADR 2025 PDF from:")
        print("     https://unece.org/transport/dangerous-goods/adr-2025")
        print("     Save it to: lib/data/adr-2025-source.pdf")
        print("     Then re-run this script.")
        print("  -> Skipping PDF extraction. All entries will use German names.")
        return {}

    names = {}
    last_un = None
    pages_scanned = 0
    tables_found = 0
    un_rows_found = 0

    try:
        with pdfplumber.open(path) as pdf:
            total_pages = len(pdf.pages)
            print(f"  Total pages: {total_pages:,}")
            print(f"  Scanning all pages for Table A rows…")

            for page in pdf.pages:
                pages_scanned += 1

                # Try table extraction first (more reliable when PDF has embedded table structure)
                tables = page.extract_tables()
                for table in tables:
                    tables_found += 1
                    for row in table:
                        if not row or len(row) < 2:
                            continue

                        cell0 = (row[0] or "").strip().replace("\n", "").replace(" ", "")
                        cell1 = (row[1] or "").strip().replace("\n", " ")

                        if re.match(r'^\d{4}$', cell0):
                            # New UN number row
                            un = cell0.zfill(4)
                            last_un = un
                            if cell1:
                                names[un] = cell1
                            un_rows_found += 1

                        elif cell0 == "" and last_un and cell1:
                            # Continuation row — append to previous entry's name
                            if last_un in names:
                                names[last_un] = names[last_un] + " " + cell1
                            else:
                                names[last_un] = cell1

                # If no tables found on this page, try word-level extraction as fallback
                if not tables:
                    text = page.extract_text()
                    if text:
                        for line in text.split("\n"):
                            m = re.match(r'^(\d{4})\s+(.+)$', line.strip())
                            if m:
                                un = m.group(1).zfill(4)
                                name_candidate = m.group(2).strip()
                                # Simple heuristic: name should be mostly uppercase and > 5 chars
                                if len(name_candidate) > 5 and name_candidate[0].isupper():
                                    last_un = un
                                    names[un] = name_candidate
                                    un_rows_found += 1

    except Exception as e:
        print(f"  [ERR] PDF extraction failed: {e}")
        return {}

    # Clean up names: collapse multiple spaces, strip trailing punctuation
    names = {
        un: re.sub(r'\s+', ' ', name).strip().rstrip(',;.')
        for un, name in names.items()
    }

    print(f"  Pages scanned: {pages_scanned:,}")
    print(f"  Tables found:  {tables_found:,}")
    print(f"  UN rows found: {un_rows_found:,}")
    print(f"  English names extracted: {len(names):,}")

    return names


# ─────────────────────────────────────────────────────────────────────────────
#  PHASE C — Merge
# ─────────────────────────────────────────────────────────────────────────────

def merge(entries: dict, english_names: dict) -> list[dict]:
    """
    Overlay English proper_shipping_name onto each entry where available.
    """
    print(f"\n{'='*60}")
    print("PHASE C — Merging CSV + PDF data")
    print(f"{'='*60}")

    matched = 0
    unmatched = 0

    result = []
    for un, entry in entries.items():
        if un in english_names:
            entry["proper_shipping_name"] = english_names[un]
            entry["_source"] = "ADR2025-EN+ADR2023-DE"
            entry["_needs_english_name"] = False
            matched += 1
        else:
            # Keep German name as fallback
            unmatched += 1

        result.append(entry)

    # Sort by UN number
    result.sort(key=lambda x: x["un_number"])

    print(f"  English names matched:  {matched:,}")
    print(f"  Still need English name: {unmatched:,}")

    return result


# ─────────────────────────────────────────────────────────────────────────────
#  PHASE D — Validation report
# ─────────────────────────────────────────────────────────────────────────────

def validate(entries: list[dict], csv_parse_errors: list):
    print(f"\n{'='*60}")
    print("PHASE D — Validation Report")
    print(f"{'='*60}")

    total = len(entries)
    null_pg = sum(1 for e in entries if e["packing_group"] is None)
    null_hin = sum(1 for e in entries if e["hazard_identification_number"] is None)
    null_tc = sum(1 for e in entries if e["transport_category"] is None and not e.get("transport_prohibited"))
    prohibited = sum(1 for e in entries if e.get("transport_prohibited"))
    needs_en = sum(1 for e in entries if e["_needs_english_name"])
    has_en = total - needs_en

    print(f"\n  Total entries:              {total:,}")
    print(f"  English names matched:      {has_en:,}")
    print(f"  Still need English name:    {needs_en:,}")
    print(f"  Null packing_group:         {null_pg:,}  (expected for Class 1 + 2)")
    print(f"  Null hazard_id_number:      {null_hin:,}  (expected for Class 1, 2, 7)")
    print(f"  Transport prohibited:       {prohibited:,}  (ADR carriage banned)")
    print(f"  Null transport_category:    {null_tc:,}  (tunnel-only or genuinely N/A)")

    # Bad UN numbers
    bad_un = [e for e in entries if not re.match(r'^\d{4}$', e["un_number"])]
    if bad_un:
        print(f"\n  [WARN]  Malformed UN numbers ({len(bad_un)}):")
        for e in bad_un[:10]:
            print(f"     {e['un_number']!r}")
    else:
        print(f"\n  [OK] All UN numbers are valid 4-digit strings")

    if csv_parse_errors:
        print(f"\n  [WARN]  CSV parse errors: {len(csv_parse_errors)}")
        for e in csv_parse_errors[:20]:
            print(f"     Row {e['row']}: {e['raw_un']!r} — {e['reason']}")

    # Spot-checks
    SPOT_CHECKS = ["0004", "1090", "1203", "2794"]
    print(f"\n  Spot-checks:")
    index = {e["un_number"]: e for e in entries}
    for un in SPOT_CHECKS:
        if un in index:
            e = index[un]
            flag = "" if not e["_needs_english_name"] else "  [WARN] German name"
            print(f"\n  UN {un}:{flag}")
            print(f"    name:    {e['proper_shipping_name']}")
            print(f"    class:   {e['class']}  code: {e['classification_code']}  pg: {e['packing_group']}")
            print(f"    labels:  {e['labels']}")
            print(f"    LQ:      {e['limited_quantity']}  EQ: {e['excepted_quantity']}")
            print(f"    tc:      {e['transport_category']}  tunnel: {e['tunnel_restriction_code']}")
            print(f"    kemler:  {e['hazard_identification_number']}")
        else:
            print(f"\n  UN {un}: [WARN] NOT FOUND in dataset")

    # List entries still needing English names (first 20)
    if needs_en > 0:
        still_needed = [e["un_number"] for e in entries if e["_needs_english_name"]]
        print(f"\n  Entries still needing English names ({needs_en} total):")
        preview = still_needed[:20]
        print(f"    {', '.join(preview)}", end="")
        if needs_en > 20:
            print(f"  … and {needs_en - 20} more")
        else:
            print()


# ─────────────────────────────────────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────────────────────────────────────

def main():
    print("\nADR 2025 Dataset Extractor")
    print("freightutils.com\n")

    # Check sources exist
    if not CSV_PATH.exists():
        print(f"[ERR] CSV not found: {CSV_PATH}")
        sys.exit(1)

    if not PDF_PATH.exists():
        print(f"[ERR] PDF not found: {PDF_PATH}")
        print(f"  Download the ADR 2025 English PDF from:")
        print(f"  https://unece.org/transport/dangerous-goods/adr-2025")
        print(f"  Save to: lib/data/adr-2025-source.pdf")
        sys.exit(1)

    # Phase A — CSV
    entries, csv_errors = load_csv(CSV_PATH)

    # Phase B — PDF
    english_names = extract_english_names(PDF_PATH)

    # Phase C — Merge
    merged = merge(entries, english_names)

    # Write output
    print(f"\n{'='*60}")
    print("Writing output")
    print(f"{'='*60}")
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)

    size_kb = OUT_PATH.stat().st_size / 1024
    print(f"  [OK] Written: {OUT_PATH}")
    print(f"  [OK] File size: {size_kb:,.0f} KB")
    print(f"  [OK] Entries: {len(merged):,}")

    # Phase D — Validation
    validate(merged, csv_errors)

    print(f"\n{'='*60}")
    print("Done.")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
