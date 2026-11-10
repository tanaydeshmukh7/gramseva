const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const OLD_WORKBOOK_PATH = path.join(__dirname, '..', 'ग्रामपंचायत गोहगाव .xlsx');
const NEW_WORKBOOK_PATH = path.join(__dirname, '..', 'ग्रामपंचायत गोहगाव  (1).xlsx');

const oldWb = XLSX.readFile(OLD_WORKBOOK_PATH, { cellFormula: true, cellStyles: true });
const newWb = XLSX.readFile(NEW_WORKBOOK_PATH, { cellFormula: true, cellStyles: true });

console.log('--- DETAILED SHEET STRUCTURE COMPARISON ---\n');

function analyzeSheet(ws, name) {
  const ref = ws['!ref'] || 'A1:A1';
  const range = XLSX.utils.decode_range(ref);
  const rows = [];
  const colNames = new Map();

  for (let r = 0; r <= range.e.r; r++) {
    const rowCells = [];
    let hasValue = false;
    for (let c = 0; c <= range.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = ws[addr];
      if (cell && (cell.v !== undefined || cell.f)) {
        hasValue = true;
        rowCells.push({
          col: c + 1,
          coord: addr,
          val: cell.v,
          formula: cell.f || null,
        });
      }
    }
    if (hasValue) {
      rows.push({ rowIndex: r + 1, cells: rowCells });
    }
  }

  return { name, range, totalRows: rows.length, rows };
}

// 1. Analyze 8 NEW SHEETS
const newSheetNames = [
  'नमुना ५ १६ वित्त ',
  'नमुना ५ सामान्य ',
  'नमुना ९ गोषवारा ',
  'नमुना न. ६ ',
  'नमुना 8 खातेदार',
  'नमुना ९ प्रिंट रजिस्टर',
  'नमुना ८ प्रिंट रजिस्टर',
  'थकबाकी यादी २०२६-२७',
];

console.log('=== 8 NEW WORKSHEETS ANALYSIS ===\n');

newSheetNames.forEach(name => {
  const ws = newWb.Sheets[name];
  if (!ws) {
    console.log(`Sheet "${name}" not found! Available names:`, newWb.SheetNames.filter(n => n.includes(name.trim())));
    return;
  }
  const analysis = analyzeSheet(ws, name);
  console.log(`\n========================================`);
  console.log(`SHEET: [${name}] (Populated Rows: ${analysis.totalRows}, Range: ${analysis.range})`);
  console.log(`========================================`);

  // Print first 5 rows
  console.log('FIRST 5 ROWS:');
  analysis.rows.slice(0, 5).forEach(r => {
    const summary = r.cells.map(c => `C${c.col}: "${c.val !== undefined ? c.val : ''}"${c.formula ? ' [=' + c.formula + ']' : ''}`).join(' | ');
    console.log(`Row ${r.rowIndex} (${r.cells.length} cells): ${summary.slice(0, 150)}...`);
  });
});
