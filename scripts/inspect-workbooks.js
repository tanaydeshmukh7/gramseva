const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const OLD_WORKBOOK_PATH = path.join(__dirname, '..', 'ग्रामपंचायत गोहगाव .xlsx');
const NEW_WORKBOOK_PATH = path.join(__dirname, '..', 'ग्रामपंचायत गोहगाव  (1).xlsx');

console.log('=== WORKBOOK INSPECTION & COMPARISON ===\n');

if (!fs.existsSync(NEW_WORKBOOK_PATH)) {
  console.error('New workbook not found at:', NEW_WORKBOOK_PATH);
  process.exit(1);
}

console.log('Reading new workbook:', NEW_WORKBOOK_PATH);
const newWb = XLSX.readFile(NEW_WORKBOOK_PATH, { cellFormula: true, cellStyles: true });

console.log('Reading old workbook:', OLD_WORKBOOK_PATH);
const oldWb = fs.existsSync(OLD_WORKBOOK_PATH)
  ? XLSX.readFile(OLD_WORKBOOK_PATH, { cellFormula: true, cellStyles: true })
  : null;

console.log('\n--- NEW WORKBOOK SHEETS (Total: ' + newWb.SheetNames.length + ') ---');
newWb.SheetNames.forEach((name, i) => {
  const ws = newWb.Sheets[name];
  const ref = ws['!ref'] || 'A1:A1';
  const range = XLSX.utils.decode_range(ref);
  const rows = range.e.r + 1;
  const cols = range.e.c + 1;
  
  // Count non-empty rows and formulas
  let nonEmptyRows = new Set();
  let formulaCount = 0;
  for (const cellAddress in ws) {
    if (cellAddress.startsWith('!')) continue;
    const cell = ws[cellAddress];
    if (cell && (cell.v !== undefined && cell.v !== null && cell.v !== '')) {
      const decoded = XLSX.utils.decode_cell(cellAddress);
      nonEmptyRows.add(decoded.r);
    }
    if (cell && cell.f) {
      formulaCount++;
    }
  }

  console.log(
    `${i + 1}. [${name}] | Range: ${ref} | Rows: ${rows} | Populated: ${nonEmptyRows.size} | Cols: ${cols} | Formulas: ${formulaCount}`
  );
});

if (oldWb) {
  console.log('\n--- OLD WORKBOOK SHEETS (Total: ' + oldWb.SheetNames.length + ') ---');
  oldWb.SheetNames.forEach((name, i) => {
    const ws = oldWb.Sheets[name];
    const ref = ws['!ref'] || 'A1:A1';
    const range = XLSX.utils.decode_range(ref);
    let nonEmptyRows = new Set();
    let formulaCount = 0;
    for (const cellAddress in ws) {
      if (cellAddress.startsWith('!')) continue;
      const cell = ws[cellAddress];
      if (cell && (cell.v !== undefined && cell.v !== null && cell.v !== '')) {
        const decoded = XLSX.utils.decode_cell(cellAddress);
        nonEmptyRows.add(decoded.r);
      }
      if (cell && cell.f) {
        formulaCount++;
      }
    }
    console.log(
      `${i + 1}. [${name}] | Range: ${ref} | Populated: ${nonEmptyRows.size} | Formulas: ${formulaCount}`
    );
  });
}

// Save detailed comparison to JSON for analysis
const inspectionData = {
  newWorkbook: {
    sheetCount: newWb.SheetNames.length,
    sheets: newWb.SheetNames.map(name => {
      const ws = newWb.Sheets[name];
      const ref = ws['!ref'] || 'A1:A1';
      const range = XLSX.utils.decode_range(ref);
      let nonEmptyRows = new Set();
      let formulaCount = 0;
      let formulas = [];
      let headers = [];
      
      // Grab row 0-3 headers
      for (let r = 0; r <= Math.min(3, range.e.r); r++) {
        let rowHeaders = [];
        for (let c = 0; c <= Math.min(25, range.e.c); c++) {
          const addr = XLSX.utils.encode_cell({ r, c });
          if (ws[addr] && ws[addr].v !== undefined) {
            rowHeaders.push({ col: c + 1, coord: addr, value: ws[addr].v });
          }
        }
        if (rowHeaders.length > 0) headers.push({ row: r + 1, cells: rowHeaders });
      }

      for (const cellAddress in ws) {
        if (cellAddress.startsWith('!')) continue;
        const cell = ws[cellAddress];
        if (cell && (cell.v !== undefined && cell.v !== null && cell.v !== '')) {
          const decoded = XLSX.utils.decode_cell(cellAddress);
          nonEmptyRows.add(decoded.r);
        }
        if (cell && cell.f) {
          formulaCount++;
          if (formulas.length < 10) {
            formulas.push({ coord: cellAddress, formula: cell.f, val: cell.v });
          }
        }
      }

      return {
        name,
        range: ref,
        maxRow: range.e.r + 1,
        maxCol: range.e.c + 1,
        populatedRows: nonEmptyRows.size,
        formulaCount,
        sampleFormulas: formulas,
        headers,
      };
    })
  }
};

fs.writeFileSync(
  path.join(__dirname, 'inspection_summary.json'),
  JSON.stringify(inspectionData, null, 2),
  'utf-8'
);

console.log('\nWrote detailed inspection summary to scripts/inspection_summary.json');
