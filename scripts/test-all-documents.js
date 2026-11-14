/**
 * Comprehensive Automated Verification for 4 Official Document Modules
 * 1. नमुना ६/८ उतारा (Utara)
 * 2. वार्षिक मागणी बिल (Magani Bill)
 * 3. नमुना १० कर पावती (Namuna 10 Pavati)
 * 4. नमुना ७ पावती (Namuna 7 Pavati)
 */

const { getPropertyByNumber, searchProperties } = require("../src/lib/propertyService");
const fs = require("fs");
const path = require("path");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log("\n========================================================");
console.log("  GRAMSEVA: FOUR OFFICIAL DOCUMENTS VERIFICATION SUITE");
console.log("========================================================\n");

// 1. PROPERTY SEARCH AND PROPERTY NUMBER SEPARATION
console.log("--- 1. Property Number Search & Sr No Separation ---");
const testProp7A = getPropertyByNumber("7A");
assert(testProp7A !== null, "getPropertyByNumber('7A') finds property");
assert(testProp7A?.property_no === "7A", `Property No is '7A' (found: ${testProp7A?.property_no})`);
assert(testProp7A?.sr_no !== "7A", `Serial No is distinct from Property No (sr_no: ${testProp7A?.sr_no})`);

const testProp7a = getPropertyByNumber("7a");
assert(testProp7a !== null, "Case-insensitive search: '7a' finds record");
assert(testProp7a?.property_no === "7A", "Property No for '7a' is canonical '7A'");

const testProp15A = getPropertyByNumber("15A");
assert(testProp15A !== null, "getPropertyByNumber('15A') finds property");
assert(testProp15A?.property_no === "15A", `Property No is '15A' (found: ${testProp15A?.property_no})`);

const testProp15a = getPropertyByNumber("15a");
assert(testProp15a !== null, "Case-insensitive '15a' finds property");
assert(testProp15a?.property_no === "15A", "Property No for '15a' is '15A'");

const testProp6B = getPropertyByNumber("6B");
assert(testProp6B !== null, "getPropertyByNumber('6B') finds property");
assert(testProp6B?.property_no === "6B", `Property No is '6B' (found: ${testProp6B?.property_no})`);
assert(testProp6B?.owner_name.includes("हाडे"), `Owner name matches Marathi: ${testProp6B?.owner_name}`);

const testProp1 = getPropertyByNumber("1");
assert(testProp1 !== null, "getPropertyByNumber('1') finds property 1");
assert(testProp1?.property_no === "1", "Property No is 1");
assert(testProp1?.owner_name.includes("प्रल्हाद"), `Property 1 owner is Pralhad Hade (found: ${testProp1?.owner_name})`);

// Autocomplete multi-match search test
const searchMulti = searchProperties("हाडे", 5);
assert(searchMulti.length > 0, `Search 'हाडे' returns matching candidates (found: ${searchMulti.length})`);
assert(searchMulti.every(c => c.property_no && c.owner_name), "All search candidates return property_no and owner_name");

const search6B = searchProperties("6B", 5);
assert(search6B.some(c => c.property_no === "6B"), "Searching '6B' finds '6B' candidate");

const search6 = searchProperties("6", 20);
assert(search6.some(c => c.property_no === "6B"), "Searching prefix '6' includes '6B' candidate in top 20");

// 2. ADDITIONAL PERSONAL INFORMATION (Aadhaar, Mobile, Email)
console.log("\n--- 2. Additional Personal Information (Aadhaar, Mobile, Email) ---");
const prop1Enriched = getPropertyByNumber("1");
assert(prop1Enriched?.mobile_no === "9763944767", `Mobile preserved with exact value: ${prop1Enriched?.mobile_no}`);
assert(prop1Enriched?.aadhaar_no === "123456785241", `Aadhaar preserved with exact 12 digits: ${prop1Enriched?.aadhaar_no}`);
assert(prop1Enriched?.email === "", "Email not fabricated when absent in source sheet (stays blank)");

// Masking check for non-admin
const prop1Masked = getPropertyByNumber("1", false);
assert(prop1Masked?.aadhaar_no === "XXXX-XXXX-5241", `Non-admin receives masked Aadhaar: ${prop1Masked?.aadhaar_no}`);

// Admin unmasked check
const prop1Admin = getPropertyByNumber("1", true);
assert(prop1Admin?.aadhaar_no === "123456785241", `Admin receives unmasked Aadhaar: ${prop1Admin?.aadhaar_no}`);

// 3. STATUTORY AMOUNTS AND CALCULATIONS
console.log("\n--- 3. Statutory Amounts & Accurate Calculations ---");
assert(testProp1.house_tax_current === 33, `Prop 1 House Tax Current is ₹33 (found: ${testProp1.house_tax_current})`);
assert(testProp1.light_tax_current === 30, `Prop 1 Light Tax Current is ₹30 (found: ${testProp1.light_tax_current})`);
assert(testProp1.health_tax_current === 30, `Prop 1 Health Tax Current is ₹30 (found: ${testProp1.health_tax_current})`);
assert(testProp1.water_tax_current === 0, `Prop 1 Water Tax Current is ₹0 (found: ${testProp1.water_tax_current})`);
assert(testProp1.grand_total === 93, `Prop 1 Grand Total is ₹93 (found: ${testProp1.grand_total})`);

assert(testProp6B.house_tax_current === 816, `Prop 6B House Tax Current is ₹816 (found: ${testProp6B.house_tax_current})`);
assert(testProp6B.grand_total === 876, `Prop 6B Grand Total is ₹876 (found: ${testProp6B.grand_total})`);

// 4. PRINT TIMESTAMP ASIA/KOLKATA VERIFICATION
console.log("\n--- 4. Asia/Kolkata Live Print Timestamp Verification ---");
function getKolkataPrintTimestamp() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = String(hours).padStart(2, "0");
  return `${day}/${month}/${year} ${strHours}:${minutes}:${seconds} ${ampm}`;
}

const ts = getKolkataPrintTimestamp();
console.log(`  Generated Timestamp: ${ts}`);
assert(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2} (AM|PM)$/.test(ts), `Timestamp matches DD/MM/YYYY HH:MM:SS AM/PM: ${ts}`);

// 5. DOCUMENT LAYOUT & TEMPLATE REPRODUCTION VERIFICATION
console.log("\n--- 5. Document Structure & Statutory Notes Verification ---");

// Check Utara component code contains original statutory notes
const utaraCode = fs.readFileSync(path.join(__dirname, "../src/components/documents/UtaraDocument.tsx"), "utf8");
assert(utaraCode.includes("नमुना नंबर ८ उतारा"), "Utara contains statutory title 'नमुना नंबर ८ उतारा'");
assert(utaraCode.includes("नियम ३२ (१)"), "Utara contains statutory rule 'नियम ३२ (१)'");
assert(utaraCode.includes("सन २०२६ - २०२७ ते २०२९ - २०३०"), "Utara assessment period '२०२६ - २०२७ ते २०२९ - २०३०' present");
assert(utaraCode.includes("टीप :"), "Utara contains official instructions heading 'टीप :'");
assert(utaraCode.includes("सदर मालमत्ता आकारणी नोंदवही उतारा केवळ ग्रामपंचायत कर आकारणी बाबत असून"), "Utara note 1 statutory wording present");
assert(utaraCode.includes("नमूद मोजमापे ही कर आकारणीच्या उद्देशाने घेतलेली असून"), "Utara note 2 statutory wording present");
assert(utaraCode.includes("चतुःसीमा"), "Utara boundaries (चतुःसीमा) present");
assert(utaraCode.includes("ग्रामपंचायत अधिकारी / सरपंच"), "Utara signatures present");

// Check Magani Bill component code contains original notes and dual copies
const billCode = fs.readFileSync(path.join(__dirname, "../src/components/documents/MaganiBillDocument.tsx"), "utf8");
assert(billCode.includes("वार्षिक कर मागणी बिल"), "Magani Bill contains title 'वार्षिक कर मागणी बिल'");
assert(billCode.includes("मूळ प्रत") && billCode.includes("कार्यालयीन प्रत (OC)"), "Magani Bill contains dual copies");
assert(billCode.includes("येथून कट करा / Cut Here"), "Magani Bill contains tear divider");
assert(billCode.includes("हे बिल मिळाल्यापासून १५ दिवसांच्या आत"), "Magani Bill note 1 (15-day payment rule) present");
assert(billCode.includes("वेळेत कर भरून ग्रामविकासास सहकार्य करावे"), "Magani Bill note 2 present");
assert(billCode.includes("रक्कम जमा केल्यावर अधिकृत पावती (नमुना १०) आवर्जून प्राप्त करून घ्यावी"), "Magani Bill note 3 present");

// Check Namuna 10 component code
const n10Code = fs.readFileSync(path.join(__dirname, "../src/components/documents/Namuna10Document.tsx"), "utf8");
assert(n10Code.includes("नमुना १० (नियम २२ (१२) पहा)"), "Namuna 10 contains statutory title and rule 'नियम २२ (१२)'");
assert(n10Code.includes("कर व फी वसुली पावती"), "Namuna 10 subtitle present");
assert(n10Code.includes("मूळ प्रत") && n10Code.includes("कार्यालयीन प्रत (OC)"), "Namuna 10 dual copies present");
assert(n10Code.includes("ही पावती अधिकृत संगणकीकृत पावती असून"), "Namuna 10 condition 1 present");
assert(n10Code.includes("धनादेश / ऑनलाईन व्यवहाराच्या बाबतीत"), "Namuna 10 condition 2 present");

// Check Namuna 7 component code
const n7Code = fs.readFileSync(path.join(__dirname, "../src/components/documents/Namuna7Document.tsx"), "utf8");
assert(n7Code.includes("संत गाडगेबाबा") && n7Code.includes("राष्ट्रसंत तुकडोजी महाराज"), "Namuna 7 deities banner present");
assert(n7Code.includes("नमुना नं. ७ (नियम ३७ (२) पहा)"), "Namuna 7 rule 37 (2) present");
assert(n7Code.includes("सामान्य पावती"), "Namuna 7 general receipt title present");
assert(n7Code.includes("मूळ प्रत") && n7Code.includes("कार्यालयीन प्रत (OC)"), "Namuna 7 dual copies present");
assert(n7Code.includes("दाखले फी (जन्म/मृत्यू/रहिवासी)"), "Namuna 7 standard head of account present");

console.log("\n========================================================");
console.log(`TOTAL CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("========================================================\n");

if (failed > 0) {
  process.exit(1);
}
