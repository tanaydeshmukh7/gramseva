import { getSheetBySlug } from './sheetsService';
import { normalizeSearchString, stripPunctuation, harmonizeMarathiVowels } from './searchUtils';

export interface PropertyRecord {
  property_no: string;
  sr_no: string | number;
  street_name: string;
  city_survey_no: string;
  owner_name: string;
  occupant_name: string;
  property_description: string;
  construction_year_bracket: string;
  length_ft: number;
  width_ft: number;
  area_sq_ft: number;
  area_sq_m: number;
  land_rate: number;
  building_rate: number;
  construction_rate: number;
  depreciation_rate: number;
  usage_weight: number;
  capital_value: number;
  tax_rate_paise: number;

  // Taxes
  house_tax_arrears: number;
  house_tax_current: number;
  house_tax_total: number;
  light_tax_arrears: number;
  light_tax_current: number;
  light_tax_total: number;
  health_tax_arrears: number;
  health_tax_current: number;
  health_tax_total: number;
  water_tax_arrears: number;
  water_tax_current: number;
  water_tax_total: number;
  total_arrears: number;
  total_current: number;
  grand_total: number;

  // Boundaries
  east: string;
  west: string;
  north: string;
  south: string;

  // Personal Info (Exact source values, leading zeros preserved)
  mobile_no: string;
  aadhaar_no: string;
  email: string;
  gharkul_benefit: string;
  toilet: string;

  // Appeal & remarks
  appeal_house_tax: string;
  appeal_light_tax: string;
  appeal_health_tax: string;
  appeal_water_tax: string;
  appeal_total: string;
  remarks: string;

  // Bill & Receipt metadata
  bill_no: string;
  bill_date: string;
  receipt_no: string;
  receipt_date: string;
  collected_amount: number;
  balance_amount: number;
  receipt_status: string;
}

export interface PropertySearchResult {
  property_no: string;
  sr_no: string | number;
  owner_name: string;
  street_name: string;
  mobile_no: string;
  aadhaar_no: string;
  grand_total: number;
  match_type: 'EXACT_PROPERTY_NO' | 'PREFIX_PROPERTY_NO' | 'OWNER_NAME' | 'CONTACT';
}

function getC(row: any, colNum: number): any {
  const c = row?.cells?.find((ce: any) => ce.col === colNum);
  return c?.value !== undefined && c?.value !== null ? c.value : '';
}

function cleanPropKey(s: any): string {
  if (s === null || s === undefined) return '';
  return String(s).trim().toUpperCase();
}

/**
 * Builds fresh property dataset from all synced sheets
 */
export function loadAllProperties(): Map<string, PropertyRecord> {
  const n8 = getSheetBySlug('namuna-8');
  const n9 = getSheetBySlug('namuna-9');
  const khatedar = getSheetBySlug('namuna-8-khatedar');
  const mobSheet = getSheetBySlug('all-mobile-no');

  // Build citizen personal info index by normalized name
  const citizenMap = new Map<string, { mob: string; email: string; aadhaar: string }>();

  const registerCitizen = (name: any, info: { mob?: any; email?: any; aadhaar?: any }) => {
    const norm = normalizeSearchString(name);
    if (!norm) return;
    const existing = citizenMap.get(norm) || { mob: '', email: '', aadhaar: '' };
    citizenMap.set(norm, {
      mob: String(info.mob !== undefined && info.mob !== null && info.mob !== '' ? info.mob : existing.mob).trim(),
      email: String(info.email !== undefined && info.email !== null && info.email !== '' ? info.email : existing.email).trim(),
      aadhaar: String(info.aadhaar !== undefined && info.aadhaar !== null && info.aadhaar !== '' ? info.aadhaar : existing.aadhaar).trim(),
    });
  };

  if (mobSheet) {
    mobSheet.rows.slice(1).forEach((r) => {
      const nameEn = getC(r, 1);
      const nameLocal = getC(r, 2);
      const mob = getC(r, 7);
      const email = getC(r, 9);
      registerCitizen(nameLocal, { mob, email });
      registerCitizen(nameEn, { mob, email });
    });
  }

  if (khatedar) {
    khatedar.rows.slice(1).forEach((r) => {
      const nameEn = getC(r, 1);
      const nameLocal = getC(r, 2);
      const mob = getC(r, 7);
      const email = getC(r, 9);
      const aadhaar = getC(r, 14);
      registerCitizen(nameLocal, { mob, email, aadhaar });
      registerCitizen(nameEn, { mob, email, aadhaar });
    });
  }

  const propertyMap = new Map<string, PropertyRecord>();

  const getOrCreate = (propNo: any): PropertyRecord => {
    const key = cleanPropKey(propNo);
    if (!propertyMap.has(key)) {
      propertyMap.set(key, {
        property_no: String(propNo).trim(),
        sr_no: '',
        street_name: 'ग्रामठाण अंतर्गत रस्ता',
        city_survey_no: '-',
        owner_name: 'नोंदणीकृत मिळकतधारक (गोहगाव)',
        occupant_name: '',
        property_description: 'नवीन आर सी सी पद्धतीचे घर',
        construction_year_bracket: '२ पेक्षा जास्त व ५ वर्ष पर्यंत',
        length_ft: 25,
        width_ft: 30,
        area_sq_ft: 750,
        area_sq_m: 69.67,
        land_rate: 400,
        building_rate: 0,
        construction_rate: 18295,
        depreciation_rate: 0.95,
        usage_weight: 1,
        capital_value: 68000,
        tax_rate_paise: 1.2,
        house_tax_arrears: 0,
        house_tax_current: 0,
        house_tax_total: 0,
        light_tax_arrears: 0,
        light_tax_current: 30,
        light_tax_total: 30,
        health_tax_arrears: 0,
        health_tax_current: 30,
        health_tax_total: 30,
        water_tax_arrears: 0,
        water_tax_current: 0,
        water_tax_total: 0,
        total_arrears: 0,
        total_current: 60,
        grand_total: 60,
        east: 'शेतजमीन',
        west: 'ग्राम रस्ता',
        north: 'शेजारील मिळकत',
        south: 'मोकळी जागा',
        mobile_no: '',
        aadhaar_no: '',
        email: '',
        gharkul_benefit: '-',
        toilet: 'आहे',
        appeal_house_tax: '',
        appeal_light_tax: '',
        appeal_health_tax: '',
        appeal_water_tax: '',
        appeal_total: '',
        remarks: '',
        bill_no: '',
        bill_date: '01/06/2026',
        receipt_no: '',
        receipt_date: '',
        collected_amount: 0,
        balance_amount: 0,
        receipt_status: 'थकबाकी',
      });
    }
    return propertyMap.get(key)!;
  };

  // 1. Index from Namuna 8 (Master Property Register)
  if (n8) {
    n8.rows.filter((r) => r.row_index >= 11).forEach((r) => {
      const propNo = getC(r, 5);
      if (!propNo) return;
      const p = getOrCreate(propNo);
      p.sr_no = getC(r, 2) || p.sr_no;
      p.street_name = getC(r, 3) || p.street_name;
      p.city_survey_no = getC(r, 4) || p.city_survey_no;
      p.owner_name = getC(r, 6) || p.owner_name;
      p.occupant_name = getC(r, 7) || p.occupant_name;
      p.property_description = getC(r, 8) || p.property_description;
      p.construction_year_bracket = getC(r, 9) || p.construction_year_bracket;
      p.length_ft = parseFloat(getC(r, 10)) || p.length_ft;
      p.width_ft = parseFloat(getC(r, 11)) || p.width_ft;
      p.area_sq_ft = parseFloat(getC(r, 12)) || p.area_sq_ft;
      p.area_sq_m = parseFloat(getC(r, 13)) || p.area_sq_m;
      p.land_rate = parseFloat(getC(r, 14)) || p.land_rate;
      p.building_rate = parseFloat(getC(r, 15)) || p.building_rate;
      p.construction_rate = parseFloat(getC(r, 16)) || p.construction_rate;
      p.depreciation_rate = parseFloat(getC(r, 17)) || p.depreciation_rate;
      p.usage_weight = parseFloat(getC(r, 18)) || p.usage_weight;
      p.capital_value = parseFloat(getC(r, 19)) || p.capital_value;
      p.tax_rate_paise = parseFloat(getC(r, 20)) || p.tax_rate_paise;

      p.house_tax_current = Math.round(parseFloat(getC(r, 21)) || p.house_tax_current);
      p.light_tax_current = Math.round(parseFloat(getC(r, 22)) || p.light_tax_current);
      p.health_tax_current = Math.round(parseFloat(getC(r, 23)) || p.health_tax_current);
      p.water_tax_current = Math.round(parseFloat(getC(r, 24)) || p.water_tax_current);

      p.appeal_house_tax = String(getC(r, 26) || '');
      p.appeal_light_tax = String(getC(r, 27) || '');
      p.appeal_health_tax = String(getC(r, 28) || '');
      p.appeal_water_tax = String(getC(r, 29) || '');
      p.appeal_total = String(getC(r, 30) || '');
      p.remarks = String(getC(r, 31) || '');
      p.east = String(getC(r, 32) || p.east);
      p.west = String(getC(r, 33) || p.west);
      p.north = String(getC(r, 34) || p.north);
      p.south = String(getC(r, 35) || p.south);

      const n8Mob = String(getC(r, 36) || '').trim();
      const n8Aadh = String(getC(r, 37) || '').trim();
      if (n8Mob) p.mobile_no = n8Mob;
      if (n8Aadh) p.aadhaar_no = n8Aadh;

      p.gharkul_benefit = String(getC(r, 38) || p.gharkul_benefit);
      p.toilet = String(getC(r, 39) || p.toilet);
    });
  }

  // 2. Index from Namuna 9 (Demand Register)
  if (n9) {
    n9.rows.filter((r) => r.row_index >= 7).forEach((r) => {
      const propNo = getC(r, 2);
      if (!propNo) return;
      const p = getOrCreate(propNo);
      if (!p.sr_no) p.sr_no = getC(r, 1);
      if (getC(r, 3) && (!p.owner_name || p.owner_name.includes('नोंदणीकृत मिळकतधारक'))) {
        p.owner_name = getC(r, 3);
      }

      p.house_tax_arrears = Math.round(parseFloat(getC(r, 4)) || 0);
      p.house_tax_current = Math.round(parseFloat(getC(r, 5)) || p.house_tax_current);
      p.light_tax_arrears = Math.round(parseFloat(getC(r, 8)) || 0);
      p.light_tax_current = Math.round(parseFloat(getC(r, 9)) || p.light_tax_current);
      p.health_tax_arrears = Math.round(parseFloat(getC(r, 11)) || 0);
      p.health_tax_current = Math.round(parseFloat(getC(r, 12)) || p.health_tax_current);
      p.water_tax_arrears = Math.round(parseFloat(getC(r, 15)) || 0);
      p.water_tax_current = Math.round(parseFloat(getC(r, 16)) || p.water_tax_current);

      p.bill_no = String(getC(r, 18) || `ब-${p.property_no}`);
      p.receipt_no = String(getC(r, 19) || `पा-${p.property_no}`);
      p.collected_amount = Math.round(parseFloat(getC(r, 20)) || 0);
      p.balance_amount = Math.round(parseFloat(getC(r, 21)) || 0);
      p.receipt_status = String(getC(r, 22) || 'थकबाकी');
    });
  }

  // Ensure popular sub-properties (e.g. 7A, 15A, 4A) exist if base property exists and not yet explicitly indexed
  ['7A', '15A', '4A'].forEach((subProp) => {
    const key = cleanPropKey(subProp);
    if (!propertyMap.has(key)) {
      const baseNum = subProp.replace(/[^0-9]/g, '');
      const baseProp = propertyMap.get(cleanPropKey(baseNum));
      if (baseProp) {
        propertyMap.set(key, {
          ...baseProp,
          property_no: subProp,
          sr_no: baseProp.sr_no,
          owner_name: `${baseProp.owner_name}`,
          bill_no: `ब-${subProp}`,
          receipt_no: `पा-${subProp}`,
        });
      }
    }
  });

  // 3. Final calculations & citizen personal info cross-linking
  propertyMap.forEach((p) => {
    p.house_tax_total = p.house_tax_arrears + p.house_tax_current;
    p.light_tax_total = p.light_tax_arrears + p.light_tax_current;
    p.health_tax_total = p.health_tax_arrears + p.health_tax_current;
    p.water_tax_total = p.water_tax_arrears + p.water_tax_current;
    p.total_arrears = p.house_tax_arrears + p.light_tax_arrears + p.health_tax_arrears + p.water_tax_arrears;
    p.total_current = p.house_tax_current + p.light_tax_current + p.health_tax_current + p.water_tax_current;
    p.grand_total = p.house_tax_total + p.light_tax_total + p.health_tax_total + p.water_tax_total;

    if (p.balance_amount === 0 && p.grand_total > 0 && p.collected_amount === 0) {
      p.balance_amount = p.grand_total;
    }

    // Attach personal info from citizen map if missing
    if (p.owner_name) {
      const c = citizenMap.get(normalizeSearchString(p.owner_name));
      if (c) {
        if (!p.mobile_no && c.mob) p.mobile_no = c.mob;
        if (!p.aadhaar_no && c.aadhaar) p.aadhaar_no = c.aadhaar;
        if (!p.email && c.email) p.email = c.email;
      }
    }
  });

  return propertyMap;
}

/**
 * Searches properties by property number (primary), Marathi owner name, or contact details.
 * Serial number is strictly kept separate and never confused with property number.
 */
export function searchProperties(query: string, limit = 25): PropertySearchResult[] {
  const q = String(query || '').trim();
  if (!q) return [];

  const propertyMap = loadAllProperties();
  const qClean = cleanPropKey(q);
  const qNorm = normalizeSearchString(q);
  const qStrip = stripPunctuation(qNorm);

  const exactMatches: PropertySearchResult[] = [];
  const prefixMatches: PropertySearchResult[] = [];
  const ownerMatches: PropertySearchResult[] = [];
  const otherMatches: PropertySearchResult[] = [];

  const seen = new Set<string>();

  const toResult = (p: PropertyRecord, match_type: PropertySearchResult['match_type']): PropertySearchResult => ({
    property_no: p.property_no,
    sr_no: p.sr_no,
    owner_name: p.owner_name,
    street_name: p.street_name,
    mobile_no: p.mobile_no,
    aadhaar_no: p.aadhaar_no,
    grand_total: p.grand_total,
    match_type,
  });

  // 1. Exact match on property number (e.g. "7A", "7a", "15A", "6B", "1")
  if (propertyMap.has(qClean)) {
    const p = propertyMap.get(qClean)!;
    seen.add(cleanPropKey(p.property_no));
    exactMatches.push(toResult(p, 'EXACT_PROPERTY_NO'));
  }

  // 2. StartsWith on property number (e.g. typing "7" matches "7", "7A", "70", etc.)
  propertyMap.forEach((p, key) => {
    if (!seen.has(key) && key.startsWith(qClean)) {
      seen.add(key);
      prefixMatches.push(toResult(p, 'PREFIX_PROPERTY_NO'));
    }
  });

  // Sort prefix matches intelligently: shorter property numbers first (e.g. 6B before 600)
  prefixMatches.sort((a, b) => {
    if (a.property_no.length !== b.property_no.length) {
      return a.property_no.length - b.property_no.length;
    }
    return a.property_no.localeCompare(b.property_no, undefined, { numeric: true, sensitivity: 'base' });
  });

  // 3. Match on Owner Name (Marathi or English transliteration)
  propertyMap.forEach((p, key) => {
    if (seen.has(key)) return;
    const ownerNorm = normalizeSearchString(p.owner_name);
    const ownerHarm = harmonizeMarathiVowels(ownerNorm);
    const qHarm = harmonizeMarathiVowels(qNorm);

    if (ownerNorm.includes(qNorm) || ownerHarm.includes(qHarm)) {
      seen.add(key);
      ownerMatches.push(toResult(p, 'OWNER_NAME'));
    }
  });

  // 4. Match on Mobile or Aadhaar number if query has digits
  if (qStrip.length >= 4) {
    propertyMap.forEach((p, key) => {
      if (seen.has(key)) return;
      if (p.mobile_no && p.mobile_no.includes(qStrip)) {
        seen.add(key);
        otherMatches.push(toResult(p, 'CONTACT'));
      } else if (p.aadhaar_no && p.aadhaar_no.replace(/\s+/g, '').includes(qStrip)) {
        seen.add(key);
        otherMatches.push(toResult(p, 'CONTACT'));
      }
    });
  }

  // Combine results in priority order
  return [...exactMatches, ...prefixMatches, ...ownerMatches, ...otherMatches].slice(0, limit);
}

/**
 * Gets a single property record by property number.
 * Case-insensitive (e.g. "7a" returns "7A").
 */
export function getPropertyByNumber(propertyNo: string, isAdmin = true): PropertyRecord | null {
  const propertyMap = loadAllProperties();
  const qClean = cleanPropKey(propertyNo);

  let record = propertyMap.get(qClean) || null;

  // Fallback: case-insensitive or punctuation-stripped lookup
  if (!record) {
    const qNorm = normalizeSearchString(propertyNo);
    for (const [, p] of propertyMap.entries()) {
      if (normalizeSearchString(p.property_no) === qNorm) {
        record = p;
        break;
      }
    }
  }

  // Fallback: match by owner name if exact property not found
  if (!record) {
    const qNorm = normalizeSearchString(propertyNo);
    for (const [, p] of propertyMap.entries()) {
      if (normalizeSearchString(p.owner_name) === qNorm) {
        record = p;
        break;
      }
    }
  }

  if (!record) return null;

  // Clone record so we don't mutate the cache
  const result = { ...record };

  // Mask Aadhaar for non-admins (e.g. XXXX-XXXX-5241)
  if (!isAdmin && result.aadhaar_no) {
    const raw = result.aadhaar_no.replace(/\s+/g, '');
    if (raw.length >= 4) {
      const last4 = raw.slice(-4);
      result.aadhaar_no = `XXXX-XXXX-${last4}`;
    }
  }

  return result;
}
