# WORKSHEET MAPPING SPECIFICATION — Gramसेवा
**Target Application:** Gramसेवा (Gram Panchayat Gohgaon Management Software)  
**Reference Document:** `ग्रामपंचायत गोहगाव  (1).xlsx` (19 Worksheets)  
**Legacy Reference:** `ग्रामपंचायत गोहगाव .xlsx` (26 Worksheets)  
**Date:** 11 November 2026  
**Auditor:** Senior Full-Stack Engineer, Software Architect & Database Migration Specialist  

---

## 1. Complete Mapping & Transition Matrix

| # | Current Official Sheet Name | New Application Slug | Previous Name (If Any) | Transition Status | UI Category | Data Action |
|---|---|---|---|---|---|---|
| 1 | `Sheet1` | `sheet1` | `Sheet1` | **ACTIVE_UPDATED** | प्रशासकीय (Admin) | Retain existing, update any refreshed cells |
| 2 | `न.नं.५ पा. पु` | `n-n-5-pa-pu` | `न.नं.५ पा. पु` | **ACTIVE_UPDATED** | पाणी पुरवठा (Water Supply) | Retain 29 rows & 55 formulas intact |
| 3 | `all mobile no` | `all-mobile-no` | `all mobile no` | **ACTIVE_UPDATED** | नागरिक संपर्क (Citizens) | Reconcile 757 taxpayers with updated Marathi spellings |
| 4 | `नमुना ५ १६ वित्त ` | `namuna-5-16-vitta` | `न.नं.५ योजना` | **RENAMED_EVOLVED** | वित्त आयोग (Finance Commission) | Map from old scheme cashbook; preserve 22 rows & 14 formulas |
| 5 | `नमुना ५ सामान्य ` | `namuna-5-samanya` | `न. नं. ५ GN` | **RENAMED_EVOLVED** | सामान्य निधी (General Fund) | Map from old GN cashbook; preserve 29 rows & 70 formulas |
| 6 | `न.८ साठीचे दर` | `n-8-sathiche-dar` | `न.८ साठीचे दर` | **ACTIVE_UPDATED** | कर रचना (Tax Rates) | Retain 528 rate tiers and statutory categories |
| 7 | `नमुना ८` | `namuna-8` | `नमुना ८` | **ACTIVE_UPDATED** | कर आकारणी (Assessment) | Update to 1,250 rows; activate new columns (चतुःसीमा, मोबाईल, आधार, घरकुल, शौचालय); preserve 14,401 formulas |
| 8 | `उतारा` | `utara` | `उतारा` | **ACTIVE_UPDATED** | दाखले व उतारे (Extracts) | Update to 20 rows; preserve 39 dynamic lookup formulas |
| 9 | `नमुना ९ ` | `namuna-9` | `नमुना ९ ` | **ACTIVE_UPDATED** | कर मागणी (Demand) | Expand from 18 to 22 columns; populate 1,000 rows & 8,769 formulas |
| 10 | `नमुना ९ गोषवारा ` | `namuna-9-goshavara` | *None (New)* | **NEWLY_ADDED** | कर गोषवारा (Abstracts) | Provision new page; import 65 rows & 308 formulas |
| 11 | `मागणी बिल ` | `magani-bill` | `मागणी बिल ` | **ACTIVE_UPDATED** | बिले व नोटिसा (Bills) | Update to 36 rows & 43 formulas; support 2026-27 billing layout |
| 12 | `नमुना १० पावती ` | `namuna-10-pavati` | `नमुना १० पावती ` | **ACTIVE_UPDATED** | कर पावत्या (Receipts) | Update to 40 rows & 54 formulas; dynamic receipt issuance |
| 13 | `नमुना ७ पावती ` | `namuna-7-pavati` | `नमुना ७ पावती ` | **ACTIVE_UPDATED** | किरकोळ पावत्या (Misc Receipts) | Fully populate from scratch with 37 rows, 74 cells & 14 formulas |
| 14 | `नमुना न. ६ ` | `namuna-na-6` | `April` | **RENAMED_EVOLVED** | जमा नोंदवही (Cashbook) | Map statutory Namuna 6 register; preserve 78 rows & 131 formulas |
| 15 | `मासिक सभा नोटीस` | `masik-sabha-notice` | `मासिक सभा नोटीस` | **ACTIVE_UPDATED** | मासिक सभा (Governance) | Expand to 48 rows, 8 agenda items & 13-member acknowledgement table; Sarpanch: Shri Vikas Hade |
| 16 | `नमुना 8 खातेदार` | `namuna-8-khatedar` | *None (New)* | **NEWLY_ADDED** | खातेदार यादी (Khatedar Directory) | Provision new page; import 682 taxpayers with 14 columns |
| 17 | `नमुना ९ प्रिंट रजिस्टर` | `namuna-9-print-register` | *None (New)* | **NEWLY_ADDED** | मुद्रण रजिस्टर (Print Registers) | Provision new page; import 1,152 rows & 15,730 formulas (25-rows-per-page A4 print layout) |
| 18 | `नमुना ८ प्रिंट रजिस्टर` | `namuna-8-print-register` | *None (New)* | **NEWLY_ADDED** | मुद्रण रजिस्टर (Print Registers) | Provision new page; import 900 rows & 13,716 formulas (boundaries & assessment register) |
| 19 | `थकबाकी यादी २०२६-२७` | `thakbaki-yadi-2026-27` | *None (New)* | **NEWLY_ADDED** | थकबाकी अहवाल (Arrears & Recovery) | Provision new page; import 712 rows & 7,754 formulas; live recovery KPI tracking |

---

## 2. Historical & Archived Sheets Management

The following 12 worksheets from the old workbook do not have a direct replacement in the active 19-sheet workbook:
- `May` (`may`)
- `Jun` (`jun`)
- `July` (`july`)
- `Aug` (`aug`)
- `Sep` (`sep`)
- `Oct` (`oct`)
- `Nov` (`nov`)
- `Dec` (`dec`)
- `Jan` (`jan`)
- `Feb` (`feb`)
- `वसुली रिपोर्ट` (`vasuli-report`)
- `वसुली रिपोर्ट E` (`vasuli-report-e`)

### Non-Destructive Preservation Policy:
1. **Zero Data Loss:** None of these files or records will be deleted from the database.
2. **Archived Category:** In `src/data/sheets_meta.json`, their `category` is set to `ऐतिहासिक अभिलेख (Archived Records)`.
3. **Sidebar UI:** In the sidebar navigation, they are placed in a dedicated collapsible **"ऐतिहासिक अभिलेख (Archived Records)"** section. The user can view, inspect, search, and export them at any time, but they do not crowd active daily operations.
4. **URL Compatibility:** Their routes (`/sheets/may`, `/sheets/vasuli-report`, etc.) remain fully functional.

---

## 3. Google Sheets Real-Time Synchronization Mapping

The live Google Spreadsheet tab names will map as follows:

```typescript
export const NAME_TO_SLUG: Record<string, string> = {
  // 19 Active Worksheets
  'Sheet1': 'sheet1',
  'न.नं.५ पा. पु': 'n-n-5-pa-pu',
  'all mobile no': 'all-mobile-no',
  'नमुना ५ १६ वित्त ': 'namuna-5-16-vitta',
  'नमुना ५ १६ वित्त': 'namuna-5-16-vitta',
  'नमुना ५ सामान्य ': 'namuna-5-samanya',
  'नमुना ५ सामान्य': 'namuna-5-samanya',
  'न.८ साठीचे दर': 'n-8-sathiche-dar',
  'नमुना ८': 'namuna-8',
  'उतारा': 'utara',
  'नमुना ९ ': 'namuna-9',
  'नमुना ९': 'namuna-9',
  'नमुना ९ गोषवारा ': 'namuna-9-goshavara',
  'नमुना ९ गोषवारा': 'namuna-9-goshavara',
  'मागणी बिल ': 'magani-bill',
  'मागणी बिल': 'magani-bill',
  'नमुना १० पावती ': 'namuna-10-pavati',
  'नमुना १० पावती': 'namuna-10-pavati',
  'नमुना ७ पावती ': 'namuna-7-pavati',
  'नमुना ७ पावती': 'namuna-7-pavati',
  'नमुना न. ६ ': 'namuna-na-6',
  'नमुना न. ६': 'namuna-na-6',
  'मासिक सभा नोटीस': 'masik-sabha-notice',
  'नमुना 8 खातेदार': 'namuna-8-khatedar',
  'नमुना ९ प्रिंट रजिस्टर': 'namuna-9-print-register',
  'नमुना ८ प्रिंट रजिस्टर': 'namuna-8-print-register',
  'थकबाकी यादी २०२६-२७': 'thakbaki-yadi-2026-27',

  // Backward-Compatible & Historical Aliases
  'न.नं.५ योजना': 'namuna-5-16-vitta',
  'न. नं. ५ GN': 'namuna-5-samanya',
  'April': 'namuna-na-6',
  'april': 'namuna-na-6',
  'May': 'may',
  'Jun': 'jun',
  'July': 'july',
  'Aug': 'aug',
  'Sep': 'sep',
  'Oct': 'oct',
  'Nov': 'nov',
  'Dec': 'dec',
  'Jan': 'jan',
  'Feb': 'feb',
  'वसुली रिपोर्ट': 'vasuli-report',
  'वसुली रिपोर्ट E': 'vasuli-report-e',
};
```
