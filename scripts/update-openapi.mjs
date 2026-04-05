import { readFileSync, writeFileSync } from 'fs';

const spec = JSON.parse(readFileSync('public/openapi.json', 'utf8'));

// Add POST /api/consignment
spec.paths['/api/consignment'] = {
  post: {
    summary: 'Multi-item consignment calculator',
    description: 'Calculate total CBM, weight, LDM, and chargeable weight for mixed consignments. Supports road, air, and sea modes.',
    operationId: 'calculateConsignment',
    tags: ['Consignment'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['items'],
            properties: {
              mode: { type: 'string', enum: ['road', 'air', 'sea'], default: 'road' },
              items: { type: 'array', items: { type: 'object', required: ['length', 'width', 'height'], properties: {
                description: { type: 'string' }, length: { type: 'number' }, width: { type: 'number' }, height: { type: 'number' },
                quantity: { type: 'integer', default: 1 }, grossWeight: { type: 'number' }, stackable: { type: 'boolean' }, palletType: { type: 'string', enum: ['none', 'euro', 'uk', 'us'] }
              }}}
            }
          }
        }
      }
    },
    responses: { '200': { description: 'Consignment calculation result' }, '400': { description: 'Validation error' } }
  }
};

// Add POST /api/duty
spec.paths['/api/duty'] = {
  post: {
    summary: 'UK import duty and VAT estimator',
    description: 'Estimate UK import duty and VAT using live GOV.UK Trade Tariff data.',
    operationId: 'estimateDuty',
    tags: ['Customs'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['commodityCode', 'originCountry', 'customsValue'],
            properties: {
              commodityCode: { type: 'string', example: '6204430000' },
              originCountry: { type: 'string', example: 'CN' },
              customsValue: { type: 'number', example: 10000 },
              freightCost: { type: 'number', example: 500 },
              insuranceCost: { type: 'number', example: 50 },
              incoterm: { type: 'string', example: 'FOB' }
            }
          }
        }
      }
    },
    responses: { '200': { description: 'Duty and VAT estimate' }, '400': { description: 'Invalid parameters' } }
  }
};

// Add GET /api/unlocode
spec.paths['/api/unlocode'] = {
  get: {
    summary: 'UN/LOCODE transport location lookup',
    description: 'Search 116,000+ UN/LOCODE entries by name, code, country, or function type.',
    operationId: 'searchUnlocode',
    tags: ['Reference'],
    parameters: [
      { name: 'q', in: 'query', description: 'Search by name or code', schema: { type: 'string' }, example: 'rotterdam' },
      { name: 'code', in: 'query', description: 'Exact UN/LOCODE', schema: { type: 'string' }, example: 'NLRTM' },
      { name: 'country', in: 'query', description: 'ISO 2-letter country', schema: { type: 'string' }, example: 'GB' },
      { name: 'function', in: 'query', description: 'Function type', schema: { type: 'string', enum: ['port', 'airport', 'rail', 'road', 'icd', 'border'] } },
      { name: 'limit', in: 'query', description: 'Max results', schema: { type: 'integer', default: 20 } }
    ],
    responses: { '200': { description: 'Search results' }, '404': { description: 'Code not found' } }
  }
};

// Add POST /api/shipment/summary
spec.paths['/api/shipment/summary'] = {
  post: {
    summary: 'Composite shipment summary',
    description: 'Chains CBM, chargeable weight, LDM, ADR compliance, and UK duty estimation into one response. The flagship composite endpoint.',
    operationId: 'shipmentSummary',
    tags: ['Composite'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['mode', 'items'],
            properties: {
              mode: { type: 'string', enum: ['road', 'air', 'sea', 'multimodal'] },
              items: { type: 'array', items: { type: 'object', required: ['length', 'width', 'height', 'weight', 'quantity'], properties: {
                description: { type: 'string' }, length: { type: 'number' }, width: { type: 'number' }, height: { type: 'number' },
                weight: { type: 'number' }, quantity: { type: 'integer' }, stackable: { type: 'boolean' },
                hsCode: { type: 'string' }, unNumber: { type: 'string' }, customsValue: { type: 'number' }
              }}},
              origin: { type: 'object', properties: { country: { type: 'string' }, locode: { type: 'string' } } },
              destination: { type: 'object', properties: { country: { type: 'string' }, locode: { type: 'string' } } },
              incoterm: { type: 'string' }, freightCost: { type: 'number' }, insuranceCost: { type: 'number' }
            }
          }
        }
      }
    },
    responses: { '200': { description: 'Complete shipment summary' }, '400': { description: 'Validation error' }, '405': { description: 'Use POST' } }
  }
};

// Add mode parameter to chargeable-weight
const cwParams = spec.paths['/api/chargeable-weight']?.get?.parameters;
if (cwParams && !cwParams.find(p => p.name === 'mode')) {
  cwParams.push({
    name: 'mode',
    in: 'query',
    description: 'Calculation mode: air (default) or sea (W/M at 1 CBM = 1 revenue tonne)',
    required: false,
    schema: { type: 'string', enum: ['air', 'sea'], default: 'air' }
  });
}

writeFileSync('public/openapi.json', JSON.stringify(spec, null, 2));
console.log('Updated. Paths:', Object.keys(spec.paths).join(', '));
