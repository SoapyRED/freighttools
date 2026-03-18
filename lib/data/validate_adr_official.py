"""
validate_adr_official.py — Compare adr-2025.json against official UNECE ADR 2025 Excel
=======================================================================================
Usage:
    python lib/data/validate_adr_official.py

Reads ADR2025_tabA_E.xlsx and lib/data/adr-2025.json, produces a validation report
at lib/data/adr_validation_report.json. Does NOT modify adr-2025.json.
"""

import json
import re
import sys
from pathlib import Path

try:
    import pandas as pd
except ImportError:
    print("[ERR] pandas is not installed. Run: pip install pandas openpyxl")
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent.parent
EXCEL_PATH = ROOT / "ADR2025_tabA_E.xlsx"
JSON_PATH = ROOT / "lib" / "data" / "adr-2025.json"
REPORT_PATH = ROOT / "lib" / "data" / "adr_validation_report.json"


def clean(val):
    """Strip whitespace/newlines from a value, return None for NaN."""
    if pd.isna(val):
        return None
    s = str(val).strip().replace("\n", " ").replace("\r", "")
    # collapse multiple spaces
    s = re.sub(r"\s+", " ", s)
    return s if s else None


def parse_tunnel_col(val):
    """
    Parse column 17 which contains transport category and tunnel code.
    Format examples:
      "1\n(B1000C)"  → ("1", "(B1000C)")
      "4\n(E)"       → ("4", "(E)")
      "-\n(-)"       → ("-", "(-)")
      "2\n(D/E)"     → ("2", "(D/E)")
    """
    if pd.isna(val):
        return None, None
    s = str(val).strip()
    # Split on newline — transport category is before, tunnel code after
    parts = s.split("\n")
    if len(parts) >= 2:
        tc = parts[0].strip()
        tunnel = parts[1].strip()
    else:
        # Try to split on parenthesis
        m = re.match(r"^(\S+)\s*(\(.*\))$", s)
        if m:
            tc = m.group(1)
            tunnel = m.group(2)
        else:
            tc = s
            tunnel = None
    return tc if tc else None, tunnel if tunnel else None


def parse_labels(val):
    """Parse labels field into a sorted list of strings for comparison."""
    if val is None:
        return []
    s = str(val).strip()
    if not s:
        return []
    # Labels may be separated by +, comma, or newline
    parts = re.split(r"[+,\n]+", s)
    return sorted(p.strip() for p in parts if p.strip())


def normalize_psn(name):
    """Normalize proper shipping name for comparison."""
    if name is None:
        return None
    # Strip, collapse whitespace, uppercase for comparison
    s = re.sub(r"\s+", " ", str(name).strip())
    return s


def main():
    if not EXCEL_PATH.exists():
        print(f"[ERR] Excel file not found: {EXCEL_PATH}")
        sys.exit(1)
    if not JSON_PATH.exists():
        print(f"[ERR] JSON file not found: {JSON_PATH}")
        sys.exit(1)

    # --- Load Excel ---
    print(f"Reading {EXCEL_PATH.name}...")
    df = pd.read_excel(EXCEL_PATH, sheet_name="ADR2025", header=0)

    # Skip the 3 metadata rows: filter to rows where UN No. is numeric
    un_col = df.columns[0]
    data = df[pd.to_numeric(df[un_col], errors="coerce").notna()].copy()
    data[un_col] = data[un_col].astype(int)

    total_excel_rows = len(data)
    unique_uns_excel = sorted(data[un_col].unique())
    total_unique = len(unique_uns_excel)

    print(f"  Excel: {total_excel_rows} data rows, {total_unique} unique UN numbers")

    # --- Load JSON ---
    print(f"Reading {JSON_PATH.name}...")
    with open(JSON_PATH, encoding="utf-8") as f:
        json_entries = json.load(f)
    total_json = len(json_entries)
    print(f"  JSON: {total_json} entries")

    # Build lookup: un_number (as int) → entry
    json_lookup = {}
    for entry in json_entries:
        un = int(entry["un_number"])
        json_lookup[un] = entry

    json_uns = set(json_lookup.keys())
    excel_uns = set(unique_uns_excel)

    # --- Missing from JSON ---
    missing_from_json = sorted(excel_uns - json_uns)
    only_in_json = sorted(json_uns - excel_uns)

    # --- Build Excel lookup: first row per UN (for field comparison) ---
    # For UNs with multiple rows, take the first row as the "primary" entry
    excel_lookup = {}
    variants_collapsed = []
    for un in unique_uns_excel:
        rows = data[data[un_col] == un]
        count = len(rows)
        first = rows.iloc[0]
        excel_lookup[un] = first
        if count > 1 and un in json_lookup:
            variants_collapsed.append({
                "un_number": f"{un:04d}",
                "json_entries": 1,
                "excel_entries": count,
            })

    # --- Column indices ---
    COL_NAME = df.columns[1]
    COL_CLASS = df.columns[2]
    COL_CLASSIF = df.columns[3]
    COL_PG = df.columns[4]
    COL_LABELS = df.columns[5]
    COL_SPECIAL = df.columns[6]
    COL_LIMITED = df.columns[7]
    COL_EXCEPTED = df.columns[8]
    COL_TUNNEL = df.columns[17]
    COL_HAZID = df.columns[22]

    # --- Compare fields ---
    field_mismatches = []

    def compare(un_number, field_name, json_val, excel_val):
        """Compare two values, log mismatch if different."""
        # Normalize both to strings for comparison
        j = str(json_val).strip() if json_val is not None else None
        e = str(excel_val).strip() if excel_val is not None else None
        # Treat empty string as None
        if j == "" or j == "None":
            j = None
        if e == "" or e == "None":
            e = None
        if j != e:
            field_mismatches.append({
                "un_number": f"{un_number:04d}",
                "field": field_name,
                "current": json_val,
                "official": excel_val,
            })

    def compare_labels(un_number, json_val, excel_val):
        """Compare label lists."""
        j_labels = sorted(json_val) if isinstance(json_val, list) else parse_labels(json_val)
        e_labels = parse_labels(excel_val)
        if j_labels != e_labels:
            field_mismatches.append({
                "un_number": f"{un_number:04d}",
                "field": "labels",
                "current": json_val if isinstance(json_val, list) else j_labels,
                "official": e_labels,
            })

    for un in sorted(excel_uns & json_uns):
        je = json_lookup[un]
        ex = excel_lookup[un]

        # Proper shipping name
        excel_psn = normalize_psn(clean(ex[COL_NAME]))
        json_psn = normalize_psn(je.get("proper_shipping_name"))
        if json_psn != excel_psn:
            field_mismatches.append({
                "un_number": f"{un:04d}",
                "field": "proper_shipping_name",
                "current": je.get("proper_shipping_name"),
                "official": excel_psn,
            })

        # Class
        compare(un, "class", je.get("class"), clean(ex[COL_CLASS]))

        # Classification code
        compare(un, "classification_code", je.get("classification_code"), clean(ex[COL_CLASSIF]))

        # Packing group
        json_pg = je.get("packing_group")
        excel_pg = clean(ex[COL_PG])
        compare(un, "packing_group", json_pg, excel_pg)

        # Labels
        compare_labels(un, je.get("labels"), clean(ex[COL_LABELS]))

        # Special provisions
        json_sp = je.get("special_provisions")
        excel_sp = clean(ex[COL_SPECIAL])
        # Normalize: JSON may store as string or list
        if isinstance(json_sp, list):
            json_sp_str = " ".join(str(s) for s in json_sp) if json_sp else None
        else:
            json_sp_str = str(json_sp).strip() if json_sp else None
        compare(un, "special_provisions", json_sp_str, excel_sp)

        # Limited quantity
        compare(un, "limited_quantity", je.get("limited_quantity"), clean(ex[COL_LIMITED]))

        # Excepted quantity
        compare(un, "excepted_quantity", je.get("excepted_quantity"), clean(ex[COL_EXCEPTED]))

        # Transport category + tunnel code
        tc, tunnel = parse_tunnel_col(ex[COL_TUNNEL])
        compare(un, "transport_category", je.get("transport_category"), tc)
        # Tunnel code: our JSON stores without parens sometimes, Excel has parens
        json_tunnel = je.get("tunnel_restriction_code")
        if json_tunnel is not None:
            json_tunnel = str(json_tunnel).strip()
        excel_tunnel = tunnel
        # Normalize: strip outer parens for comparison
        def strip_parens(v):
            if v is None:
                return None
            v = v.strip()
            if v.startswith("(") and v.endswith(")"):
                v = v[1:-1].strip()
            return v if v and v != "-" else None
        j_tc = strip_parens(json_tunnel)
        e_tc = strip_parens(excel_tunnel)
        if j_tc != e_tc:
            field_mismatches.append({
                "un_number": f"{un:04d}",
                "field": "tunnel_restriction_code",
                "current": json_tunnel,
                "official": excel_tunnel,
            })

        # Hazard identification number
        json_hid = je.get("hazard_identification_number")
        excel_hid = clean(ex[COL_HAZID])
        # Normalize: Excel may have float like 33.0 → "33"
        if excel_hid and "." in excel_hid:
            try:
                excel_hid = str(int(float(excel_hid)))
            except ValueError:
                pass
        if json_hid is not None:
            json_hid = str(json_hid).strip()
            if json_hid and "." in json_hid:
                try:
                    json_hid = str(int(float(json_hid)))
                except ValueError:
                    pass
        compare(un, "hazard_identification_number", json_hid, excel_hid)

    # --- Build report ---
    # Count mismatches by field
    mismatch_by_field = {}
    for m in field_mismatches:
        f = m["field"]
        mismatch_by_field[f] = mismatch_by_field.get(f, 0) + 1

    report = {
        "total_excel_rows": total_excel_rows,
        "total_excel_unique_un": total_unique,
        "total_json_entries": total_json,
        "missing_from_json": [f"{u:04d}" for u in missing_from_json],
        "only_in_json_not_excel": [f"{u:04d}" for u in only_in_json],
        "field_mismatches": field_mismatches,
        "variants_collapsed": variants_collapsed,
        "summary": {
            "total_mismatches": len(field_mismatches),
            "mismatches_by_field": mismatch_by_field,
            "total_missing_from_json": len(missing_from_json),
            "total_only_in_json": len(only_in_json),
            "total_collapsed_variants": len(variants_collapsed),
        },
    }

    # --- Write report ---
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    print(f"\nReport written to {REPORT_PATH}")

    # --- Console summary ---
    print(f"\n{'='*60}")
    print(f"  ADR VALIDATION SUMMARY")
    print(f"{'='*60}")
    print(f"  Excel data rows:        {total_excel_rows}")
    print(f"  Excel unique UN:        {total_unique}")
    print(f"  JSON entries:           {total_json}")
    print(f"  Missing from JSON:      {len(missing_from_json)}")
    if missing_from_json:
        print(f"    UNs: {', '.join(f'UN{u:04d}' for u in missing_from_json)}")
    if only_in_json:
        print(f"  Only in JSON:           {len(only_in_json)}")
        print(f"    UNs: {', '.join(f'UN{u:04d}' for u in only_in_json)}")
    print(f"  Collapsed variants:     {len(variants_collapsed)}")
    print(f"  Total field mismatches: {len(field_mismatches)}")
    print(f"\n  Mismatches by field:")
    for field, count in sorted(mismatch_by_field.items(), key=lambda x: -x[1]):
        print(f"    {field:35s} {count:>5}")
    print(f"{'='*60}")
    print("  No files were modified.")
    print()


if __name__ == "__main__":
    main()
