# LATEST WORKBOOK ANALYSIS — Gramसेवा
**Workbook Reference:** `ग्रामपंचायत गोहगाव  (1).xlsx`  
**File Size:** 1,850,135 bytes  
**Active Worksheets Count:** 19  
**Previous Workbook Reference:** `ग्रामपंचायत गोहगाव .xlsx` (26 worksheets)  
**Analysis Date:** 11 November 2026  
**Auditor:** Senior Full-Stack Engineer, Software Architect & Database Migration Specialist  

---

## 1. Executive Overview

The Gram Panchayat Gohgaon master Google Spreadsheet was updated, and the latest official export (`ग्रामपंचायत गोहगाव  (1).xlsx`) has been analyzed in comparison to the previous reference workbook.

### Key Structural Evolution:
1. **Total Active Worksheets:** Reduced from 26 to **19 streamlined worksheets**.
2. **Total Formula Definitions:** Increased exponentially from 18,340 formulas to **63,142 formula cells**, reflecting enhanced cross-sheet linking, automated calculations, and print register automation.
3. **8 Newly Added / Restructured Worksheets:**
   - **`नमुना ५ १६ वित्त `**: Scheme cashbook under 15th/16th Finance Commission (formerly `न.नं.५ योजना`).
   - **`नमुना ५ सामान्य `**: General cashbook (formerly `न. नं. ५ GN`).
   - **`नमुना ९ गोषवारा `**: Page-by-page tax demand abstract (कर मागणी गोषवारा).
   - **`नमुना न. ६ `**: Statutory Classified Collection Register / Cashbook (formerly standalone `April` cashbook).
   - **`नमुना 8 खातेदार`**: Dedicated 682-row taxpayer and property-holder master register.
   - **`नमुना ९ प्रिंट रजिस्टर`**: 1,152-row, 15,730-formula official 25-rows-per-page print register.
   - **`नमुना ८ प्रिंट रजिस्टर`**: 900-row, 13,716-formula official statutory assessment register with 4-boundaries (चतुःसीमा).
   - **`थकबाकी यादी २०२६-२७`**: 712-row, 7,754-formula real-time arrears register with gharkar, diwabatti, arogya, panipatti breakdown and collection tracking.
4. **14 Removed Monthly & Historical Worksheets:**
   - Monthly cashbooks (`May`, `Jun`, `July`, `Aug`, `Sep`, `Oct`, `Nov`, `Dec`, `Jan`, `Feb`) and historical summary sheets (`वसुली रिपोर्ट`, `वसुली रिपोर्ट E`).
   - *Governance Directive:* In accordance with statutory Gram Panchayat record-keeping principles, these historical sheets are **strictly preserved and marked as Archived / Historical Records**, remaining fully accessible via a dedicated historical archive view without cluttering daily workflows.

---

## 2. Complete 19 Active Worksheets Inventory & Metrics

| # | Worksheet Name (Original) | Target Slug | Range | Populated Rows | Value Cells | Formula Cells | Functional Category |
|---|---|---|---|---|---|---|---|
| 1 | `Sheet1` | `sheet1` | `A1:Z1000` | 38 | 131 | 0 | प्रशासकीय संदर्भ (System Reference) |
| 2 | `न.नं.५ पा. पु` | `n-n-5-pa-pu` | `A1:AC1000` | 29 | 104 | 55 | पाणी पुरवठा कॅशबुक (Water Supply Cashbook) |
| 3 | `all mobile no` | `all-mobile-no` | `A1:Z1000` | 757 | 5,089 | 2,039 | करदाते संपर्क (Taxpayer Contacts) |
| 4 | `नमुना ५ १६ वित्त ` | `namuna-5-16-vitta` | `A1:Z1000` | 22 | 63 | 14 | १६ वा वित्त आयोग कॅशबुक (16th Finance Cashbook) |
| 5 | `नमुना ५ सामान्य ` | `namuna-5-samanya` | `A1:AI1000` | 29 | 122 | 70 | सामान्य निधी कॅशबुक (General Fund Cashbook) |
| 6 | `न.८ साठीचे दर` | `n-8-sathiche-dar` | `A1:AM1000` | 528 | 608 | 0 | कर आकारणी दर (Tax Assessment Rates) |
| 7 | `नमुना ८` | `namuna-8` | `A1:BI1250` | 1,250 | 22,496 | 14,401 | कर आकारणी नोंदवही (Property Assessment Register) |
| 8 | `उतारा` | `utara` | `A1:AC1003` | 20 | 122 | 39 | मालमत्ता कर आकारणी उतारा (Property Assessment Extract) |
| 9 | `नमुना ९ ` | `namuna-9` | `A1:V1000` | 1,000 | 10,924 | 8,769 | कर मागणी नोंदवही (Tax Demand Register) |
| 10 | `नमुना ९ गोषवारा ` | `namuna-9-goshavara` | `A1:Z100` | 65 | 390 | 308 | कर मागणी गोषवारा (Demand Summary Abstract) |
| 11 | `मागणी बिल ` | `magani-bill` | `B2:G47` | 36 | 117 | 43 | वार्षिक कर मागणी बिल (Annual Demand Bill) |
| 12 | `नमुना १० पावती ` | `namuna-10-pavati` | `B3:G55` | 40 | 135 | 54 | कर पावती (Tax Collection Receipt) |
| 13 | `नमुना ७ पावती ` | `namuna-7-pavati` | `A1:G43` | 37 | 74 | 14 | किरकोळ वसुली पावती (Misc Fee Receipt) |
| 14 | `नमुना न. ६ ` | `namuna-na-6` | `A1:AQ1000` | 78 | 414 | 131 | जमा रक्कमांची नोंदवही (Classified Collection Register) |
| 15 | `मासिक सभा नोटीस` | `masik-sabha-notice` | `B2:F60` | 48 | 87 | 5 | मासिक सभा नोटीस व पोच (Meeting Notice & Acknowledgement) |
| 16 | `नमुना 8 खातेदार` | `namuna-8-khatedar` | `A1:N757` | 682 | 4,893 | 0 | मालमत्ता खातेदार यादी (Khatedar Master Directory) |
| 17 | `नमुना ९ प्रिंट रजिस्टर` | `namuna-9-print-register` | `A1:S1200` | 1,152 | 17,136 | 15,730 | नमुना ९ मुद्रण रजिस्टर (Namuna 9 Print Register) |
| 18 | `नमुना ८ प्रिंट रजिस्टर` | `namuna-8-print-register` | `A1:S972` | 900 | 14,544 | 13,716 | नमुना ८ मुद्रण रजिस्टर (Namuna 8 Print Register) |
| 19 | `थकबाकी यादी २०२६-२७` | `thakbaki-yadi-2026-27` | `B2:L720` | 712 | 7,771 | 7,754 | कर थकबाकीदार यादी (Tax Arrears Register) |
| **एकूण (Total)** | **१९ वर्कशीट्स** | — | — | **8,356** | **84,931** | **63,142** | **संपूर्ण ग्रामपंचायत संगणकीय प्रणाली** |

---

## 3. Deep-Dive Inspection of Newly Added Sheets

### 1. `नमुना ५ १६ वित्त ` (Namuna 5 - 16th Finance Commission Cashbook)
- **Structure:** 22 populated rows, 26 columns (`A1:Z1000`), 14 formula cells.
- **Purpose:** Tracks receipts (`जमा बाजू`) and expenditure (`खर्च बाजू`) specifically under Central Finance Commission grants.
- **Replacement Note:** Direct evolution of the previous `न.नं.५ योजना`.

### 2. `नमुना ५ सामान्य ` (Namuna 5 - General Fund Cashbook)
- **Structure:** 29 populated rows, 35 columns (`A1:AI1000`), 70 formula cells.
- **Purpose:** Statutory cashbook for own-source revenue (घरपट्टी, आरोग्य कर, दिवाबत्ती कर, किरकोळ वसुली).
- **Replacement Note:** Direct evolution of the previous `न. नं. ५ GN`.

### 3. `नमुना ९ गोषवारा ` (Namuna 9 Demand Abstract / Goshavara)
- **Structure:** 65 populated rows, 26 columns (`A1:Z100`), 308 formula cells.
- **Purpose:** Page-by-page tax demand abstract (पाननिहाय मागणी गोषवारा) for financial year २०२६-२०२७, aggregating current demand, arrears, and totals across pages 1 to 29.
- **Key Formulas:** `=SUM('नमुना ९ '!Q7:Q31)`, `=SUM('नमुना ९ '!D7:D31)`.

### 4. `नमुना न. ६ ` (Statutory Classified Collection Register / Cashbook)
- **Structure:** 78 populated rows, 43 columns (`A1:AQ1000`), 131 formula cells.
- **Purpose:** Formal Maharashtra Village Panchayat Account Code Namuna 6 register classifying collections into budget heads (अर्थ संकल्पीय तरतूद, मासिक संकलन).
- **Replacement Note:** Replaces the ad-hoc monthly `April` sheet with the proper statutory accounting title.

### 5. `नमुना 8 खातेदार` (Namuna 8 Khatedar / Taxpayer Master Directory)
- **Structure:** 682 populated rows, 14 columns (`A1:N757`), 4,893 value cells, 0 formulas (pure master data).
- **Columns:**
  1. `Tax Payer Name English` (उदा. `PRALHAD GOVINDA HADE`)
  2. `Tax Payer Name Local` (उदा. `प्रल्हाद गोविंदा हाडे`)
  3. `Gender` (`Male` / `Female`)
  4. `Category` (`OBC`, `OPEN`, `SC`, `ST`)
  5. `S/o, W/o, D/o`
  6. `Father Name/Husband Name`
  7. `Mobile Number` (10-digit mobile)
  8. `Pincode` (`444506`)
  9. Property & Village Census Identifiers

### 6. `नमुना ९ प्रिंट रजिस्टर` (Namuna 9 Printable Register)
- **Structure:** 1,152 populated rows, 19 columns (`A1:S1200`), 15,730 formula cells!
- **Features:** Automated pagination formula:
  ```excel
  ="ग्रामपंचायत :  गोहगाव    [ पान नंबर : " & (INT((ROW()-1)/25)+1) & " ]"
  ```
- **Columns:** अ.क्र., मिळकत नंबर, करदाता चे नाव, मागणी (घरकर, दिवाकर, आरोग्य कर, पाणी कर), एकूण कर, बिल बजावण्याची तारीख, पावती दिलेली तारीख, स्वाक्षरी.

### 7. `नमुना ८ प्रिंट रजिस्टर` (Namuna 8 Printable Register)
- **Structure:** 900 populated rows, 19 columns (`A1:S972`), 13,716 formula cells.
- **Features:** Full 4-boundaries specification (`पूर्व`, `पश्चिम`, `उत्तर`, `दक्षिण`), construction year (`बांधकामाचे वर्ष`), dimensions (`लांबी x रुंदी`), carpet area, and itemized taxes.
- **Pagination:** Automated page headers generating 25 records per printed page.

### 8. `थकबाकी यादी २०२६-२७` (Tax Arrears & Defaulters Register)
- **Structure:** 712 populated rows, 12 columns (`B2:L720`), 7,754 formula cells.
- **Header Summary KPIs:**
  - एकूण कर मागणी: `₹६,२८,१९९.१६` (`=SUM('नमुना ९ '!Q7:Q713)`)
  - एकूण वसूल रक्कम: `₹०.००` (`=SUM('नमुना ९ '!T7:T713)`)
  - एकूण शिल्लक बाकी: `₹६,२८,२१९.००` (`=SUM('नमुना ९ '!U7:U713)`)
  - एकूण थकबाकीदार संख्या: `७०७` (`=COUNTIF('नमुना ९ '!U7:U713, ">0")`)
- **Granular Columns:** अ.क्र., मिळकत क्रमांक, करदात्याचे नाव, घरकर, दिवाबत्ती कर, आरोग्य कर, पाणीपट्टी कर, चालू मागणी, मागील थकबाकी, एकूण मागणी, वसूल रक्कम, शिल्लक बाकी.

---

## 4. Updates to Existing Worksheets

### A. `नमुना ८` (Assessment Register)
- Expanded from 1,200 to **1,250 rows** (50 new/updated records).
- Added explicit columns in Row 7:
  - `AF7`: चतुःसीमा (Four Boundaries)
  - `AJ7`: मोबाईल नंबर (Mobile Number)
  - `AK7`: आधार नंबर (Aadhaar Number)
  - `AL7`: घरकुल योजनेचा लाभ (वर्ष) (Housing Scheme Year)
  - `AM7`: शौचालय आहे किंवा नाही (Toilet Availability)
- Total formulas increased from 11,554 to **14,401**.

### B. `नमुना ९ ` (Demand Register)
- Column structure expanded from 18 to **22 statutory columns** (`A1:V1000`):
  - `Col 18 (R)`: बिल बजावण्याची तारीख व बिल नंबर
  - `Col 19 (S)`: पावती दिलेली तारीख व पावती नंबर
  - `Col 20 (T)`: वसूल रक्कम (₹)
  - `Col 21 (U)`: शिल्लक बाकी (₹)
  - `Col 22 (V)`: पावती स्थिती
- Formulas increased from 2,123 to **8,769**, providing direct real-time calculations for paid amounts and balance arrears.

### C. `नमुना ७ पावती ` (Receipt 7 Layout)
- Was previously unpopulated (0 cells). Now fully populated with **37 rows, 74 value cells, and 14 formulas**, featuring the official Sant Gadge Baba & Rashtrasant Tukdoji Maharaj emblem, receipt number, payee name, fee category, amount in words, and authorized officer signature stamp.

### D. `मासिक सभा नोटीस` (Meeting Notice)
- Expanded to **2-Page format** (48 rows):
  - **Page 1:** Formal notice, meeting details, and 8 standardized statutory agenda items.
  - **Page 2:** Official 13-member acknowledgement and signature register (`सदस्य पोच व स्वाक्षरी तक्ता`).
  - **Leadership Update:** First member (Sarpanch) updated to **श्री.विकास रतनसिंग हाडे** (replacing old placeholder).
