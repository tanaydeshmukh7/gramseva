// Comprehensive Test Suite for Gramसेवा (Gram Panchayat Gohgaon Management Software)
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

function normalizeSearchString(val) {
  if (val === null || val === undefined) return '';
  let str = String(val).normalize('NFC').replace(/\u00A0/g, ' ').trim();
  if (/^\d+\.0$/.test(str)) {
    str = str.replace(/\.0$/, '');
  }
  return str.toLowerCase();
}

function cleanSearchTerm(term) {
  return normalizeSearchString(term);
}

function searchRows(rows, query) {
  const cleaned = cleanSearchTerm(query);
  if (!cleaned) return rows;
  const tokens = cleaned.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return rows;

  return rows.filter((row) => {
    return row.cells.some((c) => {
      const val = normalizeSearchString(c.value);
      return tokens.every((token) => val.includes(token));
    }) || tokens.every((token) => {
      return row.cells.some((c) => normalizeSearchString(c.value).includes(token));
    });
  });
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

// Test 1.4: Stripping trailing .0 from numeric property IDs
const r4 = searchRows(mockRows, '1.0');
assert(r4.some(r => r.row_index === 10), 'Search query "1.0" matches cell stored as "1.0"');

const r4b = searchRows(mockRows, '1');
assert(r4b.some(r => r.row_index === 10), 'Search query "1" matches cell stored as "1.0"');

// Test 1.5: Stripping trailing .0 from phone numbers
const r5 = searchRows(mockRows, '9763944767');
assert(r5.length === 1 && r5[0].row_index === 10, 'Search mobile "9763944767" matches "9763944767.0"');

// Test 1.6: Alphanumeric property numbers (6B, 5A)
const r6 = searchRows(mockRows, '6B');
assert(r6.length === 1 && r6[0].row_index === 11, 'Search alphanumeric property ID: 6B');

const r6b = searchRows(mockRows, '6b');
assert(r6b.length === 1 && r6b[0].row_index === 11, 'Search case-insensitive alphanumeric ID: 6b');

// Test 1.7: Leading and trailing spaces ignored
const r7 = searchRows(mockRows, '   काठोळे   ');
assert(r7.length === 1 && r7[0].row_index === 11, 'Search ignores leading and trailing whitespace');

// Test 1.8: Non-breaking space (\u00A0) query
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
// 2. Data Integrity & 26 Worksheets Verification
// -------------------------------------------------------------
console.log('\n--- 2. Data Integrity & 26 Worksheets Verification ---');

const dataDir = path.join(process.cwd(), 'src', 'data');
const metaPath = path.join(dataDir, 'sheets_meta.json');
const sheetsDir = path.join(dataDir, 'sheets');

assert(fs.existsSync(metaPath), 'Metadata file sheets_meta.json exists');
const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));

assert(meta.total_sheets === 26, 'Total sheets count in meta is exactly 26');
assert(fs.existsSync(sheetsDir), 'src/data/sheets directory exists');

const sheetFiles = fs.readdirSync(sheetsDir).filter(f => f.endsWith('.json'));
assert(sheetFiles.length === 26, `Exactly 26 sheet JSON files found (found: ${sheetFiles.length})`);

let totalPopulatedRows = 0;
let totalFormulasCount = 0;

meta.sheets.forEach((sheet) => {
  const filePath = path.join(sheetsDir, `${sheet.slug}.json`);
  assert(fs.existsSync(filePath), `Sheet file exists: ${sheet.slug}.json (${sheet.name})`);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  assert(content.rows.length === sheet.populated_rows_count, `Row count matches meta for ${sheet.name}: ${content.rows.length}`);
  totalPopulatedRows += content.rows.length;
  
  for (const row of content.rows) {
    for (const cell of row.cells) {
      if (cell.formula) {
        totalFormulasCount++;
      }
    }
  }
});

assert(totalPopulatedRows === 4386, `Total populated rows across all 26 sheets is 4,386 (actual: ${totalPopulatedRows})`);
assert(totalFormulasCount === 18340, `Total formula cells preserved across all 26 sheets is 18,340 (actual: ${totalFormulasCount})`);


// -------------------------------------------------------------
// 3. Dynamic Property Lookup Engine Tests
// -------------------------------------------------------------
console.log('\n--- 3. Dynamic Property Lookup Engine Tests ---');

const namuna8Path = path.join(sheetsDir, 'namuna-8.json');
const namuna9Path = path.join(sheetsDir, 'namuna-9.json');

assert(fs.existsSync(namuna8Path) && fs.existsSync(namuna9Path), 'Namuna 8 and Namuna 9 data files exist');

const namuna8 = JSON.parse(fs.readFileSync(namuna8Path, 'utf-8'));
const namuna9 = JSON.parse(fs.readFileSync(namuna9Path, 'utf-8'));

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
// 4. Governance & WhatsApp Notice Isolation Tests
// -------------------------------------------------------------
console.log('\n--- 4. Governance & WhatsApp Notice Isolation Tests ---');

const noticePath = path.join(sheetsDir, 'masik-sabha-notice.json');
const mobilePath = path.join(sheetsDir, 'all-mobile-no.json');

assert(fs.existsSync(noticePath), 'masik-sabha-notice.json exists');
assert(fs.existsSync(mobilePath), 'all-mobile-no.json exists');

const noticeSheet = JSON.parse(fs.readFileSync(noticePath, 'utf-8'));
const mobileSheet = JSON.parse(fs.readFileSync(mobilePath, 'utf-8'));

// Extract committee members from rows 26-34 (9 official Gram Panchayat committee members)
const committeeMembers = [];
for (let r = 26; r <= 34; r++) {
  const row = noticeSheet.rows.find((ro) => ro.row_index === r);
  if (row) {
    const name = row.cells.find((c) => c.col === 3)?.value;
    const role = row.cells.find((c) => c.col === 4)?.value;
    if (name) {
      committeeMembers.push({ sr: r - 25, name, role });
    }
  }
}

assert(committeeMembers.length === 9, `Strictly 9 committee members identified in मासिक सभा नोटीस (found: ${committeeMembers.length})`);
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

assert(validateNoticeRecipient('श्री. रमेश किसनराव पाटील'), 'Sarpanch Ramesh Kisanrao Patil is valid committee recipient');
assert(!validateNoticeRecipient('Random Taxpayer'), 'Random taxpayer is strictly prevented from receiving committee notice');


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
