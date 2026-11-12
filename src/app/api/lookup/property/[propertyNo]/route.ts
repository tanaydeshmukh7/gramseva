import { NextResponse } from 'next/server';
import { getSheetBySlug } from '@/lib/sheetsService';
import { normalizeSearchString, matchCellWithToken, stripPunctuation } from '@/lib/searchUtils';

interface RouteContext {
  params: Promise<{ propertyNo: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const { propertyNo } = await context.params;
    const cleanQuery = normalizeSearchString(decodeURIComponent(propertyNo));

    if (!cleanQuery) {
      return NextResponse.json({ error: 'मालमत्ता क्रमांक आवश्यक आहे.' }, { status: 400 });
    }

    // Load Namuna 8 (Master Property Register)
    const n8 = getSheetBySlug('namuna-8');
    if (!n8) {
      return NextResponse.json({ error: 'नमुना ८ डेटा उपलब्ध नाही.' }, { status: 500 });
    }

    // Load Namuna 9 (Demand Register)
    const n9 = getSheetBySlug('namuna-9');

    // Helper to safely extract cell values
    const getC = (row: any, colNum: number) => {
      const c = row?.cells.find((ce: any) => ce.col === colNum);
      return c?.value !== undefined && c?.value !== null ? c.value : '';
    };

    // Safe cell matcher for property numbers
    const cellMatches = (val: any) => {
      if (val === null || val === undefined) return false;
      const n = normalizeSearchString(val);
      if (!n) return false;
      if (n === cleanQuery) return true;
      if (stripPunctuation(n) === stripPunctuation(cleanQuery)) return true;
      return false;
    };

    // 1. Check Namuna 9 Col 2 (मिळकत नंबर) and Col 1 (अ.क्र.)
    let matchedN9Row = n9?.rows.find((r) => r.row_index >= 7 && cellMatches(getC(r, 2)));
    if (!matchedN9Row) {
      matchedN9Row = n9?.rows.find((r) => r.row_index >= 7 && cellMatches(getC(r, 1)));
    }

    // 2. Check Namuna 8 Col 5 (मालमत्ता क्रमांक) and Col 2 (अ.क्र.)
    let matchedN8Row = n8.rows.find((r) => r.row_index >= 11 && cellMatches(getC(r, 5)));
    if (!matchedN8Row) {
      matchedN8Row = n8.rows.find((r) => r.row_index >= 11 && cellMatches(getC(r, 2)));
    }

    // 3. Cross-reconcile between N8 & N9 if one was matched
    if (matchedN9Row && !matchedN8Row) {
      const n9Owner = normalizeSearchString(getC(matchedN9Row, 3));
      if (n9Owner) {
        matchedN8Row = n8.rows.find((r) => {
          if (r.row_index < 11) return false;
          const n8Owner = normalizeSearchString(getC(r, 6));
          return matchCellWithToken(n8Owner, n9Owner);
        });
      }
      if (!matchedN8Row) {
        // Try base numeric part (e.g. "5" from "5A", "6" from "6B", "7" from "7A")
        const baseNum = cleanQuery.replace(/[^0-9]/g, '');
        if (baseNum) {
          matchedN8Row = n8.rows.find((r) => {
            if (r.row_index < 11) return false;
            return cellMatches(getC(r, 5)) || cellMatches(getC(r, 2));
          });
        }
      }
    } else if (matchedN8Row && !matchedN9Row) {
      const n8Owner = normalizeSearchString(getC(matchedN8Row, 6));
      if (n8Owner) {
        matchedN9Row = n9?.rows.find((r) => {
          if (r.row_index < 7) return false;
          const n9Owner = normalizeSearchString(getC(r, 3));
          return matchCellWithToken(n9Owner, n8Owner);
        });
      }
    }

    // 4. Fallback: match by owner name if no property number matched
    if (!matchedN8Row && !matchedN9Row) {
      matchedN9Row = n9?.rows.find((r) => {
        if (r.row_index < 7) return false;
        const owner = normalizeSearchString(getC(r, 3));
        return matchCellWithToken(owner, cleanQuery);
      });
      if (matchedN9Row) {
        const pNo = getC(matchedN9Row, 2);
        matchedN8Row = n8.rows.find((r) => r.row_index >= 11 && cellMatches(getC(r, 5)));
      } else {
        matchedN8Row = n8.rows.find((r) => {
          if (r.row_index < 11) return false;
          const owner = normalizeSearchString(getC(r, 6));
          return matchCellWithToken(owner, cleanQuery);
        });
        if (matchedN8Row) {
          const pNo = getC(matchedN8Row, 5);
          matchedN9Row = n9?.rows.find((r) => r.row_index >= 7 && cellMatches(getC(r, 2)));
        }
      }
    }

    if (!matchedN8Row && !matchedN9Row) {
      return NextResponse.json(
        { error: `मालमत्ता क्रमांक किंवा करदाता '${propertyNo}' सापडला नाही.` },
        { status: 404 }
      );
    }

    const getNum = (row: any, colNum: number) => {
      const val = getC(row, colNum);
      if (typeof val === 'number') return val;
      const parsed = parseFloat(String(val).replace(/[^0-9.-]+/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    };

    const propertyRecord = {
      property_no: String(getC(matchedN8Row, 5) || getC(matchedN9Row, 2) || propertyNo),
      sr_no: getC(matchedN8Row, 2) || getC(matchedN9Row, 1) || 1,
      street_name: getC(matchedN8Row, 3) || 'ग्रामठाण अंतर्गत रस्ता',
      city_survey_no: getC(matchedN8Row, 4) || '-',
      owner_name: String(getC(matchedN8Row, 6) || getC(matchedN9Row, 3) || 'नोंदणीकृत मालक (गोहगाव)'),
      occupant_name: String(getC(matchedN8Row, 7) || ''),
      property_description: String(getC(matchedN8Row, 8) || 'नवीन आर सी सी पद्धतीचे घर'),
      construction_year_bracket: String(getC(matchedN8Row, 9) || '२ पेक्षा जास्त व ५ वर्ष पर्यंत'),
      length_ft: getNum(matchedN8Row, 10) || 25,
      width_ft: getNum(matchedN8Row, 11) || 30,
      area_sq_ft: getNum(matchedN8Row, 12) || 750,
      area_sq_m: getNum(matchedN8Row, 13) || 69.67,
      land_rate: getNum(matchedN8Row, 14) || 400,
      construction_rate: getNum(matchedN8Row, 16) || 18295,
      depreciation_rate: getNum(matchedN8Row, 17) || 0.95,
      usage_weight: getNum(matchedN8Row, 18) || 1,
      capital_value: getNum(matchedN8Row, 19) || 68000,
      tax_rate_paise: getNum(matchedN8Row, 20) || 1.2,

      // Current annual taxes from Namuna 8 / Namuna 9
      house_tax_current: Math.round(getNum(matchedN9Row, 5) || getNum(matchedN8Row, 21) || 0),
      light_tax_current: Math.round(getNum(matchedN9Row, 9) || getNum(matchedN8Row, 22) || 30),
      health_tax_current: Math.round(getNum(matchedN9Row, 12) || getNum(matchedN8Row, 23) || 30),
      water_tax_current: Math.round(getNum(matchedN9Row, 16) || getNum(matchedN8Row, 24) || 0),

      // Arrears taxes from Namuna 9
      house_tax_arrears: Math.round(getNum(matchedN9Row, 4) || 0),
      light_tax_arrears: Math.round(getNum(matchedN9Row, 8) || 0),
      health_tax_arrears: Math.round(getNum(matchedN9Row, 11) || 0),
      water_tax_arrears: Math.round(getNum(matchedN9Row, 15) || 0),

      // Boundaries from Namuna 8
      east: String(getC(matchedN8Row, 32) || 'शेतजमीन'),
      west: String(getC(matchedN8Row, 33) || 'ग्राम रस्ता'),
      north: String(getC(matchedN8Row, 34) || 'शेजारील मिळकत'),
      south: String(getC(matchedN8Row, 35) || 'मोकळी जागा'),
    };

    // Calculate totals
    const houseTotal = propertyRecord.house_tax_arrears + propertyRecord.house_tax_current;
    const lightTotal = propertyRecord.light_tax_arrears + propertyRecord.light_tax_current;
    const healthTotal = propertyRecord.health_tax_arrears + propertyRecord.health_tax_current;
    const waterTotal = propertyRecord.water_tax_arrears + propertyRecord.water_tax_current;
    const grandTotal = houseTotal + lightTotal + healthTotal + waterTotal;
    const totalArrears = propertyRecord.house_tax_arrears + propertyRecord.light_tax_arrears + propertyRecord.health_tax_arrears + propertyRecord.water_tax_arrears;
    const totalCurrent = propertyRecord.house_tax_current + propertyRecord.light_tax_current + propertyRecord.health_tax_current + propertyRecord.water_tax_current;

    return NextResponse.json({
      success: true,
      data: {
        ...propertyRecord,
        house_tax_total: houseTotal,
        light_tax_total: lightTotal,
        health_tax_total: healthTotal,
        water_tax_total: waterTotal,
        total_arrears: totalArrears,
        total_current: totalCurrent,
        grand_total: grandTotal,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
