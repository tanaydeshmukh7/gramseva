# Gramसेवा — Google Apps Script Production Setup & Bidirectional Sync Guide

This directory contains the production Google Apps Script (`Code.gs`) that establishes real-time, bidirectional synchronization between your master **Google Spreadsheet** (`ग्रामपंचायत गोहगाव`) and **Gramसेवा**.

---

## 1. Important Production Pre-requisites

> [!WARNING]
> **1. Public HTTPS Endpoint Required:**  
> Google Apps Script runs entirely on Google's cloud servers. It **CANNOT connect to `http://localhost:3000`**.  
> Your Gramसेवा instance must be hosted on a public domain (e.g., `https://gramseva.yourdomain.com/api/webhook/google-sheets`) OR exposed via a secure HTTPS tunnel (e.g., Cloudflare Tunnel `cloudflared` or `ngrok http 3000`).

> [!IMPORTANT]
> **2. Never Hardcode or Commit Secrets:**  
> Store your secret token in Google Apps Script's **Script Properties (प्रकल्प गुणधर्म)**, never in plain code committed to GitHub.

---

## 2. Production Setup (4 Steps)

### Step 1: Open Google Apps Script
1. Open your master Google Spreadsheet:  
   [https://docs.google.com/spreadsheets/d/17YLlwp4oMrTx4-Y0ugQ19MfghwV66dL3eipSQesOLFk/edit](https://docs.google.com/spreadsheets/d/17YLlwp4oMrTx4-Y0ugQ19MfghwV66dL3eipSQesOLFk/edit)
2. In the top navigation menu, click **Extensions (विस्तार)** → **Apps Script**.

### Step 2: Paste `Code.gs`
1. Delete any sample placeholder code in the Apps Script editor.
2. Copy the entire contents of [`Code.gs`](file:///C:/Users/tanay/OneDrive/Desktop/gramseva/google-apps-script/Code.gs) and paste it into the editor.
3. Click **Save (जतन करा)** (💾 icon) or press `Ctrl + S`.

### Step 3: Securely Store Credentials & Install Triggers
1. In the Apps Script toolbar function dropdown, select **`setupCredentials`**.
2. Or open **Project Settings (प्रकल्प सेटिंग्ज)** (⚙️ gear icon) → scroll down to **Script Properties (प्रकल्प गुणधर्म)** → click **Add script property**:
   - `WEBHOOK_URL`: Your public HTTPS Gramसेवा webhook URL (e.g., `https://your-domain.com/api/webhook/google-sheets`)
   - `WEBHOOK_SECRET`: Your private shared webhook authentication secret
3. Select the function **`installTriggers`** from the function dropdown and click **Run (चालवा)**.
   - Click **Review permissions** when prompted by Google.
   - Choose your Google account and grant permissions (Google will show a one-time authorization screen).
   - This automatically installs:
     - `onSheetEditTrigger`: Real-time cell edit sync.
     - `onSheetChangeTrigger`: Real-time row insertion and deletion sync.
     - `periodicReconcileTrigger`: Automated 10-minute fallback reconciliation.

### Step 4: Deploy as Web App (For Gramसेवा ➔ Google Sheets Sync)
1. In the upper-right corner of Apps Script, click **Deploy (उपयोजन)** → **New deployment (नवीन उपयोजन)**.
2. Click the gear icon next to "Select type" and choose **Web app (वेब ॲप)**.
3. Configure:
   - **Description:** `Gramसेवा Bidirectional Sync Engine`
   - **Execute as (च्या रूपात चालवा):** `Me (मी - your Google account)`
   - **Who has access (प्रवेश कोणास आहे):** `Anyone (कोणीही)`
4. Click **Deploy**.
5. Copy the generated **Web App URL** (e.g., `https://script.google.com/macros/s/AKfycb.../exec`).
6. Open Gramसेवा's [Sync Center](http://localhost:3000/sync), paste the URL into **Google Apps Script Web App URL**, and click **सेटिंग्ज जतन करा (Save Settings)**.

---

## 3. How Bidirectional Real-Time Sync Works

```
Google Spreadsheet Edit / Insert / Delete
       │
       ▼ (Runs in Google Cloud)
Apps Script onEdit / onChange Trigger
       │
       ▼ (Authenticated HTTP POST with x-gramseva-secret)
Gramसेवा Webhook: /api/webhook/google-sheets
       │
       ▼ (Unicode NFC normalization, deduplication & formula preservation)
Gramसेवा Local Storage & UI Updated in Real-Time
```

```
Gramसेवा Edit / Add / Delete Action
       │
       ▼ (Dispatched from /api/sheets/[sheetId])
Gramसेवा Outbound Dispatcher (pushToGoogleSheets)
       │
       ▼ (Authenticated HTTPS POST to Web App URL)
Google Apps Script doPost Handler
       │
       ▼ (Updates cell values and preserves formulas)
Google Spreadsheet Updated in Real-Time
```

---

## 4. Verification Check
- Once configured, edit a cell in the Google Spreadsheet (e.g. change an owner name in `नमुना ८`).
- Refresh Gramसेवा's [Namuna 8 page](http://localhost:3000/sheets/namuna-8) to see the update reflected instantly.
- Open [Sync Center](http://localhost:3000/sync) to view the live audit log entry with timestamp and status `✓ यशस्वी`.
