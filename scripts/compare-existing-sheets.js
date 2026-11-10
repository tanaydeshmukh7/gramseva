const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const OLD_WORKBOOK_PATH = path.join(__dirname, '..', 'ग्रामपंचायत गोहगाव .xlsx');
const NEW_WORKBOOK_PATH = path.join(__dirname, '..', 'ग्रामपंचायत गोहगाव  (1).xlsx');

const oldWb = XLSX.readFile(OLD_WORKBOOK_PATH, { cellFormula: true, cellStyles: true });
const newWb = XLSX.readFile(NEW_WORKBOOK_PATH, { cellFormula: true, cellStyles: true });

const existingSheets = [
  { oldName: 'Sheet1', newName: 'Sheet1' },
  { oldName: 'न.नं.५ पा. पु', newName: 'न.नं.५ पा. पु' },
  { oldName: 'all mobile no', newName: 'all mobile no' },
  { oldName: 'न.८ साठीचे दर', newName: 'न.८ साठीचे दर' },
  { oldName: 'नमुना ८', newName: 'नमुना ८' },
  { oldName: 'उतारा', newName: 'उतारा' },
  { oldName: 'नमुना ९ ', newName: 'नमुना ९ ' },
  { oldName: 'मागणी बिल ', newName: 'मागणी बिल ' },
  { oldName: 'नमुना १० पावती ', newName: 'नमुना १० पावती ' },
  { oldName: 'नमुना ७ पावती ', newName: 'नमुना ७ पावती ' },
  { oldName: 'मासिक सभा नोटीस', newName: 'मासिक सभा नोटीस' },
];

console.log('=== COMPARISON OF 11 EXISTING WORKSHETS ===\n');

existingSheets.forEach(({ oldName, newName }) => {
  const oldWs = oldWb.Sheets[oldName];
  const newWs = newWb.Sheets[newName];

  if (!oldWs) console.log(`Old sheet "${oldName}" not found!`);
  if (!newWs) console.log(`New sheet "${newName}" not found!`);
  if (!oldWs || !newWs) return;

  const oldRef = oldWs['!ref'] || 'A1:A1';
  const newRef = newWs['!ref'] || 'A1:A1';

  let oldCells = 0, newCells = 0;
  let oldFormulas = 0, newFormulas = 0;
  let oldPopRows = new Set(), newPopRows = new Set();

  for (const a in oldWs) {
    if (a.startsWith('!')) continue;
    if (oldWs[a].v !== undefined) {
      oldCells++;
      oldPopRows.add(XLSX.utils.decode_cell(a).r);
    }
    if (oldWs[a].f) oldFormulas++;
  }

  for (const a in newWs) {
    if (a.startsWith('!')) continue;
    if (newWs[a].v !== undefined) {
      newCells++;
      newPopRows.add(XLSX.utils.decode_cell(a).r);
    }
    if (newWs[a].f) newFormulas++;
  }

  console.log(`[${newName}]`);
  console.log(`  Old: Range ${oldRef} | Populated Rows: ${oldPopRows.size} | Value Cells: ${oldCells} | Formulas: ${oldFormulas}`);
  console.log(`  New: Range ${newRef} | Populated Rows: ${newPopRows.size} | Value Cells: ${newCells} | Formulas: ${newFormulas}`);

  // Check differences in first 20 rows
  let diffs = 0;
  const maxRow = Math.max(
    XLSX.utils.decode_range(oldRef).e.r,
    XLSX.utils.decode_range(newRef).e.r
  );
  const maxCol = Math.max(
    XLSX.utils.decode_range(oldRef).e.c,
    XLSX.utils.decode_range(newRef).e.c
  );

  let sampleDiffs = [];
  for (let r = 0; r <= maxRow; r++) {
    for (let c = 0; c <= maxCol; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const oldCell = oldWs[addr];
      const newCell = newWs[addr];

      const oldVal = oldCell ? (oldCell.v !== undefined ? String(oldCell.v) : '') : '';
      const newVal = newCell ? (newCell.v !== undefined ? String(newCell.v) : '') : '';
      const oldF = oldCell ? (oldCell.f || '') : '';
      const newF = newCell ? (newCell.f || '') : '';

      if (oldVal !== newVal || oldF !== newF) {
        diffs++;
        if (sampleDiffs.length < 5) {
          sampleDiffs.push({
            coord: addr,
            oldVal: oldVal ? oldVal.slice(0, 30) : '<empty>',
            newVal: newVal ? newVal.slice(0, 30) : '<empty>',
            oldF: oldF ? '=' + oldF.slice(0, 30) : '',
            newF: newF ? '=' + newF.slice(0, 30) : '',
          });
        }
      }
    }
  }

  console.log(`  Total differing cells: ${diffs}`);
  if (sampleDiffs.length > 0) {
    console.log(`  Sample differences:`);
    sampleDiffs.forEach(d => {
      console.log(`    ${d.coord}: [OLD: "${d.oldVal}" ${d.oldF}] ➔ [NEW: "${d.newVal}" ${d.newF}]`);
    });
  }
  console.log('');
});
