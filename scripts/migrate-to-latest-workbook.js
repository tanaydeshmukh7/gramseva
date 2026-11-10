const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const NEW_WORKBOOK_PATH = path.join(__dirname, '..', 'ग्रामपंचायत गोहगाव  (1).xlsx');
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const SHEETS_DIR = path.join(DATA_DIR, 'sheets');
const META_FILE = path.join(DATA_DIR, 'sheets_meta.json');

console.log('=== STARTING WORKBOOK MIGRATION ===\n');

if (!fs.existsSync(NEW_WORKBOOK_PATH)) {
  console.error('Workbook not found:', NEW_WORKBOOK_PATH);
  process.exit(1);
}

const wb = XLSX.readFile(NEW_WORKBOOK_PATH, { cellFormula: true, cellStyles: true });

// Convert column index to Excel column letters (1 -> A, 27 -> AA)
function colToLetter(colIndex) {
  let temp = colIndex;
  let letter = '';
  while (temp > 0) {
    const mod = (temp - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    temp = Math.floor((temp - mod) / 26);
  }
  return letter || 'A';
}

const ACTIVE_SHEETS_CONFIG = [
  { name: 'Sheet1', slug: 'sheet1', category: 'प्रशासकीय संदर्भ' },
  { name: 'न.नं.५ पा. पु', slug: 'namuna-5-pani-purwatha', category: 'कॅशबुक (पाणी पुरवठा)' },
  { name: 'all mobile no', slug: 'all-mobile-no', category: 'करदाते संपर्क (Citizens)' },
  { name: 'नमुना ५ १६ वित्त ', slug: 'namuna-5-16-vitta', category: 'कॅशबुक (१६ वा वित्त आयोग)' },
  { name: 'नमुना ५ सामान्य ', slug: 'namuna-5-samanya', category: 'कॅशबुक (सामान्य निधी)' },
  { name: 'न.८ साठीचे दर', slug: 'namuna-8-rates', category: 'कर आकारणी दर (Rates)' },
  { name: 'नमुना ८', slug: 'namuna-8', category: 'मालमत्ता नोंदवही (Assessment)' },
  { name: 'उतारा', slug: 'utara', category: 'दाखले व उतारे (Extracts)' },
  { name: 'नमुना ९ ', slug: 'namuna-9', category: 'कर मागणी नोंदवही (Demand)' },
  { name: 'नमुना ९ गोषवारा ', slug: 'namuna-9-goshavara', category: 'कर मागणी गोषवारा (Abstract)' },
  { name: 'मागणी बिल ', slug: 'magani-bill', category: 'कर मागणी बिल (Bills)' },
  { name: 'नमुना १० पावती ', slug: 'namuna-10-pavati', category: 'कर पावती (Tax Receipts)' },
  { name: 'नमुना ७ पावती ', slug: 'namuna-7-pavati', category: 'किरकोळ वसुली पावती (Misc Receipts)' },
  { name: 'नमुना न. ६ ', slug: 'namuna-na-6', category: 'जमा नोंदवही (Classified Register)' },
  { name: 'मासिक सभा नोटीस', slug: 'masik-sabha-notice', category: 'मासिक सभा (Governance)' },
  { name: 'नमुना 8 खातेदार', slug: 'namuna-8-khatedar', category: 'खातेदार यादी (Khatedar Directory)' },
  { name: 'नमुना ९ प्रिंट रजिस्टर', slug: 'namuna-9-print-register', category: 'मुद्रण रजिस्टर (Print Register)' },
  { name: 'नमुना ८ प्रिंट रजिस्टर', slug: 'namuna-8-print-register', category: 'मुद्रण रजिस्टर (Print Register)' },
  { name: 'थकबाकी यादी २०२६-२७', slug: 'thakbaki-yadi-2026-27', category: 'थकबाकी अहवाल (Arrears Register)' },
];

const newMetaSheets = [];
let totalPopulatedRows = 0;
let totalFormulas = 0;

ACTIVE_SHEETS_CONFIG.forEach((config, idx) => {
  const ws = wb.Sheets[config.name];
  if (!ws) {
    console.error(`ERROR: Sheet "${config.name}" not found in new workbook!`);
    return;
  }

  const ref = ws['!ref'] || 'A1:A1';
  const range = XLSX.utils.decode_range(ref);
  const rows = [];
  const mergedRanges = (ws['!merges'] || []).map((m) => XLSX.utils.encode_range(m));

  let sheetFormulas = 0;

  for (let r = 0; r <= range.e.r; r++) {
    const cells = [];
    let hasValue = false;

    for (let c = 0; c <= range.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = ws[addr];

      if (cell && (cell.v !== undefined || cell.f)) {
        hasValue = true;
        const isFormula = Boolean(cell.f);
        if (isFormula) {
          sheetFormulas++;
          totalFormulas++;
        }

        cells.push({
          col: c + 1,
          coord: addr,
          value: cell.v !== undefined ? cell.v : null,
          is_formula: isFormula,
          formula: cell.f ? (cell.f.startsWith('=') ? cell.f : `=${cell.f}`) : null,
        });
      }
    }

    if (hasValue) {
      rows.push({
        row_index: r + 1,
        cells,
      });
    }
  }

  totalPopulatedRows += rows.length;

  const sheetData = {
    index: idx + 1,
    name: config.name.trim(),
    original_sheet_name: config.name,
    slug: config.slug,
    category: config.category,
    is_archived: false,
    max_row: range.e.r + 1,
    max_col: range.e.c + 1,
    populated_rows_count: rows.length,
    formula_count: sheetFormulas,
    merged_ranges: mergedRanges,
    rows,
  };

  const filePath = path.join(SHEETS_DIR, `${config.slug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(sheetData, null, 2), 'utf-8');

  newMetaSheets.push({
    index: idx + 1,
    name: config.name.trim(),
    original_sheet_name: config.name,
    slug: config.slug,
    category: config.category,
    is_archived: false,
    max_row: range.e.r + 1,
    max_col: range.e.c + 1,
    populated_rows_count: rows.length,
    formula_count: sheetFormulas,
    merged_ranges_count: mergedRanges.length,
  });

  console.log(
    `✓ Processed: [${config.name.trim()}] -> ${config.slug}.json (${rows.length} rows, ${sheetFormulas} formulas)`
  );
});

// Now include Historical / Archived sheets
const ARCHIVED_SHEETS = [
  { name: 'May', slug: 'may', category: 'ऐतिहासिक मासिक कॅशबुक (सन २०२१-२२)' },
  { name: 'Jun', slug: 'jun', category: 'ऐतिहासिक मासिक कॅशबुक (सन २०२१-२२)' },
  { name: 'July', slug: 'july', category: 'ऐतिहासिक मासिक कॅशबुक (सन २०२१-२२)' },
  { name: 'Aug', slug: 'aug', category: 'ऐतिहासिक मासिक कॅशबुक (सन २०२१-२२)' },
  { name: 'Sep', slug: 'sep', category: 'ऐतिहासिक मासिक कॅशबुक (सन २०२१-२२)' },
  { name: 'Oct', slug: 'oct', category: 'ऐतिहासिक मासिक कॅशबुक (सन २०२१-२२)' },
  { name: 'Nov', slug: 'nov', category: 'ऐतिहासिक मासिक कॅशबुक (सन २०२१-२२)' },
  { name: 'Dec', slug: 'dec', category: 'ऐतिहासिक मासिक कॅशबुक (सन २०२१-२२)' },
  { name: 'Jan', slug: 'jan', category: 'ऐतिहासिक मासिक कॅशबुक (सन २०२१-२२)' },
  { name: 'Feb', slug: 'feb', category: 'ऐतिहासिक मासिक कॅशबुक (सन २०२१-२२)' },
  { name: 'वसुली रिपोर्ट', slug: 'vasuli-report', category: 'ऐतिहासिक वसुली अहवाल' },
  { name: 'वसुली रिपोर्ट E', slug: 'vasuli-report-e', category: 'ऐतिहासिक वसुली अहवाल' },
  { name: 'न.नं.५ योजना', slug: 'namuna-5-yojana', category: 'ऐतिहासिक योजना कॅशबुक' },
  { name: 'न. नं. ५ GN', slug: 'namuna-5-general', category: 'ऐतिहासिक सामान्य कॅशबुक' },
  { name: 'April', slug: 'april', category: 'ऐतिहासिक मासिक कॅशबुक (सन २०२१-२२)' },
];

ARCHIVED_SHEETS.forEach((arch, i) => {
  const filePath = path.join(SHEETS_DIR, `${arch.slug}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    data.is_archived = true;
    data.category = arch.category;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

    newMetaSheets.push({
      index: ACTIVE_SHEETS_CONFIG.length + i + 1,
      name: arch.name,
      slug: arch.slug,
      category: arch.category,
      is_archived: true,
      max_row: data.max_row,
      max_col: data.max_col,
      populated_rows_count: data.populated_rows_count,
      merged_ranges_count: (data.merged_ranges || []).length,
    });
    console.log(`📁 Preserved Archived Sheet: [${arch.name}] -> ${arch.slug}.json`);
  }
});

const finalMeta = {
  village: 'गोहगाव',
  taluka: 'रिसोड',
  district: 'वाशिम',
  financial_year: '२०२६ - २०२७',
  total_active_sheets: ACTIVE_SHEETS_CONFIG.length,
  total_archived_sheets: ARCHIVED_SHEETS.length,
  total_sheets: newMetaSheets.length,
  total_active_rows: totalPopulatedRows,
  total_active_formulas: totalFormulas,
  updated_at: new Date().toISOString(),
  sheets: newMetaSheets,
};

fs.writeFileSync(META_FILE, JSON.stringify(finalMeta, null, 2), 'utf-8');
console.log(`\n=== MIGRATION COMPLETE ===`);
console.log(`Total Active Sheets: ${ACTIVE_SHEETS_CONFIG.length}`);
console.log(`Total Populated Active Rows: ${totalPopulatedRows}`);
console.log(`Total Preserved Active Formulas: ${totalFormulas}`);
console.log(`Total Preserved Archived Sheets: ${ARCHIVED_SHEETS.length}`);
console.log(`Updated sheets_meta.json successfully!`);
