/**
 * Container Capacity Reference & Loading Calculator
 * ISO 668 / ISO 1496 standard shipping container specifications
 */

export interface ContainerSpec {
  slug: string;
  name: string;
  // Internal dimensions (cm)
  internalLengthCm: number;
  internalWidthCm: number;
  internalHeightCm: number;
  capacityCbm: number;
  // External dimensions (cm)
  externalLengthCm: number;
  externalWidthCm: number;
  externalHeightCm: number;
  // Door opening (cm)
  doorWidthCm: number | null;
  doorHeightCm: number | null;
  // Weights (kg)
  tareWeightKg: number;
  maxGrossKg: number;
  maxPayloadKg: number;
  // Pallet capacity
  euroPallets: string;
  gmaPallets: string;
  // Metadata
  description: string;
  notes: string;
}

export const CONTAINER_SPECS: ContainerSpec[] = [
  {
    slug: '20ft-standard',
    name: '20ft Standard',
    internalLengthCm: 589, internalWidthCm: 234, internalHeightCm: 238, capacityCbm: 33.2,
    externalLengthCm: 610, externalWidthCm: 244, externalHeightCm: 259,
    doorWidthCm: 234, doorHeightCm: 228,
    tareWeightKg: 2300, maxGrossKg: 30480, maxPayloadKg: 28180,
    euroPallets: '11', gmaPallets: '10',
    description: 'The workhorse of global container shipping. Ideal for dense cargo — machinery, raw materials, and consumer goods.',
    notes: 'Most common FCL unit. Also known as a TEU (Twenty-foot Equivalent Unit).',
  },
  {
    slug: '40ft-standard',
    name: '40ft Standard',
    internalLengthCm: 1203, internalWidthCm: 234, internalHeightCm: 238, capacityCbm: 67.7,
    externalLengthCm: 1219, externalWidthCm: 244, externalHeightCm: 259,
    doorWidthCm: 234, doorHeightCm: 228,
    tareWeightKg: 3750, maxGrossKg: 30480, maxPayloadKg: 26730,
    euroPallets: '23–24', gmaPallets: '20',
    description: 'Standard 40ft container — the most common size for general cargo in global trade.',
    notes: 'Equal to 2 TEU. Most frequently used container size worldwide.',
  },
  {
    slug: '40ft-high-cube',
    name: '40ft High Cube',
    internalLengthCm: 1203, internalWidthCm: 234, internalHeightCm: 269, capacityCbm: 76.3,
    externalLengthCm: 1219, externalWidthCm: 244, externalHeightCm: 290,
    doorWidthCm: 234, doorHeightCm: 259,
    tareWeightKg: 3940, maxGrossKg: 30480, maxPayloadKg: 26540,
    euroPallets: '23–24', gmaPallets: '20',
    description: 'Extra 30cm of internal height compared to a standard 40ft. Ideal for light, voluminous cargo.',
    notes: 'Most popular container for volume-sensitive cargo. 1 foot (30cm) taller than standard.',
  },
  {
    slug: '20ft-open-top',
    name: '20ft Open Top',
    internalLengthCm: 589, internalWidthCm: 234, internalHeightCm: 238, capacityCbm: 32.9,
    externalLengthCm: 610, externalWidthCm: 244, externalHeightCm: 259,
    doorWidthCm: 234, doorHeightCm: 228,
    tareWeightKg: 2360, maxGrossKg: 30480, maxPayloadKg: 28120,
    euroPallets: '11', gmaPallets: '10',
    description: 'Removable roof for top-loading of oversized or heavy cargo using cranes.',
    notes: 'Tarpaulin or removable hard-top roof. Slightly reduced internal height when roof fitted.',
  },
  {
    slug: '40ft-open-top',
    name: '40ft Open Top',
    internalLengthCm: 1203, internalWidthCm: 234, internalHeightCm: 238, capacityCbm: 67.3,
    externalLengthCm: 1219, externalWidthCm: 244, externalHeightCm: 259,
    doorWidthCm: 234, doorHeightCm: 228,
    tareWeightKg: 3900, maxGrossKg: 30480, maxPayloadKg: 26580,
    euroPallets: '23–24', gmaPallets: '20',
    description: '40ft container with removable roof for oversized cargo that cannot be loaded through doors.',
    notes: 'Used for machinery, steel coils, and project cargo.',
  },
  {
    slug: '20ft-reefer',
    name: '20ft Reefer',
    internalLengthCm: 544, internalWidthCm: 228, internalHeightCm: 218, capacityCbm: 27.0,
    externalLengthCm: 610, externalWidthCm: 244, externalHeightCm: 259,
    doorWidthCm: 228, doorHeightCm: 218,
    tareWeightKg: 3080, maxGrossKg: 30480, maxPayloadKg: 27400,
    euroPallets: '10', gmaPallets: '9',
    description: 'Temperature-controlled container for perishable goods. Reduced internal volume due to insulation and cooling unit.',
    notes: 'Temperature range typically -30°C to +30°C. Requires power supply at port and on vessel.',
  },
  {
    slug: '40ft-reefer',
    name: '40ft Reefer',
    internalLengthCm: 1159, internalWidthCm: 228, internalHeightCm: 218, capacityCbm: 57.8,
    externalLengthCm: 1219, externalWidthCm: 244, externalHeightCm: 259,
    doorWidthCm: 228, doorHeightCm: 218,
    tareWeightKg: 4800, maxGrossKg: 30480, maxPayloadKg: 25680,
    euroPallets: '21', gmaPallets: '18',
    description: '40ft temperature-controlled container. Most common reefer size for large shipments of perishable goods.',
    notes: 'Insulation reduces internal width and height. Airflow channels on floor and walls.',
  },
  {
    slug: '45ft-high-cube',
    name: '45ft High Cube',
    internalLengthCm: 1356, internalWidthCm: 234, internalHeightCm: 269, capacityCbm: 85.9,
    externalLengthCm: 1372, externalWidthCm: 244, externalHeightCm: 290,
    doorWidthCm: 234, doorHeightCm: 259,
    tareWeightKg: 4820, maxGrossKg: 30480, maxPayloadKg: 25660,
    euroPallets: '26–27', gmaPallets: '22',
    description: 'Largest standard container. Maximum volume for light cargo.',
    notes: 'Not accepted on all routes. Check with carrier before booking.',
  },
  {
    slug: '20ft-flat-rack',
    name: '20ft Flat Rack',
    internalLengthCm: 583, internalWidthCm: 234, internalHeightCm: 228, capacityCbm: 31.1,
    externalLengthCm: 610, externalWidthCm: 244, externalHeightCm: 259,
    doorWidthCm: null, doorHeightCm: null,
    tareWeightKg: 2740, maxGrossKg: 30480, maxPayloadKg: 27740,
    euroPallets: '11', gmaPallets: '10',
    description: 'Collapsible or fixed end walls with no roof or side walls. For oversized or heavy project cargo.',
    notes: 'End walls may be collapsible for flat stacking when empty. Out-of-gauge cargo accepted.',
  },
  {
    slug: '40ft-flat-rack',
    name: '40ft Flat Rack',
    internalLengthCm: 1196, internalWidthCm: 234, internalHeightCm: 228, capacityCbm: 63.8,
    externalLengthCm: 1219, externalWidthCm: 244, externalHeightCm: 259,
    doorWidthCm: null, doorHeightCm: null,
    tareWeightKg: 5000, maxGrossKg: 30480, maxPayloadKg: 25480,
    euroPallets: '23', gmaPallets: '20',
    description: '40ft flat rack for heavy machinery, vehicles, and project cargo that exceeds standard container dimensions.',
    notes: 'Used for boats, vehicles, heavy machinery, and construction equipment.',
  },
];

const SPEC_MAP = new Map<string, ContainerSpec>();
for (const c of CONTAINER_SPECS) SPEC_MAP.set(c.slug, c);

export const CONTAINER_COUNT = CONTAINER_SPECS.length;

export function getContainerSpec(slug: string): ContainerSpec | null {
  return SPEC_MAP.get(slug) ?? null;
}

export function getAllContainerSpecs(): ContainerSpec[] {
  return CONTAINER_SPECS;
}

export function getAllContainerSlugs(): string[] {
  return CONTAINER_SPECS.map(c => c.slug);
}

// ── Loading calculation ──────────────────────────────────────────

export interface LoadingResult {
  container: ContainerSpec;
  itemsPerRow: number;
  itemsPerCol: number;
  itemsPerLayer: number;
  layers: number;
  totalItemsFit: number;
  itemsRequested: number;
  allFit: boolean;
  totalWeightKg: number;
  volumeUsedCbm: number;
  volumeUtilisation: number;
  weightUtilisation: number;
  limitingFactor: 'volume' | 'weight' | 'dimensions' | 'none';
  warnings: string[];
}

export function calculateContainerLoading(
  containerSlug: string,
  itemLengthCm: number,
  itemWidthCm: number,
  itemHeightCm: number,
  itemWeightKg: number,
  quantity: number,
): LoadingResult | null {
  const container = getContainerSpec(containerSlug);
  if (!container) return null;

  const cL = container.internalLengthCm;
  const cW = container.internalWidthCm;
  const cH = container.internalHeightCm;

  // Try both orientations for floor packing
  const fitA = Math.floor(cL / itemLengthCm) * Math.floor(cW / itemWidthCm);
  const fitB = Math.floor(cL / itemWidthCm) * Math.floor(cW / itemLengthCm);

  let itemsPerRow: number, itemsPerCol: number, itemsPerLayer: number;
  if (fitA >= fitB) {
    itemsPerRow = Math.floor(cL / itemLengthCm);
    itemsPerCol = Math.floor(cW / itemWidthCm);
    itemsPerLayer = fitA;
  } else {
    itemsPerRow = Math.floor(cL / itemWidthCm);
    itemsPerCol = Math.floor(cW / itemLengthCm);
    itemsPerLayer = fitB;
  }

  const layers = itemHeightCm > 0 ? Math.floor(cH / itemHeightCm) : 0;
  const maxByVolume = itemsPerLayer * layers;

  // Weight constraint
  const maxByWeight = itemWeightKg > 0 ? Math.floor(container.maxPayloadKg / itemWeightKg) : Infinity;

  const totalItemsFit = Math.min(maxByVolume, maxByWeight);
  const allFit = quantity <= totalItemsFit;

  const actualItems = Math.min(quantity, totalItemsFit);
  const totalWeightKg = actualItems * itemWeightKg;
  const itemVolumeCbm = (itemLengthCm * itemWidthCm * itemHeightCm) / 1_000_000;
  const volumeUsedCbm = actualItems * itemVolumeCbm;
  const volumeUtilisation = container.capacityCbm > 0 ? (volumeUsedCbm / container.capacityCbm) * 100 : 0;
  const weightUtilisation = container.maxPayloadKg > 0 ? (totalWeightKg / container.maxPayloadKg) * 100 : 0;

  let limitingFactor: 'volume' | 'weight' | 'dimensions' | 'none' = 'none';
  if (maxByVolume <= maxByWeight) limitingFactor = 'volume';
  else limitingFactor = 'weight';
  if (totalItemsFit >= quantity) limitingFactor = 'none';

  const warnings: string[] = [];
  if (totalWeightKg > container.maxPayloadKg) {
    warnings.push(`Total weight ${totalWeightKg.toLocaleString()} kg exceeds container payload limit of ${container.maxPayloadKg.toLocaleString()} kg`);
  }
  if (!allFit) {
    warnings.push(`Only ${totalItemsFit} of ${quantity} items fit in this container`);
  }

  // ── When nothing fits, zero out the supplementary counters and identify
  //    which specific dimension caused the failure. Reporting "limitingFactor: volume"
  //    with layers/itemsPerCol > 0 is misleading when totalItemsFit === 0.
  if (totalItemsFit === 0) {
    // Height is simpler — it has no rotation consideration.
    let failedDim: 'length' | 'width' | 'height' | null = null;
    let itemDim = 0;
    let containerDim = 0;

    if (itemHeightCm > cH) {
      failedDim = 'height';
      itemDim = itemHeightCm;
      containerDim = cH;
    } else {
      // Footprint check: smaller of (L, W) must fit the smaller container dim,
      // and larger of (L, W) must fit the larger container dim.
      const itemMin = Math.min(itemLengthCm, itemWidthCm);
      const itemMax = Math.max(itemLengthCm, itemWidthCm);
      const contMin = Math.min(cL, cW);
      const contMax = Math.max(cL, cW);
      if (itemMax > contMax) {
        failedDim = 'length';
        itemDim = itemMax;
        containerDim = contMax;
      } else if (itemMin > contMin) {
        failedDim = 'width';
        itemDim = itemMin;
        containerDim = contMin;
      }
    }

    const dimsWarning = failedDim
      ? `Item ${failedDim} (${itemDim}cm) exceeds container internal ${failedDim} (${containerDim}cm). Item cannot fit in this container.`
      : 'Item cannot fit in this container.';

    return {
      container,
      itemsPerRow: 0,
      itemsPerCol: 0,
      itemsPerLayer: 0,
      layers: 0,
      totalItemsFit: 0,
      itemsRequested: quantity,
      allFit: false,
      totalWeightKg: 0,
      volumeUsedCbm: 0,
      volumeUtilisation: 0,
      weightUtilisation: 0,
      limitingFactor: failedDim ? 'dimensions' : 'volume',
      warnings: [dimsWarning],
    };
  }

  return {
    container,
    itemsPerRow,
    itemsPerCol,
    itemsPerLayer,
    layers,
    totalItemsFit,
    itemsRequested: quantity,
    allFit,
    totalWeightKg,
    volumeUsedCbm: Math.round(volumeUsedCbm * 1000) / 1000,
    volumeUtilisation: Math.round(volumeUtilisation * 10) / 10,
    weightUtilisation: Math.round(weightUtilisation * 10) / 10,
    limitingFactor,
    warnings,
  };
}
