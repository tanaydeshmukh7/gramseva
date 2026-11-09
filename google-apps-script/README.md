# Gramसेवा — Google Apps Script Setup & Bidirectional Sync Guide

This directory contains the production-ready Google Apps Script (`Code.gs`) that powers real-time, bidirectional synchronization between your **Google Spreadsheet** (`ग्रामपंचायत गोहगाव`) and **Gramसेवा**.

---

## 1. Quick Setup (3 Steps)

### Step 1: Open Google Apps Script
1. Open your master Google Spreadsheet:
   [https://docs.google.com/spreadsheets/d/17YLlwp4oMrTx4-Y0ugQ19MfghwV66dL3eipSQesOLFk/edit](https://docs.google.com/spreadsheets/d/17YLlwp4oMrTx4-Y0ugQ19MfghwV66dL3eipSQesOLFk/edit)
2. In the top menu, click **Extensions (विस्तार)** → **Apps Script**.

### Step 2: Paste Code & Configure
1. Delete any sample code in the Apps Script editor.
2. Copy the entire contents of `Code.gs` and paste it into the editor.
3. Update the `CONFIG` object or configure Script Properties:
   ```javascript
   var CONFIG = {
     // Your Gramसेवा webhook URL (e.g., https://your-domain.com/api/webhook/google-sheets or local tunnel)
     WEBHOOK_URL: 'https://your-domain.com/api/webhook/google-sheets',
     
     // Webhook Secret (must match the secret in Gramसेवा Sync Settings)
     WEBHOOK_SECRET: 'gramseva_gohgaon_secure_sync_token_2026',
     
     // Your Google Spreadsheet ID
     SPREADSHEET_ID: '17YLlwp4oMrTx4-Y0ugQ19MfghwV66dL3eipSQesOLFk',
   };
   ```
4. Click **Save (जतन करा)** (💾 icon).

### Step 3: Install Triggers & Deploy Web App
1. In the function dropdown, select **`installTriggers`** and click **Run (चालवा)**.
   - Grant the required permissions when prompted.
   - This automatically creates the installable `onEdit` and `onChange` triggers.
2. To allow Gramसेवा to update your Google Spreadsheet:
   - Click **Deploy (उपयोजन)** → **New deployment (नवीन उपयोजन)**.
   - Select type: **Web app (वेब ॲप)**.
   - Set:
     - **Execute as (च्या रूपात चालवा):** `Me (मी)`
     - **Who has access (प्रवेश कोणास आहे):** `Anyone (कोणीही)`
   - Click **Deploy**.
   - Copy the generated **Web App URL** and paste it into Gramसेवा's **Sync Center (सिंक्रोनायझेशन केंद्र)** under `Google Apps Script Web App URL`.

---

## 2. Bidirectional Event Flow

```
[Google Spreadsheet] 
       │ (User edits a cell / inserts a row)
       ▼
[Apps Script Installable Trigger]
       │ (HTTP POST with x-gramseva-secret)
       ▼
[Gramसेवा /api/webhook/google-sheets]
       │ (Unicode NFC normalization, deduplication & formula preservation)
       ▼
[Gramसेवा Local JSON Database & UI]
```

```
[Gramसेवा Web App]
       │ (User edits, adds or deletes record)
       ▼
[Gramसेवा /api/sheets/[sheetId]]
       │ (HTTP POST with secret & cell data)
       ▼
[Apps Script doPost Web App]
       │ (Updates cell values and preserves formulas)
       ▼
[Google Spreadsheet Updated]
```

---

## 3. Data Integrity & Safeguards
- **Formula Preservation:** Existing calculated formulas (e.g. house tax, capital value, totals) are never overwritten by plain numbers.
- **Deduplication:** When adding records, Gramसेवा verifies unique identifiers (Property Number in `नमुना ८`, Taxpayer Name in `all mobile no`) to prevent duplicates.
- **Audit Logging:** Every sync operation (incoming or outgoing) is recorded in `src/data/sync_logs.json` with timestamp, source, action, records affected, and status.
