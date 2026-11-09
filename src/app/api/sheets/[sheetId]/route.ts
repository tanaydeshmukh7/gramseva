import { NextResponse } from 'next/server';
import { getSheetBySlug, saveSheetData } from '@/lib/sheetsService';
import { SheetRow } from '@/lib/types';

interface RouteContext {
  params: Promise<{ sheetId: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const { sheetId } = await context.params;
    const sheetData = getSheetBySlug(sheetId);
    if (!sheetData) {
      return NextResponse.json({ error: 'वर्कशीट आढळली नाही' }, { status: 404 });
    }
    return NextResponse.json(sheetData);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Update existing row
export async function PUT(req: Request, context: RouteContext) {
  try {
    const { sheetId } = await context.params;
    const sheetData = getSheetBySlug(sheetId);
    if (!sheetData) {
      return NextResponse.json({ error: 'वर्कशीट आढळली नाही' }, { status: 404 });
    }

    const body = await req.json();
    const updatedRow: SheetRow = body.row;

    if (!updatedRow || typeof updatedRow.row_index !== 'number') {
      return NextResponse.json({ error: 'अवैध नोंद डेटा (Invalid row data)' }, { status: 400 });
    }

    const rowIndex = sheetData.rows.findIndex((r) => r.row_index === updatedRow.row_index);
    if (rowIndex === -1) {
      return NextResponse.json({ error: 'ओळ सापडली नाही (Row not found)' }, { status: 404 });
    }

    // Preserve formulas if new value is unchanged or empty
    const existingRow = sheetData.rows[rowIndex];
    const mergedCells = updatedRow.cells.map((cell) => {
      const existingCell = existingRow.cells.find((ec) => ec.col === cell.col);
      return {
        col: cell.col,
        coord: cell.coord || existingCell?.coord || `C${cell.col}`,
        value: cell.value !== undefined ? cell.value : existingCell?.value ?? null,
        is_formula: cell.is_formula !== undefined ? cell.is_formula : existingCell?.is_formula ?? false,
        formula: cell.formula !== undefined ? cell.formula : existingCell?.formula ?? null,
      };
    });

    sheetData.rows[rowIndex] = {
      row_index: updatedRow.row_index,
      cells: mergedCells,
    };

    const saved = saveSheetData(sheetId, sheetData);
    if (!saved) {
      return NextResponse.json({ error: 'डेटाबेसमध्ये सेव्ह अयशस्वी' }, { status: 500 });
    }

    return NextResponse.json({ success: true, updated_row: sheetData.rows[rowIndex] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Add new row
export async function POST(req: Request, context: RouteContext) {
  try {
    const { sheetId } = await context.params;
    const sheetData = getSheetBySlug(sheetId);
    if (!sheetData) {
      return NextResponse.json({ error: 'वर्कशीट आढळली नाही' }, { status: 404 });
    }

    const body = await req.json();
    const newCells: Array<{ col: number; value: any }> = body.cells || [];

    // Next row index
    const maxIndex = sheetData.rows.reduce((max, r) => Math.max(max, r.row_index), 0);
    const newRowIndex = maxIndex + 1;

    const formattedCells = newCells.map((c) => ({
      col: c.col,
      coord: `C${c.col}R${newRowIndex}`,
      value: c.value,
      is_formula: false,
      formula: null,
    }));

    const newRow: SheetRow = {
      row_index: newRowIndex,
      cells: formattedCells,
    };

    sheetData.rows.push(newRow);
    sheetData.populated_rows_count = sheetData.rows.length;
    sheetData.max_row = Math.max(sheetData.max_row, newRowIndex);

    const saved = saveSheetData(sheetId, sheetData);
    if (!saved) {
      return NextResponse.json({ error: 'नवीन नोंद सेव्ह करता आली नाही' }, { status: 500 });
    }

    return NextResponse.json({ success: true, row: newRow });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Delete row
export async function DELETE(req: Request, context: RouteContext) {
  try {
    const { sheetId } = await context.params;
    const sheetData = getSheetBySlug(sheetId);
    if (!sheetData) {
      return NextResponse.json({ error: 'वर्कशीट आढळली नाही' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const rowIndexParam = searchParams.get('rowIndex');
    if (!rowIndexParam) {
      return NextResponse.json({ error: 'ओळ क्रमांक आवश्यक आहे (rowIndex required)' }, { status: 400 });
    }

    const rowIndex = parseInt(rowIndexParam, 10);
    const initialLen = sheetData.rows.length;
    sheetData.rows = sheetData.rows.filter((r) => r.row_index !== rowIndex);

    if (sheetData.rows.length === initialLen) {
      return NextResponse.json({ error: 'ओळ सापडली नाही (Row not found)' }, { status: 404 });
    }

    sheetData.populated_rows_count = sheetData.rows.length;

    const saved = saveSheetData(sheetId, sheetData);
    if (!saved) {
      return NextResponse.json({ error: 'नोंद हटवणे सेव्ह अयशस्वी' }, { status: 500 });
    }

    return NextResponse.json({ success: true, deleted_row_index: rowIndex });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
