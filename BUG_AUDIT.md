# BUG AUDIT REPORT — Gramसेवा (Gram Panchayat Gohgaon Management Software)
**Date:** 10 November 2026  
**Auditor:** Senior Full-Stack & QA Engineering Team  
**Repository:** https://github.com/tanaydeshmukh7/gramseva  

---

## Executive Summary

A comprehensive code-level audit was conducted across all frontend components, backend APIs, data pipelines, search routines, document generation templates, and synchronization flows of Gramसेवा.

A total of **15 concrete bugs** were discovered, ranging from **Critical** (search inconsistency and lack of persistence) to **High** (hardcoded document templates, missing Add modal, truncated edit forms, and simulated sync actions).

---

## Detailed Bug Matrix

### BUG-01 (CRITICAL): Search Inconsistency, Unicode/Devanagari Normalization Failure & Typing Lag
- **Affected File:** `src/app/sheets/[sheetId]/SheetViewerClient.tsx` (Lines 60–68, 831–843)
- **Root Cause:**
  1. Search comparison `String(cell.value).toLowerCase().includes(q)` does not normalize Unicode text (`String.prototype.normalize('NFC')`). Marathi text containing matras, combining diacritics, and zero-width characters fails string equality.
  2. The search input does not strip Unicode whitespace or non-breaking spaces (`\u00A0`).
  3. Numeric cells in Excel often contain float representation (e.g. `9763944767.0` in phone numbers, `1.0` in property numbers), which fails when users search for `9763944767` or `1`.
  4. Search input has zero debouncing. In `नमुना ८` (1,200 rows × 61 cols = 73,200 cells), every keystroke synchronously iterates through all cells, blocking the browser main thread and dropping keystrokes.
  5. There is no clear search button (`X`) or loading state.
- **Severity:** CRITICAL
- **Proposed Fix:**
  - Implement a dedicated custom hook `useDebounce` (150ms).
  - Normalize both query and target values using `normalize("NFC").trim()`.
  - Strip trailing `.0` from numeric values before matching.
  - Implement instant clear button, matching count badge, and empty state.
- **Verification Method:** Test searching Marathi names (e.g., `प्रल्हाद`, `काठोळे`, `ऋषिकेश`), property IDs (`6B`, `5A`, `1`), mobile numbers (`9763944767`), partial strings, and rapid typing.

---

### BUG-02 (CRITICAL): Data Edits and Deletions Not Persisted (Local State Only)
- **Affected File:** `src/app/sheets/[sheetId]/SheetViewerClient.tsx` (Lines 98–112)
- **Root Cause:** `handleDelete` and `handleSaveEdit` only update React component state `rowsState`. No HTTP request (`POST`/`PUT`/`DELETE`) is dispatched to a server API. On page reload, all changes are wiped.
- **Severity:** CRITICAL
- **Proposed Fix:**
  - Create backend API route `/api/sheets/[sheetId]/route.ts` with `GET`, `PUT`, `POST`, `DELETE` methods.
  - Call `saveSheetData` in `sheetsService.ts` to write updates directly to the underlying sheet JSON file.
  - Update `SheetViewerClient` to await the API response and display genuine success/error notifications.
- **Verification Method:** Edit a row, delete a row, refresh the browser, and confirm the change persists in `src/data/sheets/*.json`.

---

### BUG-03 (HIGH): "नवीन नोंद जोडा" (Add Record) Button Does Nothing
- **Affected File:** `src/app/sheets/[sheetId]/SheetViewerClient.tsx` (Line 49, 179)
- **Root Cause:** State variable `isAddModalOpen` is set to `true` when the button is clicked, but there is no JSX condition or modal dialog for adding a new row.
- **Severity:** HIGH
- **Proposed Fix:**
  - Implement an Add Record Modal with form fields matching all populated columns of the sheet.
  - Compute the next available row index and append the record via the `/api/sheets/[sheetId]` endpoint.
- **Verification Method:** Click "नवीन नोंद जोडा", fill out the form, submit, and verify that the row appears in the table and in the JSON file.

---

### BUG-04 (HIGH): Edit Modal Truncated to 15 Columns
- **Affected File:** `src/app/sheets/[sheetId]/SheetViewerClient.tsx` (Line 1002)
- **Root Cause:** The edit form iterates over `colHeaders.slice(0, 15)`, dropping columns 16 through 31/61. In `नमुना ८`, essential fields (Capital Value, Tax Rates, House Tax, Water Tax, East/West Boundaries) cannot be edited.
- **Severity:** HIGH
- **Proposed Fix:**
  - Remove `slice(0, 15)`. Display all populated columns in a responsive, scrollable grid.
  - Add tabs/sections in the edit modal for statutory registers like `नमुना ८` (General Info, Measurements, Tax Rates, Boundaries).
- **Verification Method:** Open Edit on row 11 of `नमुना ८` and confirm all 31 statutory columns can be edited and saved.

---

### BUG-05 (HIGH): Document Generation Views Use Hardcoded Sample Data
- **Affected File:** `src/app/sheets/[sheetId]/SheetViewerClient.tsx` (Lines 244–251, 350–370, 480–500)
- **Root Cause:** `utara`, `magani-bill`, and `namuna-10-pavati` check `selectedPropertyNo === "6B"` or `"1"` or `"2"`, falling back to static dummy data for any other property number because the component does not fetch the real records from `नमुना ८` and `नमुना ९ `.
- **Severity:** HIGH
- **Proposed Fix:**
  - Create `/api/lookup/property/[propertyNo]` endpoint that reads master property data from `namuna-8.json` and demand data from `namuna-9.json`.
  - Dynamically populate owner name, property type, dimensions, calculated capital value, and all 4 taxes for any property number.
- **Verification Method:** Enter property `3`, `4`, `5A`, `112`, and verify real data from the original spreadsheet is populated.

---

### BUG-06 (HIGH): Table Headers Inaccurate on Master Registers
- **Affected File:** `src/app/sheets/[sheetId]/SheetViewerClient.tsx` (Lines 80–92)
- **Root Cause:** `colHeaders` extracts labels from `rowsState[0]`. In `नमुना ८`, row 1 is the title ("नमुना नंबर. ८"). The actual column headers reside in rows 7 to 10. Consequently, table columns appear as "नमुना नंबर. ८", "स्तंभ 2", etc.
- **Severity:** HIGH
- **Proposed Fix:**
  - Implement an intelligent header resolver: check row 1, 4, 6, 7 to find the row with the maximum number of distinct textual column labels.
  - For `नमुना ८`, map standard 31 statutory columns explicitly.
- **Verification Method:** Open `/sheets/namuna-8` and `/sheets/namuna-9` and verify column headers read "मालमत्ता क्रमांक", "मालकाचे नाव", "क्षेत्रफळ", "घरपट्टी", etc.

---

### BUG-07 (MEDIUM): WhatsApp Bulk Dispatch Simulated with setTimeout
- **Affected File:** `src/app/sheets/[sheetId]/SheetViewerClient.tsx` (Lines 625–633)
- **Root Cause:** Clicking "सर्व सदस्यांना नोटीस पाठवा" only calls `setTimeout` and updates local state `whatsappSentStatus`. It never invokes `/api/notice/whatsapp`.
- **Severity:** MEDIUM
- **Proposed Fix:**
  - Connect the button to `fetch('/api/notice/whatsapp', { method: 'POST', body: ... })`.
  - Display actual member-by-member delivery status (`SENT` or `PENDING_MOBILE_CONFIG`).
- **Verification Method:** Trigger bulk dispatch in `masik-sabha-notice` and inspect the network response.

---

### BUG-08 (MEDIUM): Google Sheets Sync Simulated with setTimeout
- **Affected File:** `src/app/sync/page.tsx` (Lines 51–70) & `src/components/Header.tsx` (Lines 12–18)
- **Root Cause:** Both pages execute dummy `setTimeout` intervals with static logs. No live synchronization check or API route exists.
- **Severity:** MEDIUM
- **Proposed Fix:**
  - Implement `/api/sync` route that validates connectivity to Google Sheets (ID `17YLlwp4oMrTx4-Y0ugQ19MfghwV66dL3eipSQesOLFk`), reconciles row counts, and logs real synchronization transactions.
  - Connect both the Header "सिंक करा" button and `/sync` page to this endpoint.
- **Verification Method:** Click "सिंक करा" and verify real network call to `/api/sync` returning genuine audit timestamps.

---

### BUG-09 (MEDIUM): Settings Backup Button Triggers Alert Instead of Download
- **Affected File:** `src/app/settings/page.tsx` (Line 130)
- **Root Cause:** Download button has `onClick={() => alert(...)}` instead of triggering `handleExportBackup()` to fetch `/api/backup`.
- **Severity:** MEDIUM
- **Proposed Fix:**
  - Hook button to trigger file download via `/api/backup`.
  - Persist settings (Gram Panchayat name, financial year, WhatsApp message template) via a new `/api/settings` route.
- **Verification Method:** Click "डेटा बॅकअप डाऊनलोड करा" and verify `gramseva_backup_YYYY-MM-DD.json` downloads to browser.

---

### BUG-10 (MEDIUM): Missing Printable Format for Namuna 7 Pavati
- **Affected File:** `src/app/sheets/[sheetId]/SheetViewerClient.tsx`
- **Root Cause:** `namuna-7-pavati` was omitted from the document tabs and had no dedicated layout.
- **Severity:** MEDIUM
- **Proposed Fix:**
  - Add Namuna 7 (किरकोळ वसुली पावती) document generator with receipt no, payer name, fee type, amount in words, and official GP stamp.
- **Verification Method:** Navigate to `/sheets/namuna-7-pavati` and check the document view.

---

### BUG-11 (LOW): Mobile & Responsive Sidebar Toggle Missing
- **Affected File:** `src/components/Sidebar.tsx` & `src/components/Header.tsx`
- **Root Cause:** On mobile screens, the sidebar is fixed at 288px width (`w-72`), with no hamburger toggle button on the header to hide or reveal it.
- **Severity:** LOW
- **Proposed Fix:**
  - Add a responsive hamburger menu button to `Header.tsx` and mobile drawer backdrop in `Sidebar.tsx`.
- **Verification Method:** Resize viewport to 375px (mobile) and verify menu toggles cleanly.

---

### BUG-12 (LOW): Lack of Clear Search Button and Result Counts
- **Affected File:** `src/app/sheets/[sheetId]/SheetViewerClient.tsx` (Line 830)
- **Root Cause:** When a user types a query, there is no quick clear (X) icon, and no counter showing "X matching rows found".
- **Severity:** LOW
- **Proposed Fix:**
  - Add clear button and live result counter.
- **Verification Method:** Type query, verify matching count appears, click X and verify table immediately restores all rows.

---

### BUG-13 (LOW): Formula Tooltips Render Inconsistently
- **Affected File:** `src/app/sheets/[sheetId]/SheetViewerClient.tsx` (Line 914)
- **Root Cause:** HTML `title` attributes on table cells containing Marathi text sometimes fail to display if string length is large.
- **Severity:** LOW
- **Proposed Fix:**
  - Clean up formula tooltip formatting to show `=FORMULA` cleanly.
- **Verification Method:** Hover over formula cells in `नमुना ८` or `April` and verify formula displays.

---

### BUG-14 (LOW): Absence of API Unit Tests
- **Affected File:** Project root
- **Root Cause:** The project lacked an automated test suite verifying search, lookup, and data service functions.
- **Severity:** LOW
- **Proposed Fix:**
  - Add automated test scripts in `scripts/test-search.js` and `scripts/test-services.js` runnable via `npm test`.
- **Verification Method:** Run `npm test` and verify all tests pass.

---

### BUG-15 (LOW): Turbopack Home Directory Warning
- **Affected File:** `next.config.ts`
- **Root Cause:** `next.config.ts` lacks `outputFileTracingRoot` or `turbopack` root config, triggering Next.js home directory warning on Windows.
- **Severity:** LOW
- **Proposed Fix:**
  - Add `turbopack: { root: __dirname }` or configure `outputFileTracingRoot: path.join(__dirname)` in `next.config.ts`.
- **Verification Method:** Run `npm run build` and verify clean build without warning.

---

### BUG-16 (CRITICAL): `EROFS: read-only file system` Crash on Serverless Deployment When Saving Google Sheets Sync Settings
- **Affected Files:**
  - `src/app/api/settings/route.ts` (lines 22, 46)
  - `src/lib/googleSheetsSync.ts` (lines 155, 174, 193, 214)
  - `src/lib/sheetsService.ts` (lines 29, 37)
- **Root Cause:**
  1. In serverless production environments (Vercel, AWS Lambda, read-only Docker containers), the application bundle is deployed at `/var/task`, which is mounted as a strictly read-only filesystem.
  2. Any execution of `fs.writeFileSync` to `/var/task/src/data/settings.json`, `sync_logs.json`, or sheet data files immediately throws `EROFS: read-only file system, open '/var/task/src/data/settings.json'`.
  3. GET `/api/settings` attempted to write default settings to disk if the file was missing (`fs.writeFileSync(SETTINGS_FILE, ...)`), crashing immediately on serverless start.
  4. Saving the Google Apps Script Web App URL in the Google Sheets Sync Center relied on writing to `src/data/settings.json`, which threw a 500 error in production.
  5. Missing strict Google Apps Script Web App URL validation allowed arbitrary non-HTTPS or invalid input.
- **Severity:** CRITICAL
- **Proposed Fix:**
  - Migrate persistent settings and audit logs to Supabase PostgreSQL:
    - `gramseva_settings`: Key-value JSONB table for `sync` and `general` configuration.
    - `gramseva_sync_logs`: Structured audit log table with indexed timestamps.
    - `gramseva_sheet_mutations`: Serverless audit log for sheet row mutations.
  - Create Supabase client and storage adapter in `src/lib/supabaseClient.ts` with service role authentication and RLS policies.
  - Implement `safeWriteJson` wrapper that detects serverless read-only filesystem environments (`process.env.VERCEL`, `process.env.AWS_LAMBDA_FUNCTION_NAME`, `/var/task`) and safely catches `EROFS` without throwing exceptions.
  - Implement strict URL validation (`validateGasWebAppUrl`) enforcing HTTPS and `script.google.com/macros/s/` structure (while supporting localhost/127.0.0.1 for local test runners).
  - Sanitize API responses so raw webhook secrets and database credentials are never exposed in frontend API responses or public UI.
  - Provide `supabase/schema.sql` database migration script and `.env.example` documentation.
- **Verification Method:** Run `npm run test:persistence` and test invalid URLs, valid URLs, serverless read-only filesystem simulation, and settings persistence.

---

## Repair Strategy & Execution Plan

1. **Phase 3 (Search):** Overhaul search algorithm with Unicode NFC normalization, numeric float cleaning, debouncing, match highlighting, and clear button.
2. **Phase 4 (Backend APIs & Data Integrity):** Build `/api/sheets/[sheetId]`, `/api/lookup/property/[propertyNo]`, `/api/sync`, and `/api/settings`.
3. **Phase 5 (Forms & UI):** Complete Add Record modal, full 31-column Edit modal, real dynamic document generation for `utara`, `magani-bill`, `namuna-10-pavati`, `namuna-7-pavati`, and real WhatsApp API invocation.
4. **Phase 6 (Mobile & Responsive):** Mobile drawer menu and table layout improvements.
5. **Phase 7 & 8 (Testing & Verification):** Add test suite, execute checks, verify builds.
