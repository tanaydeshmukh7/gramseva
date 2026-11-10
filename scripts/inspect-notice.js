const path = require('path');
const XLSX = require('xlsx');

const OLD_WORKBOOK_PATH = path.join(__dirname, '..', 'ग्रामपंचायत गोहगाव .xlsx');
const NEW_WORKBOOK_PATH = path.join(__dirname, '..', 'ग्रामपंचायत गोहगाव  (1).xlsx');

const oldWb = XLSX.readFile(OLD_WORKBOOK_PATH);
const newWb = XLSX.readFile(NEW_WORKBOOK_PATH);

const oldNotice = oldWb.Sheets['मासिक सभा नोटीस'];
const newNotice = newWb.Sheets['मासिक सभा नोटीस'];

console.log('=== MASIK SABHA NOTICE COMPARISON ===\n');

console.log('--- OLD NOTICE ROWS ---');
for (let r = 1; r <= 40; r++) {
  let rowStr = [];
  for (let c = 0; c <= 7; c++) {
    const addr = XLSX.utils.encode_cell({ r: r - 1, c });
    if (oldNotice[addr] && oldNotice[addr].v) {
      rowStr.push(`${addr}: "${oldNotice[addr].v}"`);
    }
  }
  if (rowStr.length > 0) console.log(`Row ${r}: ${rowStr.join(' | ')}`);
}

console.log('\n--- NEW NOTICE ROWS ---');
for (let r = 1; r <= 60; r++) {
  let rowStr = [];
  for (let c = 0; c <= 7; c++) {
    const addr = XLSX.utils.encode_cell({ r: r - 1, c });
    if (newNotice[addr] && newNotice[addr].v) {
      rowStr.push(`${addr}: "${newNotice[addr].v}"`);
    }
  }
  if (rowStr.length > 0) console.log(`Row ${r}: ${rowStr.join(' | ')}`);
}
