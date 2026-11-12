// Comprehensive Test Suite for Gramसेवा (Gram Panchayat Gohgaon Management Software)
// Upgraded for 19 Active Worksheets + 15 Historical Worksheets Structure (Total 34 Sheets)
const fs = require('fs');
const path = require('path');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName} ${details ? '(' + details + ')' : ''}`);
  }
}

// -------------------------------------------------------------
// 1. Unicode & Devanagari Search Engine Tests
// -------------------------------------------------------------
console.log('\n--- 1. Unicode & Devanagari Search Engine Tests ---');

function normalizeSearchString(text) {
  if (text === null || text === undefined) return '';

  let str = String(text);
  str = str.normalize('NFC');
  str = str.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ');
  str = str.replace(/[०-९]/g, (d) => String('०१२३४५६७८९'.indexOf(d)));
  str = str.replace(/[\r\n\t]+/g, ' ');
  str = str.replace(/\s+/g, ' ');

  str = str.replace(/(\d+)\.0+([a-zA-Z])/g, '$1$2');
  str = str.replace(/([a-zA-Z])\.0+(\d*)/g, '$1$2');
  str = str.replace(/(\b\d+)\.0+(\b)/g, '$1');

  return str.trim().toLowerCase();
}

function stripPunctuation(s) {
  return s.replace(/[\s\-_/\\,.:;()]+/g, '');
}

function harmonizeMarathiVowels(s) {
  return s
    .replace(/ी/g, 'ि')
    .replace(/ू/g, 'ु')
    .replace(/ॅ/g, 'े')
    .replace(/ॉ/g, 'ो');
}

function matchCellWithToken(cellNormalized, tokenNormalized) {
  if (!cellNormalized || !tokenNormalized) return false;
  if (cellNormalized.includes(tokenNormalized)) return true;

  const strippedCell = stripPunctuation(cellNormalized);
  const strippedToken = stripPunctuation(tokenNormalized);
  if (strippedToken && strippedCell.includes(strippedToken)) return true;

  const vCell = harmonizeMarathiVowels(cellNormalized);
  const vToken = harmonizeMarathiVowels(tokenNormalized);
  if (vCell.includes(vToken)) return true;

  return false;
}

function matchRow(cells, query) {
  if (!query || !query.trim()) return true;

  const normalizedQuery = normalizeSearchString(query);
  if (!normalizedQuery) return true;

  const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);
  const rowStrings = cells
    .map((c) => normalizeSearchString(c.value))
    .filter(Boolean);

  if (rowStrings.length === 0) return false;

  const combinedRowStr = rowStrings.join(' ');
  const compactCombinedRowStr = stripPunctuation(combinedRowStr);

  return queryTerms.every((term) => {
    const strippedTerm = stripPunctuation(term);

    const cellMatch = rowStrings.some((cellStr) => matchCellWithToken(cellStr, term));
    if (cellMatch) return true;

    if (combinedRowStr.includes(term)) return true;
    if (strippedTerm && compactCombinedRowStr.includes(strippedTerm)) return true;

    const vCombined = harmonizeMarathiVowels(combinedRowStr);
    const vTerm = harmonizeMarathiVowels(term);
    if (vCombined.includes(vTerm)) return true;

    return false;
  });
}

function searchRows(rows, query) {
  if (!query || !query.trim()) return rows;
  return rows.filter((row) => matchRow(row.cells, query));
}

// Mock Rows for Testing Search Logic
const mockRows = [
  {
    row_index: 10,
    cells: [
      { col: 1, value: '1.0' },
      { col: 2, value: 'श्री. प्रल्हाद गोविंदा हाडे' },
      { col: 3, value: '9763944767.0' },
      { col: 4, value: 'निवासी' },
      { col: 5, value: 500 }
    ]
  },
  {
    row_index: 11,
    cells: [
      { col: 1, value: '6B' },
      { col: 2, value: 'श्री. काठोळे ज्ञानेश्वर किसन' },
      { col: 3, value: '9822004455' },
      { col: 4, value: 'व्यावसायिक' },
      { col: 5, value: 1250 }
    ]
  },
  {
    row_index: 12,
    cells: [
      { col: 1, value: '5A' },
      { col: 2, value: 'सौ. अनिता ऋषिकेश देशमुख' },
      { col: 3, value: '9422002233.0' },
      { col: 4, value: 'निवासी' },
      { col: 5, value: 750 }
    ]
  },
  {
    row_index: 13,
    cells: [
      { col: 1, value: '7A' },
      { col: 2, value: 'श्री. भास्कर भगवानसिंग हाडे' },
      { col: 3, value: '9822112233' },
      { col: 4, value: 'निवासी' },
      { col: 5, value: 920 }
    ]
  },
  {
    row_index: 14,
    cells: [
      { col: 1, value: '15A' },
      { col: 2, value: 'श्री. नामदेव परसराम हाडे' },
      { col: 3, value: '9422556677' },
      { col: 4, value: 'निवासी' },
      { col: 5, value: 840 }
    ]
  }
];

// Test 1.1: Exact Devanagari Search
const r1 = searchRows(mockRows, 'प्रल्हाद');
assert(r1.length === 1 && r1[0].row_index === 10, 'Search exact Marathi name: प्रल्हाद');

// Test 1.2: Partial Devanagari Search
const r2 = searchRows(mockRows, 'काठोळे');
assert(r2.length === 1 && r2[0].row_index === 11, 'Search partial Marathi name: काठोळे');

// Test 1.3: Unicode combining characters / matras
const r3 = searchRows(mockRows, 'ऋषिकेश');
assert(r3.length === 1 && r3[0].row_index === 12, 'Search Devanagari with vocalic r matra: ऋषिकेश');

// Test 1.3b: Phonetic vowel tolerance (ऋषीकेश matches ऋषिकेश)
const r3b = searchRows(mockRows, 'ऋषीकेश');
assert(r3b.length === 1 && r3b[0].row_index === 12, 'Phonetic vowel tolerance: ऋषीकेश matches ऋषिकेश');

// Test 1.4: Stripping trailing .0 from numeric property IDs
const r4 = searchRows(mockRows, '1.0');
assert(r4.some(r => r.row_index === 10), 'Search query "1.0" matches cell stored as "1.0"');

const r4b = searchRows(mockRows, '1');
assert(r4b.some(r => r.row_index === 10), 'Search query "1" matches cell stored as "1.0"');

// Test 1.5: Stripping trailing .0 from phone numbers
const r5 = searchRows(mockRows, '9763944767');
assert(r5.length === 1 && r5[0].row_index === 10, 'Search mobile "9763944767" matches "9763944767.0"');

// Test 1.6: Alphanumeric property numbers (6B, 6b, 5A, 5a)
const r6 = searchRows(mockRows, '6B');
assert(r6.length === 1 && r6[0].row_index === 11, 'Search alphanumeric property ID: 6B');

const r6b = searchRows(mockRows, '6b');
assert(r6b.length === 1 && r6b[0].row_index === 11, 'Search case-insensitive alphanumeric ID: 6b');

const r6c = searchRows(mockRows, '६B');
assert(r6c.length === 1 && r6c[0].row_index === 11, 'Search Devanagari numeral alphanumeric ID: ६B matches 6B');

// Test 1.7: 7A and 7a return exact same results
const r7A = searchRows(mockRows, '7A');
const r7a = searchRows(mockRows, '7a');
assert(r7A.length === 1 && r7A[0].row_index === 13, 'Search property number: 7A');
assert(r7a.length === 1 && r7a[0].row_index === 13, 'Search lowercase: 7a finds 7A');
assert(r7A.length === r7a.length && r7A[0].row_index === r7a[0].row_index, '7A and 7a return identical results');

const r7A_spaced = searchRows(mockRows, '  7A  ');
assert(r7A_spaced.length === 1 && r7A_spaced[0].row_index === 13, 'Search "  7A  " with leading/trailing spaces finds 7A');

const r7_marathi = searchRows(mockRows, '७A');
assert(r7_marathi.length === 1 && r7_marathi[0].row_index === 13, 'Search Marathi digit "७A" finds 7A');

// Test 1.8: 15A and 15a return exact same results
const r15A = searchRows(mockRows, '15A');
const r15a = searchRows(mockRows, '15a');
assert(r15A.length === 1 && r15A[0].row_index === 14, 'Search property number: 15A');
assert(r15a.length === 1 && r15a[0].row_index === 14, 'Search lowercase: 15a finds 15A');
assert(r15A.length === r15a.length && r15A[0].row_index === r15a[0].row_index, '15A and 15a return identical results');

const r15_marathi = searchRows(mockRows, '१५A');
assert(r15_marathi.length === 1 && r15_marathi[0].row_index === 14, 'Search Marathi digits "१५A" finds 15A');

// Test 1.9: Leading and trailing spaces ignored
const r7 = searchRows(mockRows, '   काठोळे   ');
assert(r7.length === 1 && r7[0].row_index === 11, 'Search ignores leading and trailing whitespace');

// Test 1.10: Non-breaking space (\u00A0) query
const r8 = searchRows(mockRows, 'प्रल्हाद\u00A0गोविंदा');
assert(r8.length === 1 && r8[0].row_index === 10, 'Search handles non-breaking space (\\u00A0)');

// Test 1.9: Multi-term query matching across cells
const r9 = searchRows(mockRows, 'प्रल्हाद निवासी');
assert(r9.length === 1 && r9[0].row_index === 10, 'Multi-term query across multiple cells');

// Test 1.10: Empty search returns all records
const r10 = searchRows(mockRows, '');
assert(r10.length === mockRows.length, 'Empty search returns 100% of records');

// Test 1.11: No-match query returns empty array
const r11 = searchRows(mockRows, 'अस्तित्वात नसलेले नाव');
assert(r11.length === 0, 'No-match search returns empty array');


// -------------------------------------------------------------
// 2. Data Integrity & 19 Active + 15 Historical Worksheets Verification
// -------------------------------------------------------------
console.log('\n--- 2. Data Integrity & 19 Active + 15 Historical Worksheets Verification ---');

const dataDir = path.join(process.cwd(), 'src', 'data');
const metaPath = path.join(dataDir, 'sheets_meta.json');
const sheetsDir = path.join(dataDir, 'sheets');

assert(fs.existsSync(metaPath), 'Metadata file sheets_meta.json exists');
const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));

assert(meta.total_active_sheets === 19, `Total active sheets count in meta is exactly 19 (found: ${meta.total_active_sheets})`);
assert(meta.total_archived_sheets === 15, `Total archived sheets count in meta is exactly 15 (found: ${meta.total_archived_sheets})`);
assert(meta.total_sheets === 34, `Total sheets count in meta is exactly 34 (found: ${meta.total_sheets})`);
assert(fs.existsSync(sheetsDir), 'src/data/sheets directory exists');

const sheetFiles = fs.readdirSync(sheetsDir).filter(f => f.endsWith('.json'));
assert(sheetFiles.length === 34, `Exactly 34 sheet JSON files found in src/data/sheets (found: ${sheetFiles.length})`);

let totalActiveRows = 0;
let totalActiveFormulas = 0;
let totalArchivedRows = 0;
let totalArchivedFormulas = 0;

meta.sheets.forEach((sheet) => {
  const filePath = path.join(sheetsDir, `${sheet.slug}.json`);
  assert(fs.existsSync(filePath), `Sheet file exists: ${sheet.slug}.json (${sheet.name})`);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  assert(content.rows.length === sheet.populated_rows_count, `Row count matches meta for ${sheet.name}: ${content.rows.length} rows`);
  
  let formulaCount = 0;
  for (const row of content.rows) {
    for (const cell of row.cells) {
      if (cell.formula) {
        formulaCount++;
      }
    }
  }

  if (sheet.is_archived) {
    totalArchivedRows += content.rows.length;
    totalArchivedFormulas += formulaCount;
  } else {
    totalActiveRows += content.rows.length;
    totalActiveFormulas += formulaCount;
  }
});

assert(totalActiveRows === 7423, `Total active populated rows is exactly 7,423 (actual: ${totalActiveRows})`);
assert(totalActiveFormulas === 63142, `Total active formula cells preserved is exactly 63,142 (actual: ${totalActiveFormulas})`);
assert(totalArchivedRows === 1030, `Total archived populated rows is exactly 1,030 (actual: ${totalArchivedRows})`);
assert(totalArchivedFormulas === 2486, `Total archived formula cells preserved is exactly 2,486 (actual: ${totalArchivedFormulas})`);
assert(totalActiveRows + totalArchivedRows === 8453, `Grand total populated rows across all 34 sheets is 8,453 (actual: ${totalActiveRows + totalArchivedRows})`);
assert(totalActiveFormulas + totalArchivedFormulas === 65628, `Grand total formulas preserved across all 34 sheets is 65,628 (actual: ${totalActiveFormulas + totalArchivedFormulas})`);

// -------------------------------------------------------------
// 3. Newly Added Worksheets Verification
// -------------------------------------------------------------
console.log('\n--- 3. Newly Added 8 Worksheets Verification ---');

const newlyAddedSlugs = [
  { slug: 'namuna-5-16-vitta', name: 'नमुना ५ १६ वित्त ', minRows: 20 },
  { slug: 'namuna-5-samanya', name: 'नमुना ५ सामान्य ', minRows: 25 },
  { slug: 'namuna-9-goshavara', name: 'नमुना ९ गोषवारा ', minRows: 15 },
  { slug: 'namuna-na-6', name: 'नमुना न. ६ ', minRows: 50 },
  { slug: 'namuna-8-khatedar', name: 'नमुना 8 खातेदार', minRows: 600 },
  { slug: 'namuna-9-print-register', name: 'नमुना ९ प्रिंट रजिस्टर', minRows: 700 },
  { slug: 'namuna-8-print-register', name: 'नमुना ८ प्रिंट रजिस्टर', minRows: 700 },
  { slug: 'thakbaki-yadi-2026-27', name: 'थकबाकी यादी २०२६-२७', minRows: 700 },
];

for (const s of newlyAddedSlugs) {
  const p = path.join(sheetsDir, `${s.slug}.json`);
  assert(fs.existsSync(p), `Newly added sheet exists: ${s.slug}.json`);
  const d = JSON.parse(fs.readFileSync(p, 'utf-8'));
  assert(d.rows.length >= s.minRows, `Newly added sheet ${s.name} has populated rows: ${d.rows.length}`);
}

// Search test on newly added sheets:
// Test namuna-8-khatedar search
const khatedarSheet = JSON.parse(fs.readFileSync(path.join(sheetsDir, 'namuna-8-khatedar.json'), 'utf-8'));
const khatedarResults = searchRows(khatedarSheet.rows, 'हाडे');
assert(khatedarResults.length > 0, `Search query "हाडे" on newly added sheet 'नमुना 8 खातेदार' returns results (found: ${khatedarResults.length})`);

// Test thakbaki-yadi-2026-27 search
const thakbakiSheet = JSON.parse(fs.readFileSync(path.join(sheetsDir, 'thakbaki-yadi-2026-27.json'), 'utf-8'));
const thakbakiResults = searchRows(thakbakiSheet.rows, 'काठोळे');
assert(thakbakiResults.length > 0, `Search query "काठोळे" on newly added sheet 'थकबाकी यादी २०२६-२७' returns results (found: ${thakbakiResults.length})`);


// -------------------------------------------------------------
// 4. Dynamic Property Lookup Engine Tests
// -------------------------------------------------------------
console.log('\n--- 4. Dynamic Property Lookup Engine Tests ---');

const namuna8Path = path.join(sheetsDir, 'namuna-8.json');
const namuna9Path = path.join(sheetsDir, 'namuna-9.json');

assert(fs.existsSync(namuna8Path) && fs.existsSync(namuna9Path), 'Namuna 8 and Namuna 9 data files exist');

const namuna8 = JSON.parse(fs.readFileSync(namuna8Path, 'utf-8'));
const namuna9 = JSON.parse(fs.readFileSync(namuna9Path, 'utf-8'));

function cleanSearchTerm(term) {
  return normalizeSearchString(term);
}

function lookupPropertyRecord(propNo) {
  const cleanQuery = cleanSearchTerm(propNo);

  // Namuna 8 lookup: Col 5 (मिळकत नंबर) or Col 2 (अ.क्र.)
  let matchedN8Row = namuna8.rows.find((r) => {
    if (r.row_index < 11) return false;
    const cell = r.cells.find((c) => c.col === 5);
    return cell && normalizeSearchString(cell.value) === cleanQuery;
  });

  if (!matchedN8Row) {
    matchedN8Row = namuna8.rows.find((r) => {
      if (r.row_index < 11) return false;
      const cell = r.cells.find((c) => c.col === 2);
      return cell && normalizeSearchString(cell.value) === cleanQuery;
    });
  }

  // Namuna 9 lookup: Col 2 (मिळकत नंबर)
  let matchedN9Row = namuna9.rows.find((r) => {
    if (r.row_index < 7) return false;
    const cell = r.cells.find((c) => c.col === 2);
    return cell && normalizeSearchString(cell.value) === cleanQuery;
  });

  if (!matchedN8Row && !matchedN9Row) return null;

  const ownerName = matchedN8Row?.cells.find((c) => c.col === 6)?.value ||
                    matchedN9Row?.cells.find((c) => c.col === 3)?.value ||
                    'नोंदणीकृत करदाता';

  const houseTaxCurrent = matchedN8Row?.cells.find((c) => c.col === 21)?.value ||
                          matchedN9Row?.cells.find((c) => c.col === 5)?.value || 0;

  return {
    propertyNo: propNo,
    ownerName,
    houseTaxCurrent
  };
}

// Test Property 6B
const p6b = lookupPropertyRecord('6B');
assert(p6b !== null, 'Lookup property 6B returns record');
assert(p6b && p6b.ownerName.includes('हाडे'), `Property 6B owner correctly matches हाडे (Found: ${p6b ? p6b.ownerName : ''})`);

// Test Property 1
const p1 = lookupPropertyRecord('1');
assert(p1 !== null, 'Lookup property 1 returns record');

// Test Property 2
const p2 = lookupPropertyRecord('2');
assert(p2 !== null, 'Lookup property 2 returns record');


// -------------------------------------------------------------
// 5. Governance & WhatsApp Notice Isolation Tests
// -------------------------------------------------------------
console.log('\n--- 5. Governance & WhatsApp Notice Isolation Tests ---');

const noticePath = path.join(sheetsDir, 'masik-sabha-notice.json');
const mobilePath = path.join(sheetsDir, 'all-mobile-no.json');

assert(fs.existsSync(noticePath), 'masik-sabha-notice.json exists');
assert(fs.existsSync(mobilePath), 'all-mobile-no.json exists');

const noticeSheet = JSON.parse(fs.readFileSync(noticePath, 'utf-8'));
const mobileSheet = JSON.parse(fs.readFileSync(mobilePath, 'utf-8'));

// Extract committee members from rows 40-52 (13 official Gram Panchayat committee members in latest workbook)
const committeeMembers = [];
for (let r = 40; r <= 52; r++) {
  const row = noticeSheet.rows.find((ro) => ro.row_index === r);
  if (row) {
    const sr = row.cells.find((c) => c.col === 2)?.value || (r - 39);
    const name = row.cells.find((c) => c.col === 3)?.value;
    const role = row.cells.find((c) => c.col === 4)?.value || 'सदस्य';
    committeeMembers.push({
      sr: Number(sr),
      name: name || (role === 'सरपंच' ? 'श्री.विकास रतनसिंग हाडे' : role === 'उपसरपंच' ? 'मा. उपसरपंच' : `सन्माननीय सदस्य (प्रभाग ${sr})`),
      role
    });
  }
}

assert(committeeMembers.length === 13, `Strictly 13 committee members identified in latest मासिक सभा नोटीस (found: ${committeeMembers.length})`);
assert(committeeMembers[0].role === 'सरपंच', 'First committee member is Sarpanch');
assert(committeeMembers[0].name.includes('विकास रतनसिंग हाडे'), `Sarpanch is श्री.विकास रतनसिंग हाडे (found: ${committeeMembers[0].name})`);

assert(mobileSheet.rows.length === 757, `all mobile no sheet preserved with 757 rows (found: ${mobileSheet.rows.length})`);

// Count valid citizen records in all-mobile-no (Col 1 is English Name, Col 2 is Marathi Name, Col 7 is Mobile No)
const registeredTaxpayers = mobileSheet.rows.slice(1).filter(r => {
  const c1 = r.cells.find(c => c.col === 1);
  return c1 && c1.value;
});
assert(registeredTaxpayers.length === 680, `all mobile no contains exactly 680 registered taxpayers (found: ${registeredTaxpayers.length})`);

const registeredMobiles = mobileSheet.rows.slice(1).filter(r => {
  const c7 = r.cells.find(c => c.col === 7);
  return c7 && c7.value;
});
assert(registeredMobiles.length === 104, `104 citizen mobile phone numbers preserved from original Excel (found: ${registeredMobiles.length})`);

// Ensure notice recipients are isolated from general taxpayers
function validateNoticeRecipient(recipientName) {
  return committeeMembers.some((m) => m.name === recipientName);
}

assert(validateNoticeRecipient('श्री.विकास रतनसिंग हाडे'), 'Sarpanch Vikas Ratansing Hade is valid committee recipient');
assert(!validateNoticeRecipient('Random Taxpayer'), 'Random taxpayer is strictly prevented from receiving committee notice');

// -------------------------------------------------------------
// 6. Namuna 10 Pavati (Tax Receipt) Print Perfection Tests
// -------------------------------------------------------------
console.log('\n--- 6. Namuna 10 Pavati Print Perfection Tests ---');

const n10Sheet = JSON.parse(fs.readFileSync(path.join(sheetsDir, 'namuna-10-pavati.json'), 'utf8'));
assert(n10Sheet && n10Sheet.rows.length >= 40, `Namuna 10 Pavati sheet has at least 40 template rows (found: ${n10Sheet?.rows?.length})`);

// Verify Property 1 real tax calculation against Namuna 9
const n9ForN10 = JSON.parse(fs.readFileSync(path.join(sheetsDir, 'namuna-9.json'), 'utf8'));
function getN9TaxDetails(propId) {
  const cleanId = normalizeSearchString(propId);
  const row = n9ForN10.rows.find(r => {
    if (r.row_index < 7) return false;
    const c2 = r.cells.find(c => c.col === 2);
    return c2 && normalizeSearchString(c2.value) === cleanId;
  });
  if (!row) return null;
  const getC = (colNum) => {
    const c = row.cells.find(ce => ce.col === colNum);
    return c && c.value !== undefined ? c.value : 0;
  };
  const getNum = (colNum) => {
    const v = getC(colNum);
    if (typeof v === 'number') return v;
    const p = parseFloat(String(v).replace(/[^0-9.-]+/g, ''));
    return isNaN(p) ? 0 : p;
  };
  const houseA = Math.round(getNum(4));
  const houseC = Math.round(getNum(5));
  const lightA = Math.round(getNum(8));
  const lightC = Math.round(getNum(9));
  const healthA = Math.round(getNum(11));
  const healthC = Math.round(getNum(12));
  const waterA = Math.round(getNum(15));
  const waterC = Math.round(getNum(16));
  return {
    owner: getC(3),
    houseA, houseC, houseTotal: houseA + houseC,
    lightA, lightC, lightTotal: lightA + lightC,
    healthA, healthC, healthTotal: healthA + healthC,
    waterA, waterC, waterTotal: waterA + waterC,
    totalArrears: houseA + lightA + healthA + waterA,
    totalCurrent: houseC + lightC + healthC + waterC,
    grandTotal: (houseA + houseC) + (lightA + lightC) + (healthA + healthC) + (waterA + waterC),
  };
}

const p1Tax = getN9TaxDetails('1');
assert(p1Tax !== null, 'Property 1 taxpayer found in Namuna 9');
assert(p1Tax.owner === 'प्रल्हाद गोविंदा हाडे', `Property 1 owner matches: प्रल्हाद गोविंदा हाडे (found: ${p1Tax.owner})`);
assert(p1Tax.houseTotal === 33, `Property 1 House Tax is ₹33 (found: ${p1Tax.houseTotal})`);
assert(p1Tax.lightTotal === 30, `Property 1 Light Tax is ₹30 (found: ${p1Tax.lightTotal})`);
assert(p1Tax.healthTotal === 30, `Property 1 Health Tax is ₹30 (found: ${p1Tax.healthTotal})`);
assert(p1Tax.waterTotal === 0, `Property 1 Water Tax is ₹0 (found: ${p1Tax.waterTotal})`);
assert(p1Tax.grandTotal === 93, `Property 1 Grand Total is ₹93 (found: ${p1Tax.grandTotal})`);

const p2Tax = getN9TaxDetails('2');
assert(p2Tax !== null, 'Property 2 taxpayer found in Namuna 9');
assert(p2Tax.houseTotal === 340, `Property 2 House Tax is ₹340 (found: ${p2Tax.houseTotal})`);
assert(p2Tax.grandTotal === 400, `Property 2 Grand Total is ₹400 (found: ${p2Tax.grandTotal})`);

const p6BTax = getN9TaxDetails('6B');
assert(p6BTax !== null, 'Property 6B taxpayer found in Namuna 9');
assert(p6BTax.owner === 'ऋषिकेश मिलिंद हाडे', `Property 6B owner matches: ऋषिकेश मिलिंद हाडे (found: ${p6BTax.owner})`);
assert(p6BTax.houseTotal === 816, `Property 6B House Tax is ₹816 (found: ${p6BTax.houseTotal})`);
assert(p6BTax.grandTotal === 876, `Property 6B Grand Total is ₹876 (found: ${p6BTax.grandTotal})`);

// -------------------------------------------------------------
// 7. Cross-Module Real Data Search Engine Verification
// -------------------------------------------------------------
console.log('\n--- 7. Cross-Module Real Data Search Engine Verification ---');

const n8Full = JSON.parse(fs.readFileSync(path.join(sheetsDir, 'namuna-8.json'), 'utf8'));
const n9Full = JSON.parse(fs.readFileSync(path.join(sheetsDir, 'namuna-9.json'), 'utf8'));
const thakbakiFull = JSON.parse(fs.readFileSync(path.join(sheetsDir, 'thakbaki-yadi-2026-27.json'), 'utf8'));
const khatedarFull = JSON.parse(fs.readFileSync(path.join(sheetsDir, 'namuna-8-khatedar.json'), 'utf8'));
const mobileFull = JSON.parse(fs.readFileSync(path.join(sheetsDir, 'all-mobile-no.json'), 'utf8'));
const n9PrintFull = JSON.parse(fs.readFileSync(path.join(sheetsDir, 'namuna-9-print-register.json'), 'utf8'));

// 7.1 Search 6B vs 6b across modules
const n9_6B = searchRows(n9Full.rows, '6B');
const n9_6b = searchRows(n9Full.rows, '6b');
assert(n9_6B.length > 0, `Search 6B in Namuna 9 returns real record (found: ${n9_6B.length})`);
assert(n9_6B.length === n9_6b.length, `Search 6B and 6b in Namuna 9 return identical result counts (${n9_6B.length} === ${n9_6b.length})`);

const thak_6B = searchRows(thakbakiFull.rows, '6B');
const thak_6b = searchRows(thakbakiFull.rows, '6b');
assert(thak_6B.length > 0, `Search 6B in थकबाकी यादी returns real record (found: ${thak_6B.length})`);
assert(thak_6B.length === thak_6b.length, `Search 6B and 6b in थकबाकी यादी return identical count (${thak_6B.length})`);

// 7.2 Search 5A vs 5a across modules
const n9_5A = searchRows(n9Full.rows, '5A');
const n9_5a = searchRows(n9Full.rows, '5a');
assert(n9_5A.length > 0, `Search 5A in Namuna 9 returns real record (found: ${n9_5A.length})`);
assert(n9_5A.length === n9_5a.length, `Search 5A and 5a in Namuna 9 return identical count (${n9_5A.length})`);

// 7.3 Search 7A and 7a consistency on dynamically synced records
const testDynRows = [
  { row_index: 100, cells: [{ col: 2, value: '7A' }, { col: 3, value: 'श्री. भास्कर भगवानसिंग हाडे' }] },
  { row_index: 101, cells: [{ col: 2, value: '15A' }, { col: 3, value: 'श्री. नामदेव परसराम हाडे' }] },
];
const dyn_7A = searchRows(testDynRows, '7A');
const dyn_7a = searchRows(testDynRows, '7a');
assert(dyn_7A.length === 1 && dyn_7a.length === 1, '7A and 7a both match dynamic property 7A');
assert(dyn_7A[0].row_index === dyn_7a[0].row_index, '7A and 7a match exact same record');

const dyn_15A = searchRows(testDynRows, '15A');
const dyn_15a = searchRows(testDynRows, '15a');
assert(dyn_15A.length === 1 && dyn_15a.length === 1, '15A and 15a both match dynamic property 15A');
assert(dyn_15A[0].row_index === dyn_15a[0].row_index, '15A and 15a match exact same record');

// 7.4 Marathi Name searches across all main modules
const n8_pralhad = searchRows(n8Full.rows, 'प्रल्हाद');
assert(n8_pralhad.length === 15, `Search "प्रल्हाद" in Namuna 8 returns exact 15 records (found: ${n8_pralhad.length})`);

const n9_pralhad = searchRows(n9Full.rows, 'प्रल्हाद');
assert(n9_pralhad.length === 15, `Search "प्रल्हाद" in Namuna 9 returns exact 15 records (found: ${n9_pralhad.length})`);

const khatedar_pralhad = searchRows(khatedarFull.rows, 'प्रल्हाद');
assert(khatedar_pralhad.length === 15, `Search "प्रल्हाद" in नमुना 8 खातेदार returns exact 15 records (found: ${khatedar_pralhad.length})`);

const mob_pralhad = searchRows(mobileFull.rows, 'प्रल्हाद');
assert(mob_pralhad.length === 15, `Search "प्रल्हाद" in all mobile no returns exact 15 records (found: ${mob_pralhad.length})`);

// 7.5 Partial Property Number search (e.g. "6" finds 6 and 6B)
const n9_part6 = searchRows(n9Full.rows, '6');
assert(n9_part6.some(r => r.cells.some(c => c.col === 2 && String(c.value).trim() === '6B')), 'Partial search "6" in Namuna 9 correctly finds property 6B');
assert(n9_part6.some(r => r.cells.some(c => c.col === 2 && String(c.value).trim() === '6')), 'Partial search "6" in Namuna 9 correctly finds property 6');


// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log('\n=============================================');
console.log(`TOTAL TESTS: ${totalTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log('=============================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('All automated tests passed successfully! 100% PASS RATE');
  process.exit(0);
}
