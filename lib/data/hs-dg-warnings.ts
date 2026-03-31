/**
 * HS-DG Warning Flags
 * Maps HS headings/chapters to dangerous goods warnings for display on HS detail pages.
 */

export interface HsDgWarning {
  type: 'hard' | 'soft';
  message: string;
}

const HARD_FLAGS: Record<string, string> = {
  '3604': '\u26A0 Dangerous Goods Alert: Products under HS 3604 (fireworks, pyrotechnic articles) are typically classified as Class 1 dangerous goods under ADR/IMDG/IATA DGR. Verify classification before shipping.',
  '3605': '\u26A0 Dangerous Goods Alert: Matches (HS 3605) are classified as Class 4.1 dangerous goods (UN 1944/UN 1945).',
  '3606': '\u26A0 Dangerous Goods Alert: Products under HS 3606 include lighter fuels and pyrophoric alloys, typically Class 4.1 dangerous goods.',
  '2711': '\u26A0 Dangerous Goods Alert: Petroleum gases (HS 2711), including propane and butane, are Class 2.1 flammable gases under ADR.',
  '2710': '\u26A0 Dangerous Goods Alert: Petroleum oils (HS 2710), including petrol and diesel, are typically Class 3 flammable liquids under ADR.',
  '8507': '\u26A0 Dangerous Goods Alert: Batteries (HS 8507), particularly lithium-ion (8507.60), are Class 9 dangerous goods under ADR (UN 3480/UN 3481). Special packaging, labelling, and documentation required for all transport modes.',
  '2828': '\u26A0 Dangerous Goods Alert: Hypochlorites (HS 2828), including calcium hypochlorite, are Class 5.1 oxidizers under ADR (UN 2880/UN 1748). A leading cause of container ship fires.',
  '9303': '\u26A0 Dangerous Goods Alert: Products under HS 9303 (firearms) may be shipped alongside ammunition classified as Class 1 dangerous goods under ADR/IMDG/IATA DGR. Firearms are subject to strict import/export licensing and transport security requirements. Verify all regulatory requirements before shipping.',
};

const SOFT_FLAG_CHAPTERS: Record<string, string> = {
  '28': '\u2139 Many substances in this chapter (inorganic chemicals) may be classified as dangerous goods under ADR. Common hazard classes include Class 5.1 (oxidising), Class 6.1 (toxic), and Class 8 (corrosive). Always check individual substance classification before transport.',
  '29': '\u2139 Many substances in this chapter (organic chemicals) may be classified as dangerous goods under ADR. Common hazard classes include Class 3 (flammable liquid), Class 6.1 (toxic), and Class 8 (corrosive). Always check individual substance classification before transport.',
  '32': '\u2139 Products in HS Chapter 32 (Tanning/dyeing extracts, paints, inks) may include substances classified as dangerous goods for transport. If shipping chemicals, solvents, acids, or reactive substances, verify ADR/IMDG classification before booking.',
  '38': '\u2139 Products in HS Chapter 38 (Miscellaneous chemical products) may include substances classified as dangerous goods for transport. If shipping chemicals, solvents, acids, or reactive substances, verify ADR/IMDG classification before booking.',
  '85': '\u2139 Electrical equipment (HS Chapter 85) may contain batteries or other components classified as dangerous goods. Verify if batteries are present.',
  '87': '\u2139 Vehicles and vehicle parts (HS Chapter 87) may contain fuel, batteries, or airbag inflators classified as dangerous goods.',
  '9304': '\u2139 Products under HS 9304 (air guns, spring guns, etc.) are not typically classified as dangerous goods, but may be subject to import/export licensing and transport restrictions in many jurisdictions. Verify regulatory requirements before shipping.',
};

const DISCLAIMER = 'Classification is the shipper\u2019s legal responsibility. This reference is based on common HS-ADR correlations from public regulatory data. Always verify against the current ADR, IMDG Code, or IATA DGR and consult a qualified DGSA where required.';

export function getHsDgWarning(hsCode: string): HsDgWarning | null {
  // Check hard flags: match heading (4-digit prefix)
  const heading = hsCode.slice(0, 4);
  if (HARD_FLAGS[heading]) {
    return {
      type: 'hard',
      message: HARD_FLAGS[heading],
    };
  }

  // Check soft flags: match chapter (2-digit prefix), but not if hard-flagged
  const chapter = hsCode.slice(0, 2);

  // Chapter 85 exception: 8507 gets hard flag, rest gets soft
  if (chapter === '85' && heading === '8507') {
    return { type: 'hard', message: HARD_FLAGS['8507'] };
  }

  // Check soft flags by heading (e.g., 9304)
  if (SOFT_FLAG_CHAPTERS[heading]) {
    return {
      type: 'soft',
      message: SOFT_FLAG_CHAPTERS[heading],
    };
  }

  // Check soft flags by chapter (2-digit prefix)
  if (SOFT_FLAG_CHAPTERS[chapter]) {
    return {
      type: 'soft',
      message: SOFT_FLAG_CHAPTERS[chapter],
    };
  }

  return null;
}

export { DISCLAIMER as HS_DG_DISCLAIMER };
