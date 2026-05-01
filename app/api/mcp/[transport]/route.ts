import { z } from 'zod';
import { createMcpHandler } from 'mcp-handler';
import { withAuditMcp } from '@/lib/observability/audit';
import { calculateCbm } from '@/lib/calculations/cbm';
import { calculateConsignment } from '@/lib/calculations/consignment';
import { calculateShipmentSummary } from '@/lib/calculations/shipment-summary';
import { calculateDuty } from '@/lib/calculations/duty';
import { search as unlocodeSearch, lookupByCode as unlocodeLookup, TOTAL_ENTRIES as UNLOCODE_TOTAL } from '@/lib/calculations/unlocode';
import { calculateChargeableWeight, DEFAULT_FACTOR } from '@/lib/calculations/chargeable-weight';
import { calculateLdm } from '@/lib/calculations/ldm';
import { lookupByUnNumber, searchByName, filterByClass, normaliseUnNumber } from '@/lib/calculations/adr';
import { searchAirlines, filterByIata, filterByIcao, filterByPrefix, filterByCountry } from '@/lib/calculations/airlines';
import { getAllContainerSpecs, getContainerSpec } from '@/lib/calculations/container-capacity';
import { searchCodes, getCodeDetails, getChaptersBySection, getSectionByNumeral, getAllSections, TOTAL_CODES } from '@/lib/calculations/hs';
import { getAllIncoterms, lookupByCode, getAnyMode, getSeaOnly } from '@/lib/calculations/incoterms';
import { calculatePalletFitting } from '@/lib/calculations/pallet-fitting';
import { convert } from '@/lib/calculations/converter';
import { PALLET_PRESET_MAP } from '@/lib/data/pallets';
import { getAllULDs, getULD, getULDsByCategory, getULDsByDeck, ULD_COUNT } from '@/lib/calculations/uld';
import { getAllVehicles, getVehicle, getVehiclesByCategory, getVehiclesByRegion, VEHICLE_REF_COUNT } from '@/lib/calculations/vehicle-ref';
import { checkLqEq } from '@/lib/calculations/lq-eq';

// ─────────────────────────────────────────────────────────────
//  MCP Handler — Streamable HTTP transport for Vercel
// ─────────────────────────────────────────────────────────────

// Every FreightUtils tool is a read-only lookup or deterministic calculation;
// nothing mutates external state. This helper keeps the annotations consistent.
const ro = (title: string) => ({
  title,
  readOnlyHint: true as const,
  destructiveHint: false as const,
  idempotentHint: true as const,
  openWorldHint: false as const,
});

const handler = createMcpHandler(
  (server) => {

    // ── CBM Calculator ──────────────────────────────────────
    server.tool(
      'cbm_calculator',
      `Calculate cubic metres (CBM) for a shipment. CBM is the standard volume unit in international shipping. 1 CBM = 1m x 1m x 1m = 1,000 litres. Ocean freight carriers price per "freight tonne" (1 CBM or 1,000 kg, whichever is greater).`,
      {
        length_cm: z.number().positive().describe('Length in centimetres'),
        width_cm: z.number().positive().describe('Width in centimetres'),
        height_cm: z.number().positive().describe('Height in centimetres'),
        pieces: z.number().int().positive().optional().describe('Number of identical pieces (default: 1)'),
      },
      ro('CBM Calculator'),
      async ({ length_cm, width_cm, height_cm, pieces }) => ({
        content: [{ type: 'text' as const, text: JSON.stringify(
          calculateCbm({ lengthCm: length_cm, widthCm: width_cm, heightCm: height_cm, pieces: pieces ?? 1 }), null, 2
        )}],
      }),
    );

    // ── Chargeable Weight Calculator ────────────────────────
    server.tool(
      'chargeable_weight_calculator',
      `Calculate air freight chargeable weight (volumetric vs actual). Airlines charge the greater of actual weight or volumetric weight. IATA standard factor: 6,000 (1 CBM = 166.67 kg). A ratio > 1.0 means volumetric (light for its size).`,
      {
        length_cm: z.number().positive().describe('Length in centimetres'),
        width_cm: z.number().positive().describe('Width in centimetres'),
        height_cm: z.number().positive().describe('Height in centimetres'),
        gross_weight_kg: z.number().positive().describe('Actual gross weight in kilograms'),
        pieces: z.number().int().positive().optional().describe('Number of identical pieces (default: 1)'),
        factor: z.number().int().positive().optional().describe('Volumetric divisor (default: 6000)'),
      },
      ro('Chargeable Weight Calculator'),
      async ({ length_cm, width_cm, height_cm, gross_weight_kg, pieces, factor }) => ({
        content: [{ type: 'text' as const, text: JSON.stringify(
          calculateChargeableWeight({
            lengthCm: length_cm, widthCm: width_cm, heightCm: height_cm,
            grossWeightKg: gross_weight_kg, pieces: pieces ?? 1, factor: factor ?? DEFAULT_FACTOR,
          }), null, 2
        )}],
      }),
    );

    // ── LDM Calculator ──────────────────────────────────────
    server.tool(
      'ldm_calculator',
      `Calculate loading metres (LDM) for road freight. LDM measures trailer utilisation. European trailers are 13.6m long, 2.4m wide. Supports pallet presets (euro, uk, half, quarter) and vehicles (artic, rigid10, rigid75, luton).`,
      {
        pallet: z.enum(['euro', 'uk', 'half', 'quarter']).optional().describe('Pallet preset'),
        length_mm: z.number().positive().optional().describe('Custom pallet length in mm'),
        width_mm: z.number().positive().optional().describe('Custom pallet width in mm'),
        quantity: z.number().int().positive().optional().describe('Number of pallets (default: 1)'),
        stackable: z.boolean().optional().describe('Can pallets be stacked?'),
        stack_height: z.number().int().min(2).max(3).optional().describe('Stack height 2 or 3'),
        weight_kg: z.number().positive().optional().describe('Weight per pallet in kg'),
        vehicle: z.enum(['artic', 'rigid10', 'rigid75', 'luton', 'custom']).optional().describe('Vehicle type'),
        vehicle_length_m: z.number().positive().optional().describe('Custom vehicle length in m'),
      },
      ro('LDM Calculator'),
      async (args) => {
        const preset = args.pallet ? PALLET_PRESET_MAP[args.pallet] : undefined;
        const lengthMm = preset?.lengthMm ?? args.length_mm;
        const widthMm = preset?.widthMm ?? args.width_mm;
        if (!lengthMm || !widthMm) {
          return { content: [{ type: 'text' as const, text: 'Error: Provide pallet preset or length_mm + width_mm' }], isError: true };
        }
        const vehicleId = args.vehicle ?? 'artic';
        const result = calculateLdm({
          lengthMm, widthMm, qty: args.quantity ?? 1,
          stackable: args.stackable ?? false, stackFactor: args.stack_height ?? 2,
          weightPerPalletKg: args.weight_kg ?? null,
          vehicleId, customVehicleLengthM: args.vehicle_length_m ?? null,
        });
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      },
    );

    // ── ADR Lookup ───────────────────────────────────────────
    server.tool(
      'adr_lookup',
      `Look up dangerous goods from the ADR 2025 database (2,939 entries). Provide a UN number for exact lookup, or a search term for name-based search. Returns hazard class, packing group, labels, tunnel codes, and transport categories.`,
      {
        un_number: z.string().optional().describe('UN number (e.g., "1203")'),
        search: z.string().optional().describe('Search by substance name'),
        hazard_class: z.string().optional().describe('Filter by hazard class'),
      },
      ro('ADR Dangerous Goods Lookup'),
      async ({ un_number, search, hazard_class }) => {
        let results;
        if (un_number) {
          const norm = normaliseUnNumber(un_number);
          results = norm ? lookupByUnNumber(norm) : [];
        } else if (search) {
          results = searchByName(search);
        } else if (hazard_class) {
          results = filterByClass(hazard_class);
        } else {
          return { content: [{ type: 'text' as const, text: 'Error: Provide un_number, search, or hazard_class' }], isError: true };
        }
        return { content: [{ type: 'text' as const, text: JSON.stringify({ count: results.length, results }, null, 2) }] };
      },
    );

    // ── ADR Exemption Calculator ────────────────────────────
    server.tool(
      'adr_exemption_calculator',
      `Calculate ADR 1.1.3.6 exemption. Points = quantity x multiplier per transport category. Total <= 1,000 = exempt from full ADR requirements. For single substance: provide un_number + quantity. For mixed loads: provide items array.`,
      {
        un_number: z.string().optional().describe('UN number for single check'),
        quantity: z.number().positive().optional().describe('Quantity in kg/L'),
        items: z.array(z.object({
          un_number: z.string(),
          quantity: z.number().positive(),
        })).optional().describe('Array of items for mixed-load check'),
      },
      ro('ADR 1.1.3.6 Exemption Calculator'),
      async ({ un_number, quantity, items }) => {
        // Build items list
        const itemList = items ?? (un_number && quantity ? [{ un_number, quantity }] : []);
        if (itemList.length === 0) {
          return { content: [{ type: 'text' as const, text: 'Error: Provide un_number+quantity or items array' }], isError: true };
        }

        let totalPoints = 0;
        let hasCategoryZero = false;
        let hasQuantityExceedance = false;
        const warnings: string[] = [];
        const calculated = itemList.map(item => {
          const norm = normaliseUnNumber(item.un_number);
          const entries = norm ? lookupByUnNumber(norm) : [];
          const entry = entries[0];
          if (!entry) {
            warnings.push(`UN ${item.un_number} not found`);
            return { un_number: item.un_number, quantity: item.quantity, points: null, multiplier: null, transport_category: null, proper_shipping_name: 'Unknown' };
          }
          const tc = entry.transport_category ?? '';
          if (tc === '0') { hasCategoryZero = true; warnings.push(`UN ${item.un_number} is transport category 0 — cannot use 1.1.3.6 exemption`); }
          const multiplierMap: Record<string, number> = { '0': 0, '1': 50, '2': 3, '3': 1, '4': 0 };
          const mult = tc ? (multiplierMap[tc] ?? 0) : 0;
          const pts = item.quantity * mult;
          totalPoints += pts;
          return { un_number: entry.un_number, proper_shipping_name: entry.proper_shipping_name, class: entry.class, transport_category: tc, quantity: item.quantity, multiplier: mult, points: pts };
        });

        const exempt = totalPoints <= 1000 && !hasCategoryZero && !hasQuantityExceedance;
        return { content: [{ type: 'text' as const, text: JSON.stringify({
          items: calculated, total_points: totalPoints, threshold: 1000,
          exempt, has_category_zero: hasCategoryZero, warnings,
          message: exempt ? 'Load qualifies for 1.1.3.6 exemption' : 'Full ADR compliance required',
        }, null, 2) }] };
      },
    );

    // ── Airline Lookup ───────────────────────────────────────
    server.tool(
      'airline_lookup',
      `Search 6,352 airlines by name, IATA/ICAO code, AWB prefix, or country. AWB prefixes are 3-digit codes on air waybills identifying the carrier (e.g., 176 = Emirates).`,
      {
        query: z.string().optional().describe('General search'),
        iata: z.string().optional().describe('Exact IATA code (2 chars)'),
        icao: z.string().optional().describe('Exact ICAO code (3 chars)'),
        prefix: z.string().optional().describe('AWB prefix (3 digits)'),
        country: z.string().optional().describe('Filter by country'),
      },
      ro('Airline / AWB Prefix Lookup'),
      async ({ query, iata, icao, prefix, country }) => {
        let results;
        if (iata) results = filterByIata(iata);
        else if (icao) results = filterByIcao(icao);
        else if (prefix) results = filterByPrefix(prefix);
        else if (country) results = filterByCountry(country);
        else if (query) results = searchAirlines(query);
        else return { content: [{ type: 'text' as const, text: 'Error: Provide query, iata, icao, prefix, or country' }], isError: true };
        return { content: [{ type: 'text' as const, text: JSON.stringify({ count: results.length, results: results.slice(0, 50) }, null, 2) }] };
      },
    );

    // ── Container Lookup ────────────────────────────────────
    server.tool(
      'container_lookup',
      `Get ISO shipping container specs (10 types: 20ft, 40ft, 40ft HC, reefer, open-top, flat-rack, 45ft). Returns dimensions, capacity, weight limits, and pallet counts.`,
      {
        type: z.string().optional().describe('Container slug (e.g., "20ft-standard", "40ft-high-cube"). Omit to list all.'),
      },
      ro('Container Lookup'),
      async ({ type }) => {
        if (type) {
          const spec = getContainerSpec(type);
          if (!spec) return { content: [{ type: 'text' as const, text: `Error: Unknown container type "${type}"` }], isError: true };
          return { content: [{ type: 'text' as const, text: JSON.stringify(spec, null, 2) }] };
        }
        return { content: [{ type: 'text' as const, text: JSON.stringify({ count: getAllContainerSpecs().length, results: getAllContainerSpecs() }, null, 2) }] };
      },
    );

    // ── HS Code Lookup ──────────────────────────────────────
    server.tool(
      'hs_code_lookup',
      `Search 6,940 Harmonized System tariff codes. HS codes are 6-digit international product classification codes used for customs. Provide a search term or exact code.`,
      {
        query: z.string().optional().describe('Search by product description'),
        code: z.string().optional().describe('Exact HS code (2-6 digits)'),
        section: z.string().optional().describe('Browse by section (Roman numeral)'),
      },
      ro('HS Code Lookup'),
      async ({ query, code, section }) => {
        if (code) {
          const detail = getCodeDetails(code);
          if (!detail) return { content: [{ type: 'text' as const, text: `HS code "${code}" not found` }], isError: true };
          return { content: [{ type: 'text' as const, text: JSON.stringify(detail, null, 2) }] };
        }
        if (section) {
          const sec = getSectionByNumeral(section);
          if (!sec) return { content: [{ type: 'text' as const, text: `Section "${section}" not found` }], isError: true };
          return { content: [{ type: 'text' as const, text: JSON.stringify({ section: sec, chapters: getChaptersBySection(section) }, null, 2) }] };
        }
        if (query) {
          const results = searchCodes(query);
          return { content: [{ type: 'text' as const, text: JSON.stringify({ query, count: results.length, results: results.slice(0, 50) }, null, 2) }] };
        }
        return { content: [{ type: 'text' as const, text: JSON.stringify({ sections: getAllSections(), total_codes: TOTAL_CODES }, null, 2) }] };
      },
    );

    // ── Incoterms Lookup ────────────────────────────────────
    server.tool(
      'incoterms_lookup',
      `Look up Incoterms 2020 trade rules. 11 rules defining transport, insurance, customs responsibilities. 7 for any mode (EXW, FCA, CPT, CIP, DAP, DPU, DDP), 4 sea-only (FAS, FOB, CFR, CIF).`,
      {
        code: z.string().optional().describe('Incoterm code (e.g., "FOB", "CIF")'),
        category: z.enum(['any_mode', 'sea_only']).optional().describe('Filter by mode'),
      },
      ro('Incoterms 2020 Lookup'),
      async ({ code, category }) => {
        if (code) {
          const term = lookupByCode(code.toUpperCase());
          if (!term) return { content: [{ type: 'text' as const, text: `Incoterm "${code}" not found` }], isError: true };
          return { content: [{ type: 'text' as const, text: JSON.stringify(term, null, 2) }] };
        }
        const results = category === 'sea_only' ? getSeaOnly() : category === 'any_mode' ? getAnyMode() : getAllIncoterms();
        return { content: [{ type: 'text' as const, text: JSON.stringify({ count: results.length, results }, null, 2) }] };
      },
    );

    // ── Pallet Fitting Calculator ───────────────────────────
    server.tool(
      'pallet_fitting_calculator',
      `Calculate how many boxes fit on a pallet with layers, rotation, and weight limits. Determines optimal arrangement and volume utilisation.`,
      {
        pallet_length_cm: z.number().positive().describe('Pallet length in cm'),
        pallet_width_cm: z.number().positive().describe('Pallet width in cm'),
        pallet_max_height_cm: z.number().positive().describe('Max stack height in cm'),
        pallet_deck_height_cm: z.number().positive().optional().describe('Pallet deck height (default: 15cm)'),
        box_length_cm: z.number().positive().describe('Box length in cm'),
        box_width_cm: z.number().positive().describe('Box width in cm'),
        box_height_cm: z.number().positive().describe('Box height in cm'),
        box_weight_kg: z.number().positive().optional().describe('Box weight in kg'),
        max_payload_kg: z.number().positive().optional().describe('Max pallet payload in kg'),
        allow_rotation: z.boolean().optional().describe('Allow 90-degree rotation (default: true)'),
      },
      ro('Pallet Fitting Calculator'),
      async (args) => ({
        content: [{ type: 'text' as const, text: JSON.stringify(
          calculatePalletFitting({
            palletLengthCm: args.pallet_length_cm, palletWidthCm: args.pallet_width_cm,
            palletMaxHeightCm: args.pallet_max_height_cm, palletHeightCm: args.pallet_deck_height_cm ?? 15,
            boxLengthCm: args.box_length_cm, boxWidthCm: args.box_width_cm, boxHeightCm: args.box_height_cm,
            boxWeightKg: args.box_weight_kg ?? undefined, maxPayloadWeightKg: args.max_payload_kg ?? undefined,
            allowRotation: args.allow_rotation ?? true,
          }), null, 2
        )}],
      }),
    );

    // ── Unit Converter ──────────────────────────────────────
    server.tool(
      'unit_converter',
      `Convert between freight units. Weight: kg, lbs, oz, tonnes, short_tons, long_tons. Volume: cbm, cuft, cuin, litres, gal_us, gal_uk. Length: cm, inches, m, feet, mm. Freight: cbm→chargeable_kg, cbm→freight_tonnes.`,
      {
        value: z.number().describe('Value to convert'),
        from: z.string().describe('Source unit'),
        to: z.string().describe('Target unit'),
      },
      ro('Unit Converter'),
      async ({ value, from, to }) => {
        const result = convert(value, from, to);
        if (!result) return { content: [{ type: 'text' as const, text: `Cannot convert from "${from}" to "${to}"` }], isError: true };
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      },
    );

    // ── Consignment Calculator ────────────────────────────
    server.tool(
      'consignment_calculator',
      `Calculate total CBM, weight, LDM, and chargeable weight for multi-item mixed consignments. Accepts multiple line items with different dimensions, weights, and stackability. Returns per-item breakdown, grand totals, trailer utilisation, and suggested vehicle.`,
      {
        items: z.array(z.object({
          description: z.string().optional().describe('Item label'),
          length: z.number().positive().describe('Length in cm'),
          width: z.number().positive().describe('Width in cm'),
          height: z.number().positive().describe('Height in cm'),
          quantity: z.number().int().positive().describe('Number of pieces'),
          gross_weight: z.number().describe('Weight per piece in kg'),
          stackable: z.boolean().optional().describe('Can items be stacked?'),
          pallet_type: z.enum(['none', 'euro', 'uk', 'us']).optional().describe('Pallet type'),
        })).describe('Array of consignment items'),
      },
      ro('Consignment Calculator'),
      async ({ items }) => {
        // Boundary mapper: snake_case (canonical schema, matches freightutils-mcp@2.0.0)
        // → camelCase (internal calculateConsignment signature). Internal helper unchanged.
        const mapped = items.map((i) => ({
          description: i.description,
          lengthCm: i.length,
          widthCm: i.width,
          heightCm: i.height,
          quantity: i.quantity,
          grossWeightKg: i.gross_weight,
          stackable: i.stackable,
          palletType: i.pallet_type,
        }));
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(calculateConsignment(mapped), null, 2) }],
        };
      },
    );

    // ── UN/LOCODE Lookup ────────────────────────────────────
    server.tool(
      'unlocode_lookup',
      `Search ${UNLOCODE_TOTAL.toLocaleString()} UN/LOCODE transport locations worldwide. Covers seaports, airports, rail terminals, road terminals, inland clearance depots, and border crossings. Search by location name, code (e.g. GBLHR), country, or function type.`,
      {
        query: z.string().optional().describe('Search by name or code (e.g. "Rotterdam", "GBLHR", "LHR")'),
        code: z.string().optional().describe('Exact UN/LOCODE lookup (e.g. "GBLHR", "NLRTM")'),
        country: z.string().optional().describe('ISO 2-letter country code filter (e.g. "GB", "NL")'),
        function_type: z.enum(['port', 'airport', 'rail', 'road', 'icd', 'border']).optional().describe('Filter by location function'),
        limit: z.number().int().min(1).max(100).optional().describe('Max results (default 20)'),
      },
      ro('UN/LOCODE Lookup'),
      async ({ query, code, country, function_type, limit }) => {
        if (code) {
          const entry = unlocodeLookup(code);
          if (!entry) return { content: [{ type: 'text' as const, text: `UN/LOCODE "${code}" not found` }], isError: true };
          return { content: [{ type: 'text' as const, text: JSON.stringify(entry, null, 2) }] };
        }
        const results = unlocodeSearch(query ?? '', { country, func: function_type, limit: limit ?? 20 });
        return { content: [{ type: 'text' as const, text: JSON.stringify({ count: results.length, results }, null, 2) }] };
      },
    );

    // ── UK Import Duty & VAT Estimator ──────────────────────
    server.tool(
      'uk_duty_calculator',
      `Estimate UK import duty and VAT for a commodity code and origin country. Uses live GOV.UK Trade Tariff data. Returns CIF value, duty rate/amount, VAT rate/amount, total import taxes, and total landed cost. Flags preferential rates and import restrictions.`,
      {
        commodity_code: z.string().describe('UK tariff commodity code (6-10 digits)'),
        origin_country: z.string().describe('ISO 2-letter country of origin (e.g. "CN", "US")'),
        customs_value: z.number().positive().describe('Customs value in GBP'),
        freight_cost: z.number().optional().describe('Freight cost in GBP (default 0)'),
        insurance_cost: z.number().optional().describe('Insurance cost in GBP (default 0)'),
        incoterm: z.enum(['EXW','FCA','FAS','FOB','CFR','CIF','CPT','CIP','DAP','DPU','DDP']).optional().describe('Incoterm basis'),
      },
      ro('UK Duty & VAT Calculator'),
      async ({ commodity_code, origin_country, customs_value, freight_cost, insurance_cost, incoterm }) => {
        try {
          // Boundary mapper: snake_case (canonical schema, matches freightutils-mcp@2.0.0)
          // → camelCase DutyInput (internal calculateDuty signature). Internal helper unchanged.
          const result = await calculateDuty({
            commodityCode: commodity_code,
            originCountry: origin_country,
            customsValue: customs_value,
            freightCost: freight_cost ?? 0,
            insuranceCost: insurance_cost ?? 0,
            incoterm,
          });
          return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          return { content: [{ type: 'text' as const, text: `Error: ${msg}` }], isError: true };
        }
      },
    );

    // ── Shipment Summary (composite) ────────────────────────
    server.tool(
      'shipment_summary',
      `Composite shipment summary — chains CBM, weight, LDM/volumetric/W&M, ADR compliance, and UK duty estimation into one response. Accepts multiple items with a transport mode (road/air/sea/multimodal). Returns per-mode calculations, DG compliance flags, and customs estimates.`,
      {
        mode: z.enum(['road', 'air', 'sea', 'multimodal']).describe('Transport mode'),
        items: z.array(z.object({
          description: z.string().optional(),
          length: z.number().positive().describe('Length cm'),
          width: z.number().positive().describe('Width cm'),
          height: z.number().positive().describe('Height cm'),
          weight: z.number().describe('Gross weight kg per item'),
          quantity: z.number().int().positive(),
          stackable: z.boolean().optional().describe('Whether this item can be stacked (affects pallet fitting calc)'),
          pallet_type: z.enum(['euro', 'uk', 'us', 'custom', 'none']).optional().describe('Pallet standard the item sits on, if any'),
          hs_code: z.string().optional(),
          un_number: z.string().optional(),
          customs_value: z.number().optional(),
        })).describe('Array of shipment items with dimensions, weight, and optional HS/UN codes'),
        origin: z.object({ country: z.string(), locode: z.string().optional() }).optional().describe('Origin location — ISO country code and optional UN/LOCODE'),
        destination: z.object({ country: z.string(), locode: z.string().optional() }).optional().describe('Destination location — ISO country code and optional UN/LOCODE'),
        incoterm: z.string().optional().describe("Incoterms 2020 three-letter code (e.g. 'DAP', 'EXW', 'FOB')"),
        freight_cost: z.number().optional().describe('Optional freight cost in GBP for duty calculation'),
        insurance_cost: z.number().optional().describe('Optional insurance cost in GBP for duty calculation'),
      },
      ro('Shipment Summary'),
      async (args) => {
        try {
          // Boundary mapper: snake_case (canonical schema, matches freightutils-mcp@2.0.0)
          // → camelCase ShipmentRequest (internal calculateShipmentSummary signature).
          // Internal helper + ShipmentItem / ShipmentRequest types unchanged.
          const mapped: Parameters<typeof calculateShipmentSummary>[0] = {
            mode: args.mode,
            items: args.items.map((i) => ({
              description: i.description,
              length: i.length,
              width: i.width,
              height: i.height,
              weight: i.weight,
              quantity: i.quantity,
              stackable: i.stackable,
              palletType: i.pallet_type,
              hsCode: i.hs_code,
              unNumber: i.un_number,
              customsValue: i.customs_value,
            })),
            origin: args.origin,
            destination: args.destination,
            incoterm: args.incoterm,
            freightCost: args.freight_cost,
            insuranceCost: args.insurance_cost,
          };
          const result = await calculateShipmentSummary(mapped);
          return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          return { content: [{ type: 'text' as const, text: `Error: ${msg}` }], isError: true };
        }
      },
    );

    // ── ULD Lookup ───────────────────────────────────────────
    server.tool(
      'uld_lookup',
      `Look up air freight ULD (Unit Load Device) specs. ${ULD_COUNT} types including AKE (LD3), PMC, PLA, and special units. Returns dimensions, weights, volume, aircraft compatibility, and deck position.`,
      {
        type: z.string().optional().describe('ULD code (e.g., "AKE", "PMC"). Omit to list all.'),
        category: z.enum(['container', 'pallet', 'special']).optional().describe('Filter by ULD category'),
        deck: z.enum(['lower', 'main']).optional().describe('Filter by deck position'),
      },
      ro('Air Cargo ULD Lookup'),
      async ({ type, category, deck }) => {
        if (type) {
          const uld = getULD(type);
          if (!uld) return { content: [{ type: 'text' as const, text: `Error: ULD "${type}" not found` }], isError: true };
          return { content: [{ type: 'text' as const, text: JSON.stringify(uld, null, 2) }] };
        }
        let results = getAllULDs();
        if (category) results = getULDsByCategory(category);
        if (deck) results = getULDsByDeck(deck);
        return { content: [{ type: 'text' as const, text: JSON.stringify({ count: results.length, results }, null, 2) }] };
      },
    );

    // ── Vehicle/Trailer Lookup ─────────────────────────────────
    server.tool(
      'vehicle_lookup',
      `Look up road freight vehicle and trailer specs. ${VEHICLE_REF_COUNT} types: curtainsiders, rigids, vans, US trailers. Returns internal dimensions, payload limits, pallet capacity, and features.`,
      {
        slug: z.string().optional().describe('Vehicle slug (e.g., "standard-curtainsider"). Omit to list all.'),
        category: z.enum(['articulated', 'rigid', 'van']).optional().describe('Filter by category'),
        region: z.enum(['EU', 'US']).optional().describe('Filter by region'),
      },
      ro('Vehicle Lookup'),
      async ({ slug, category, region }) => {
        if (slug) {
          const v = getVehicle(slug);
          if (!v) return { content: [{ type: 'text' as const, text: `Error: Vehicle "${slug}" not found` }], isError: true };
          return { content: [{ type: 'text' as const, text: JSON.stringify(v, null, 2) }] };
        }
        let results = getAllVehicles();
        if (category) results = getVehiclesByCategory(category);
        if (region) results = getVehiclesByRegion(region);
        return { content: [{ type: 'text' as const, text: JSON.stringify({ count: results.length, results }, null, 2) }] };
      },
    );

    // ── Subscribe Link ──────────────────────────────────────────
    server.tool(
      'get_subscribe_link',
      `Get the URL where the user can subscribe to FreightUtils Pro for higher API limits. Use this when the user asks how to upgrade, hits a rate limit, or asks about pricing. Returns the URL where the user can subscribe via web — agents must NOT attempt to complete the subscription themselves.`,
      {
        tier: z.enum(['pro']).optional().describe('Tier to surface (only "pro" supported today)'),
      },
      ro('FreightUtils Subscribe Link'),
      async () => ({
        content: [{ type: 'text' as const, text: JSON.stringify({
          url: 'https://www.freightutils.com/pricing',
          tier: 'pro',
          monthly_limit: 50000,
          monthly_price: '£19',
          currency: 'GBP',
          note: 'Open the URL in a browser to subscribe. Agents must not attempt to complete checkout themselves.',
        }, null, 2) }],
      }),
    );

    // ── ADR LQ/EQ Checker ──────────────────────────────────────
    server.tool(
      'adr_lq_eq_check',
      `Check if dangerous goods qualify for ADR Limited Quantity (LQ) or Excepted Quantity (EQ) exemptions. LQ allows reduced requirements for small quantities per inner packaging (ADR 3.4). EQ applies to very small quantities (ADR 3.5, codes E1-E5). Checks multiple items at once.`,
      {
        mode: z.enum(['lq', 'eq']).describe('Check mode: lq (Limited Quantity) or eq (Excepted Quantity)'),
        items: z.array(z.object({
          un_number: z.string().describe('4-digit UN number'),
          quantity: z.number().positive().describe('Quantity of substance'),
          unit: z.enum(['ml', 'L', 'g', 'kg']).describe('Unit of measurement'),
          inner_packaging_qty: z.number().int().positive().optional().describe('Number of inner packagings (EQ mode only)'),
        })).describe('Items to check'),
      },
      ro('ADR LQ / EQ Exemption Check'),
      async ({ mode, items }) => {
        try {
          const result = checkLqEq(mode, items as Parameters<typeof checkLqEq>[1]);
          return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          return { content: [{ type: 'text' as const, text: `Error: ${msg}` }], isError: true };
        }
      },
    );

    // NOTE: list_prompts / list_resources stubs were tried here but caused the
    // Vercel serverless function to hang (60s timeout → 504). Reverted.
    // Accepting -5 pt on Smithery prompts score until a safe pattern is found.

  },
  {
    serverInfo: {
      name: 'freightutils-mcp',
      version: '1.0.8',
    },
  },
  { basePath: '/api/mcp' },
);

// ─────────────────────────────────────────────────────────────
//  Request logging wrapper for debugging MCP client issues
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
//  Route exports
//
//  Audit wrapping happens at lib/observability/audit.ts → withAuditMcp.
//  The wrapper reads the JSON-RPC body once to extract the tool name
//  (params.name on tools/call; otherwise the bare method like initialize
//  / tools/list), reconstructs the request for the handler, and emits a
//  single `[fu-audit]` JSON line per request including status, duration,
//  client bucket, country/region, and has_api_key boolean. NO bodies,
//  NO API key values, NO IPs, NO emails — see lib/observability/audit.ts
//  for the full privacy contract.
// ─────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
  'Access-Control-Max-Age': '86400',
};

// HEAD — health checks from MCP registries and monitoring
export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'text/event-stream',
    },
  });
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

// Wrap MCP handler with audit logging
export const GET = withAuditMcp('GET', handler);
export const POST = withAuditMcp('POST', handler);
export const DELETE = withAuditMcp('DELETE', handler);
