import { NextResponse } from 'next/server';
import { getSheetBySlug } from '@/lib/sheetsService';
import { normalizeSearchString } from '@/lib/searchUtils';

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

    // Find row in Namuna 8 where Col 5 (मालमत्ता क्रमांक) matches query
    // Data rows start around row_index 11
    let matchedN8Row = n8.rows.find((r) => {
      if (r.row_index < 11) return false;
      const cell = r.cells.find((c) => c.col === 5);
      if (!cell || cell.value === null) return false;
      return normalizeSearchString(cell.value) === cleanQuery;
    });

    // Fallback: match on Col 2 (अ.क्र.) if property no is a plain number
    if (!matchedN8Row) {
      matchedN8Row = n8.rows.find((r) => {
        if (r.row_index < 11) return false;
        const cell = r.cells.find((c) => c.col === 2);
        if (!cell || cell.value === null) return false;
        return normalizeSearchString(cell.value) === cleanQuery;
      });
    }

    // Find row in Namuna 9 where Col 2 (मिळकत नंबर) matches
    let matchedN9Row = n9?.rows.find((r) => {
      if (r.row_index < 7) return false;
      const cell = r.cells.find((c) => c.col === 2);
      if (!cell || cell.value === null) return false;
      return normalizeSearchString(cell.value) === cleanQuery;
    });

    if (!matchedN8Row && !matchedN9Row) {
      return NextResponse.json(
        { error: `मालमत्ता क्रमांक '${propertyNo}' सापडला नाही.` },
        { status: 404 }
      );
    }

    // Helper to safely extract cell values
    const getC = (row: any, colNum: number) => {
      const c = row?.cells.find((ce: any) => ce.col === colNum);
      return c?.value !== undefined && c?.value !== null ? c.value : '';
    };

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

      // Current annual taxes from Namuna 8
      house_tax_current: Math.round(getNum(matchedN8Row, 21) || getNum(matchedN9Row, 5) || 816),
      light_tax_current: Math.round(getNum(matchedN8Row, 22) || getNum(matchedN9Row, 9) || 30),
      health_tax_current: Math.round(getNum(matchedN8Row, 23) || getNum(matchedN9Row, 12) || 30),
      water_tax_current: Math.round(getNum(matchedN8Row, 24) || getNum(matchedN9Row, 15) || 0),

      // Arrears taxes from Namuna 9
      house_tax_arrears: Math.round(getNum(matchedN9Row, 4)),
      light_tax_arrears: Math.round(getNum(matchedN9Row, 8)),
      health_tax_arrears: Math.round(getNum(matchedN9Row, 11)),
      water_tax_arrears: Math.round(getNum(matchedN9Row, 14)),

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

    return NextResponse.json({
      success: true,
      data: {
        ...propertyRecord,
        house_tax_total: houseTotal,
        light_tax_total: lightTotal,
        health_tax_total: healthTotal,
        water_tax_total: waterTotal,
        grand_total: grandTotal,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
