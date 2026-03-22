"""
Airline data enrichment from track-trace.com and airrates.com
Run: python lib/data/enrich_airlines.py
"""
import json, re, csv, io, unicodedata
from collections import defaultdict

# ── CSV data ────────────────────────────────────────────────────────
CSV_DATA = """awb_prefix,airline_name,iata_code,source
001,"American Airline",AA,airrates.com
014,"Air Canada",AC,airrates.com
055,"Alitalia Cargo",AZ,airrates.com
057,"Air France",AF,airrates.com
061,"Air Setchelles",HM,airrates.com
086,"Air New Zealand",NZ,airrates.com
098,"Air India",AI,airrates.com
105,"Finnair",AY,airrates.com
201,"Air Jamaica",JM,airrates.com
205,"AllNippon Airways",NH,airrates.com
239,"Air Mauritius",MK,airrates.com
257,"Austrian Airlines",OS,airrates.com
360,"Africa West Cargo",3L,airrates.com
524,"Absa Cargo",M3,airrates.com
507,"Aeroflot",SU,airrates.com
649,"Air Transat",TS,airrates.com
693,"Air Slovakia",GM,airrates.com
705,"Air Sahara",SU,airrates.com
771,"Azerbaijan Airline",J2,airrates.com
817,"South American Airways",AD,airrates.com
870,"Aerosvit Airline",W,airrates.com
891,"Air Ukraine",6U,airrates.com
988,"Asiana Airline",OZ,airrates.com
999,"Air China",CA,airrates.com
125,"British Airways",BA,airrates.com
236,"British Midland Airways",BD,airrates.com
236,"EVA Airways",BR,airrates.com
997,"Biman Bangladesh Airline",BG,airrates.com
002,"Cargoitalia",2G,airrates.com
005,"Continental Airlines",CO,airrates.com
160,"Cathay Pasific Airways",CX,airrates.com
297,"China Airlines Cargo",CI,airrates.com
781,"China Eastern Cargo",MU,airrates.com
784,"China Southern Airlines",CZ,airrates.com
423,"DHL Airways",ER,airrates.com
761,"DAS Air Cargo",WD,airrates.com
991,"Daallo Airlines",D3,airrates.com
071,"Ethiopian Airlines",ET,airrates.com
077,"Egypt Air",MS,airrates.com
114,"EL AL Israel",LY,airrates.com
176,"Emirate Sky Cargo",EK,airrates.com
607,"Etihad Airways",EY,airrates.com
736,"Eurofly",GJ,airrates.com
023,"Fedex Express",FX,airrates.com
072,"Gulf Air Cargo",GF,airrates.com
250,"Uzbekistan Airways",HY,airrates.com
058,"Indian Airlines",IC,airrates.com
096,"Iran Air",IR,airrates.com
635,"Yemen Airways",IY,airrates.com
131,"Japan Airline",JL,airrates.com
589,"Jet Airways",9VV,airrates.com
074,"KLM Royal Duoth Airlines",KL,airrates.com
180,"Korean Air",KE,airrates.com
229,"Kuwait Airways",KU,airrates.com
760,"Kenya Airways",KQ,airrates.com
758,"Kyrgyzstan Airlines",R8,airrates.com
020,"Lufthansa Cargo",LH,airrates.com
045,"Lanchile Cargo",LA,airrates.com
080,"Lot Polish Air",LO,airrates.com
266,"LTU International Airline",LT,airrates.com
724,"Swiss World Cargo",LX,airrates.com
182,"Malev Air Cargo",MA,airrates.com
232,"Malaysia Airlines",MH,airrates.com
537,"Mahan Airlines",W5,airrates.com
599,"Maynmar Airways",8M,airrates.com
673,"Ocean Air",VC,airrates.com
910,"Oman Air",WY,airrates.com
214,"Pakistan Inti. Airlines",PK,airrates.com
403,"Pollar Air Cargo",PO,airrates.com
081,"Qantas Airways",QF,airrates.com
157,"Qatar Airways",QR,airrates.com
070,"Syrian Arab Airlines",RB,airrates.com
281,"Tarom Romanian Air",RO,airrates.com
065,"Royal Nepal Airlines",SV,airrates.com
512,"Royal Jordanian",RJ,airrates.com
065,"Saudi Arabian Airlines",SV,airrates.com
083,"South African Airways",SA,airrates.com
117,"Scandinavian Airlines",SK,airrates.com
603,"Srilankan Airlines",UL,airrates.com
618,"Singapore Airlines",SQ,airrates.com
217,"Thai Airways",TG,airrates.com
235,"Turkish Airlines",TK,airrates.com
502,"Tajikstan Airlines",7J,airrates.com
542,"Turkmenistan Airlines",T5,airrates.com
016,"United Airlines",UA,airrates.com
037,"US Airways",US,airrates.com
406,"UPS",5X,airrates.com
670,"Transaero Airline",UN,airrates.com
738,"Vietnam Airlines",VN,airrates.com
932,"Virgin Atlantic Cargo",VS,airrates.com
567,"7Air Cargo",,track-trace.com
390,"Aegean Airlines",A3,track-trace.com
543,"Aercaribe Cargo",JK,track-trace.com
044,"Aerolineas Argentinas",AR,track-trace.com
976,"Aeroméxico Cargo",AM,track-trace.com
139,"Aeroméxico Cargo",AM,track-trace.com
057,"AF-KL-MP Cargo",AF/KL/MP,track-trace.com
074,"AF-KL-MP Cargo",AF/KL/MP,track-trace.com
198,"Afcom Cargo",MP,track-trace.com
124,"Air Algerie",AH,track-trace.com
919,"Air Anka",6K,track-trace.com
514,"Air Arabia",G9/E5/3L/3O,track-trace.com
844,"Air Arabia",G9/E5/3L/3O,track-trace.com
049,"Air Arabia",G9/E5/3L/3O,track-trace.com
452,"Air Arabia",G9/E5/3L/3O,track-trace.com
843,"Air Asia",QZ/AK/D7/XJ/FD/Z2,track-trace.com
807,"Air Asia",QZ/AK/D7/XJ/FD/Z2,track-trace.com
975,"Air Asia",QZ/AK/D7/XJ/FD/Z2,track-trace.com
940,"Air Asia",QZ/AK/D7/XJ/FD/Z2,track-trace.com
900,"Air Asia",QZ/AK/D7/XJ/FD/Z2,track-trace.com
457,"Air Asia",QZ/AK/D7/XJ/FD/Z2,track-trace.com
465,"Air Astana",KC,track-trace.com
657,"Air Baltic",BT,track-trace.com
142,"Air Belgium",KF,track-trace.com
550,"Air Belgium",KF,track-trace.com
014,"Air Canada Cargo",AC,track-trace.com
856,"Air Changan",9H,track-trace.com
999,"Air China",CA,track-trace.com
146,"Air Corsica",XK,track-trace.com
483,"Air Côte d'Ivoire",,track-trace.com
996,"Air Europa",UX,track-trace.com
631,"Air Greenland",GL,track-trace.com
730,"Air Guilin",GT,track-trace.com
288,"Air Hong Kong",LD,track-trace.com
098,"Air India",AI,track-trace.com
466,"Air Inuit",3H,track-trace.com
675,"Air Macau Cargo",NX,track-trace.com
258,"Air Madagascar",MD,track-trace.com
239,"Air Mauritius",MK,track-trace.com
086,"Air New Zealand",NZ,track-trace.com
656,"Air Niugini",PX,track-trace.com
350,"Air Premia",YP,track-trace.com
490,"Air Senegal",HC,track-trace.com
115,"Air Serbia",JU,track-trace.com
061,"Air Seychelles",HM,track-trace.com
244,"Air Tahiti Nui",TN,track-trace.com
197,"Air Tanzania",TC,track-trace.com
649,"Air Transat",TS,track-trace.com
749,"Airlink Cargo",,track-trace.com
658,"Airmax Cargo",M8,track-trace.com
994,"AIRZETA",KJ,track-trace.com
516,"Akasa Air",QP,track-trace.com
027,"Alaska Air Cargo",AS,track-trace.com
574,"AlliedAir",4W,track-trace.com
687,"Aloha Air Cargo",KH,track-trace.com
001,"American Airlines",AA,track-trace.com
810,"Amerijet International",M6,track-trace.com
205,"ANA Cargo",NH,track-trace.com
988,"Asiana Cargo",OZ,track-trace.com
756,"ASL Airlines Belgium",3V,track-trace.com
485,"Astral Aviation",8V,track-trace.com
767,"Atlantic Airways",RC,track-trace.com
827,"Atlantis ACI",EA,track-trace.com
474,"Atlantis Cargo",NT,track-trace.com
369,"Atlas Air",5Y,track-trace.com
598,"Aurora Airlines",HZ,track-trace.com
873,"Avianca Cargo Mexico",6R,track-trace.com
202,"Avianca Cargo",AV,track-trace.com
729,"Avianca Cargo",AV,track-trace.com
133,"Avianca Cargo",AV,track-trace.com
134,"Avianca Cargo",AV,track-trace.com
480,"Awesome Cargo",A7,track-trace.com
771,"AZAL Cargo",J2,track-trace.com
577,"Azul Cargo",AD,track-trace.com
829,"Bangkok Airways",PG,track-trace.com
938,"Batik Air Indonesia",ID,track-trace.com
816,"Batik Air Malaysia",OD,track-trace.com
161,"BidAir Cargo",,track-trace.com
997,"Biman Bangladesh",BG,track-trace.com
417,"Bringer Air Cargo",E6,track-trace.com
696,"Cabo Verde Airlines",VR,track-trace.com
622,"Calm Air",MO,track-trace.com
518,"Canadian North",,track-trace.com
898,"Capital Airlines",JD,track-trace.com
489,"Cargojet",W8,track-trace.com
356,"Cargolux Italia",C8,track-trace.com
172,"Cargolux",CV,track-trace.com
106,"Caribbean Airlines",BW,track-trace.com
160,"Cathay Cargo",CX,track-trace.com
378,"Cayman Airways",KX,track-trace.com
203,"Cebu Pacific Air",5J,track-trace.com
959,"Central Airlines",I9,track-trace.com
744,"Challenge Airlines BE",X7,track-trace.com
700,"Challenge Airlines IL",5C,track-trace.com
752,"Challenge Airlines MT",X6,track-trace.com
297,"China Airlines",CI,track-trace.com
112,"China Cargo Airlines",CK,track-trace.com
784,"China Southern Airlines",CZ,track-trace.com
881,"Condor",DE,track-trace.com
230,"COPA",CM,track-trace.com
395,"Corendon Airlines",XC,track-trace.com
503,"Corendon Dutch Airlines",CD,track-trace.com
923,"Corsair",SS,track-trace.com
575,"Coyne Airways",,track-trace.com
831,"Croatia Airlines",OU,track-trace.com
006,"Delta Cargo",DL,track-trace.com
615,"DHL Aviation",ES/QY/L3/7T/D0,track-trace.com
144,"DHL Aviation",ES/QY/L3/7T/D0,track-trace.com
992,"DHL Aviation",ES/QY/L3/7T/D0,track-trace.com
155,"DHL Aviation",ES/QY/L3/7T/D0,track-trace.com
947,"DHL Aviation",ES/QY/L3/7T/D0,track-trace.com
936,"DHL Aviation",ES/QY/L3/7T/D0,track-trace.com
991,"Daallo Express",D3,track-trace.com
839,"Eastar Jet",ZE,track-trace.com
077,"Egypt Air",MS,track-trace.com
114,"El Al Israel Airlines",LY,track-trace.com
176,"Emirates",EK,track-trace.com
355,"Estafeta",E7,track-trace.com
071,"Ethiopian Airlines",ET,track-trace.com
607,"Etihad Cargo",EY,track-trace.com
695,"EVA Air",BR,track-trace.com
840,"Everts Air",5V,track-trace.com
023,"Fedex Freight Cargo",FX,track-trace.com
260,"Fiji Airways",FJ,track-trace.com
105,"Finnair Cargo",AY,track-trace.com
319,"Fits Cargo",8D,track-trace.com
772,"Fly Jinnah",9P,track-trace.com
141,"flydubai Cargo",FZ,track-trace.com
593,"flynas",XY,track-trace.com
396,"French Bee",BF,track-trace.com
666,"Fuzhou Airlines",FU,track-trace.com
126,"Garuda Indonesia",GA,track-trace.com
127,"Gollog",G3,track-trace.com
283,"Greater Bay Airlines",HB,track-trace.com
072,"Gulf Air Falcon Cargo",GF,track-trace.com
872,"GX Airlines",GX,track-trace.com
880,"Hainan Airlines Cargo",HU,track-trace.com
173,"Hawaiian Airlines",HA,track-trace.com
128,"HK Express",UO,track-trace.com
851,"Hong Kong Air Cargo",RH/HX,track-trace.com
828,"Hong Kong Air Cargo",RH/HX,track-trace.com
038,"Hungary Airlines",2G,track-trace.com
125,"IAG Cargo",IB/BA/EI,track-trace.com
075,"IAG Cargo",IB/BA/EI,track-trace.com
175,"IBC Airways",II,track-trace.com
783,"Iberojet",E9,track-trace.com
108,"Icelandair",FI,track-trace.com
312,"IndiGo CarGo",6E,track-trace.com
055,"ITA",AZ,track-trace.com
702,"Jambojet",JM,track-trace.com
131,"Japan Airlines",JL,track-trace.com
486,"Jazeera Air Cargo",J9,track-trace.com
806,"Jeju Air Cargo",7C,track-trace.com
279,"JetBlue",B6,track-trace.com
718,"Jin Air",LJ,track-trace.com
018,"Juneyao Airlines",HO,track-trace.com
272,"Kalitta Air",,track-trace.com
706,"Kenya Airways Cargo",KQ,track-trace.com
643,"KM Malta Airlines",KM,track-trace.com
180,"Korean Air Cargo",KE,track-trace.com
229,"Kuwait Airways",KU,track-trace.com
068,"LAM Cargo",TM,track-trace.com
145,"LATAM Cargo",LA/L7/M3/UC,track-trace.com
045,"LATAM Cargo",LA/L7/M3/UC,track-trace.com
549,"LATAM Cargo",LA/L7/M3/UC,track-trace.com
985,"LATAM Cargo",LA/L7/M3/UC,track-trace.com
527,"LATAM Cargo",LA/L7/M3/UC,track-trace.com
990,"Lion Air",JT,track-trace.com
080,"LOT Cargo",LO,track-trace.com
859,"Lucky Air",8L,track-trace.com
020,"Lufthansa Cargo",LH,track-trace.com
344,"Lynden Air Cargo",L2,track-trace.com
763,"Maersk",DJ,track-trace.com
865,"MasAir",M7,track-trace.com
232,"MASkargo",MH,track-trace.com
805,"Mercury Americas",,track-trace.com
076,"Middle East Airlines",ME,track-trace.com
716,"MNG Airlines",MB,track-trace.com
233,"MSC Air Cargo",CP,track-trace.com
488,"My Freighter",C6,track-trace.com
123,"Nauru Airlines",ON,track-trace.com
703,"Neos",NO,track-trace.com
325,"Nile Air",NP,track-trace.com
933,"Nippon Cargo Airlines",KZ,track-trace.com
216,"Nordwind Airlines",N4,track-trace.com
179,"Norse Cargo",N0/Z0,track-trace.com
536,"Norse Cargo",N0/Z0,track-trace.com
506,"Norse Cargo",N0/Z0,track-trace.com
345,"Northern Air Cargo",NC,track-trace.com
328,"Norwegian",DY/D8,track-trace.com
910,"Oman Air Cargo",WY,track-trace.com
905,"Pacific Coastal Airlines",8P,track-trace.com
214,"Pakistan International",PK,track-trace.com
967,"PAL Airlines",,track-trace.com
624,"Pegasus Cargo",PC,track-trace.com
778,"Pelita air",IP,track-trace.com
632,"Perimeter",,track-trace.com
079,"Philippine Airlines",PR/2P,track-trace.com
224,"PLAY",OG,track-trace.com
663,"Plus Ultra",PU,track-trace.com
626,"PNG Air",CG,track-trace.com
403,"Polar Air Cargo",PO,track-trace.com
081,"Qantas",QF,track-trace.com
157,"Qatar Airways",QR,track-trace.com
273,"Rimbun Air",RI,track-trace.com
147,"Royal Air Maroc",AT,track-trace.com
672,"Royal Brunei",BI,track-trace.com
512,"Royal Jordanian",RJ,track-trace.com
459,"RwandAir",WB,track-trace.com
421,"S7 Cargo",S7,track-trace.com
117,"SAS Cargo",SK,track-trace.com
331,"SATA",S4/SP,track-trace.com
737,"SATA",S4/SP,track-trace.com
065,"Saudia Cargo",SV,track-trace.com
921,"SF Airlines",O3,track-trace.com
479,"Shenzhen Airlines",,track-trace.com
876,"Sichuan Airlines",3U,track-trace.com
463,"Silk Way Airlines",ZP,track-trace.com
501,"Silk Way West Airlines",7L,track-trace.com
618,"Singapore Airlines",SQ,track-trace.com
605,"SKY Cargo",,track-trace.com
797,"Smartwings",QS,track-trace.com
083,"South African Airw.",SA,track-trace.com
817,"South American Airw.",,track-trace.com
526,"Southwest Airlines",WN,track-trace.com
775,"SpiceJet Cargo",SG,track-trace.com
603,"SriLankan Cargo",UL,track-trace.com
242,"Stabo Air",4E,track-trace.com
189,"STARLUX",JX,track-trace.com
630,"Sunclass Airlines",DK,track-trace.com
871,"Suparna Airlines",Y8,track-trace.com
920,"Super Air Jet",IU,track-trace.com
724,"Swiss WorldCargo",LX,track-trace.com
901,"TAB Cargo",TB,track-trace.com
047,"TAP Air Cargo",TP,track-trace.com
281,"Tarom",RO,track-trace.com
217,"Thai Cargo",TG,track-trace.com
310,"Thai Lion Air",SL,track-trace.com
826,"Tianjin Airlines",GS,track-trace.com
154,"Trust Forwarding",,track-trace.com
612,"TUI",TB,track-trace.com
199,"Tunisair Cargo",TU,track-trace.com
235,"Turkish Airlines",TK,track-trace.com
542,"Turkmenistan Airlines",T5,track-trace.com
118,"TAAG Angola Airlines",DT,track-trace.com
109,"Uganda Airlines",UR,track-trace.com
016,"United Cargo",UA,track-trace.com
406,"UPS Air Cargo",5X,track-trace.com
262,"Ural Airlines",U6,track-trace.com
250,"Uzbekistan Airways",HY,track-trace.com
978,"VietJet Cargo",VJ,track-trace.com
738,"Vietnam Airlines",VN,track-trace.com
759,"Vietravel Airlines",,track-trace.com
932,"Virgin Atlantic",VS,track-trace.com
795,"Virgin Australia Cargo",VA,track-trace.com
036,"Volaris",Y4/Q6/N3,track-trace.com
621,"Volaris",Y4/Q6/N3,track-trace.com
370,"Volaris",Y4/Q6/N3,track-trace.com
847,"West Air",PN,track-trace.com
838,"WestJet Cargo",WS,track-trace.com
701,"Widerøe",WF,track-trace.com
825,"World2Fly",,track-trace.com
860,"YTO International",YG,track-trace.com
254,"Jet Club",0J,track-trace.com
877,"Tianjin Air Cargo",HT,track-trace.com
513,"Wings Air",IW,track-trace.com"""

# ── Known corrections ───────────────────────────────────────────────
# EVA Airways prefix is 695 (from track-trace), NOT 236 (airrates error)
# 236 is British Midland (defunct) - that's correct for BD
SKIP_ROWS = []  # (prefix, iata) tuples to skip
EVA_FIX = True  # 236/BR row from airrates is wrong, 695/BR from track-trace is correct

def slugify(name):
    s = unicodedata.normalize('NFKD', name).encode('ascii', 'ignore').decode()
    s = re.sub(r'[^\w\s-]', '', s).strip().lower()
    s = re.sub(r'[-\s]+', '-', s)
    return s

# ── Load current data ───────────────────────────────────────────────
with open('lib/data/airline-codes.json', encoding='utf-8') as f:
    airlines = json.load(f)

before_total = len(airlines)
before_cargo = sum(1 for a in airlines if a['has_cargo'])

# Build lookup maps
by_prefix = defaultdict(list)  # prefix -> list of airline entries
by_iata = defaultdict(list)    # iata -> list of airline entries
by_slug = {}
all_slugs = set()

for a in airlines:
    if a.get('awb_prefix'):
        for p in a['awb_prefix']:
            by_prefix[p].append(a)
    if a.get('iata_code'):
        by_iata[a['iata_code']].append(a)
    by_slug[a['slug']] = a
    all_slugs.add(a['slug'])

# ── Parse CSV ───────────────────────────────────────────────────────
reader = csv.DictReader(io.StringIO(CSV_DATA))
rows = list(reader)

# Group by airline (collect all prefixes for multi-prefix airlines)
# Key: (canonical_name, primary_iata, source) -> list of prefixes
# But we need to handle multi-code IATA fields like AF/KL/MP
airline_prefixes = defaultdict(set)  # (name, first_iata) -> set of prefixes
airline_meta = {}  # (name, first_iata) -> {iata_codes, source}

for row in rows:
    prefix = row['awb_prefix'].strip()
    name = row['airline_name'].strip()
    iata_raw = row['iata_code'].strip()
    source = row['source'].strip()

    # Skip the airrates 236/BR row (EVA Airways typo)
    if prefix == '236' and iata_raw == 'BR':
        continue

    iata_codes = [c.strip() for c in iata_raw.split('/') if c.strip()] if iata_raw else []
    first_iata = iata_codes[0] if iata_codes else ''

    key = (name, first_iata)
    airline_prefixes[key].add(prefix)

    if key not in airline_meta:
        airline_meta[key] = {'iata_codes': iata_codes, 'source': source, 'name': name}
    else:
        # Prefer track-trace over airrates
        if source == 'track-trace.com':
            airline_meta[key]['source'] = source
            airline_meta[key]['name'] = name

# ── Process enrichment ──────────────────────────────────────────────
new_airlines = []
cargo_flagged = 0
prefixes_added = []
conflicts = []

for key, prefixes in airline_prefixes.items():
    meta = airline_meta[key]
    name = meta['name']
    iata_codes = meta['iata_codes']
    first_iata = iata_codes[0] if iata_codes else None
    prefix_list = sorted(prefixes)

    # Try to find existing airline by prefix or IATA code
    matched = None

    # First try: match by any prefix
    for p in prefix_list:
        if p in by_prefix:
            candidates = by_prefix[p]
            if len(candidates) == 1:
                matched = candidates[0]
                break
            # Multiple airlines share this prefix - try to match by IATA
            for c in candidates:
                if first_iata and c.get('iata_code') == first_iata:
                    matched = c
                    break
            if matched:
                break

    # Second try: match by IATA code
    if not matched and first_iata and first_iata in by_iata:
        candidates = by_iata[first_iata]
        if len(candidates) == 1:
            matched = candidates[0]
        else:
            # Pick the one with has_cargo or best name match
            for c in candidates:
                if c['has_cargo']:
                    matched = c
                    break
            if not matched:
                matched = candidates[0]

    if matched:
        # Existing airline found - update
        changed = False

        # Ensure has_cargo is true
        if not matched['has_cargo']:
            matched['has_cargo'] = True
            cargo_flagged += 1
            changed = True

        # Add any new prefixes
        current_prefixes = set(matched.get('awb_prefix') or [])
        new_prefixes = set(prefix_list) - current_prefixes
        if new_prefixes:
            if matched['awb_prefix'] is None:
                matched['awb_prefix'] = []
            matched['awb_prefix'] = sorted(set(matched['awb_prefix']) | set(prefix_list))
            for p in new_prefixes:
                prefixes_added.append(f"{p} -> {matched['airline_name']}")
            changed = True
    else:
        # New airline - create entry
        slug = slugify(name)
        if not slug:
            slug = slugify(first_iata or 'unknown')
        orig_slug = slug
        counter = 2
        while slug in all_slugs:
            slug = f'{orig_slug}-{counter}'
            counter += 1
        all_slugs.add(slug)

        new_entry = {
            'slug': slug,
            'airline_name': name,
            'iata_code': first_iata,
            'icao_code': None,
            'awb_prefix': prefix_list,
            'callsign': None,
            'country': None,
            'has_cargo': True,
        }
        airlines.append(new_entry)
        new_airlines.append(f"{name} (IATA={first_iata or 'none'}, prefixes={prefix_list})")

        # Update lookup maps for subsequent iterations
        for p in prefix_list:
            by_prefix[p].append(new_entry)
        if first_iata:
            by_iata[first_iata].append(new_entry)
        by_slug[slug] = new_entry

# ── Sort and save ───────────────────────────────────────────────────
airlines.sort(key=lambda a: (not a['has_cargo'], a['airline_name'].lower()))

with open('lib/data/airline-codes.json', 'w', encoding='utf-8') as f:
    json.dump(airlines, f, ensure_ascii=False, indent=None, separators=(',', ':'))

after_total = len(airlines)
after_cargo = sum(1 for a in airlines if a['has_cargo'])

# ── Report ──────────────────────────────────────────────────────────
print("=" * 60)
print("AIRLINE ENRICHMENT REPORT")
print("=" * 60)
print(f"Total airlines:  {before_total} -> {after_total} (+{after_total - before_total})")
print(f"Cargo airlines:  {before_cargo} -> {after_cargo} (+{after_cargo - before_cargo})")
print()

print(f"New airlines added ({len(new_airlines)}):")
for n in sorted(new_airlines):
    print(f"  + {n}")
print()

print(f"Airlines with cargo flag added: {cargo_flagged}")
print()

print(f"Prefixes added to existing airlines ({len(prefixes_added)}):")
for p in sorted(prefixes_added):
    print(f"  + {p}")
print()

# Verify specific prefixes
print("=" * 60)
print("VERIFICATION")
print("=" * 60)
checks = {
    '510': 'Air Class',
    '047': 'TAP',
    '729': 'Avianca',
    '567': '7Air',
    '312': 'IndiGo',
    '921': 'SF Airlines',
    '978': 'VietJet',
}
for prefix, expected in checks.items():
    found = [a for a in airlines if a.get('awb_prefix') and prefix in a['awb_prefix']]
    if found:
        names = ', '.join(a['airline_name'] for a in found)
        ok = any(expected.lower() in a['airline_name'].lower() for a in found)
        status = 'OK' if ok else 'MISMATCH'
        print(f"  {prefix} -> {names} [{status}]")
    else:
        print(f"  {prefix} -> NOT FOUND [FAIL]")

print("=" * 60)
