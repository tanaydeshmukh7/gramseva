// Comprehensive End-to-End Bidirectional Google Sheets Sync Test Suite
// Testing against live Gramसेवा API endpoints on http://localhost:3000
const http = require('http');
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

const dataDir = path.join(process.cwd(), 'src', 'data');
const sheetsDir = path.join(dataDir, 'sheets');
const settingsFile = path.join(dataDir, 'settings.json');
const syncLogsFile = path.join(dataDir, 'sync_logs.json');

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ statusCode: res.statusCode, headers: res.headers, body: json });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

function countAllFormulas() {
  const files = fs.readdirSync(sheetsDir).filter(f => f.endsWith('.json'));
  let total = 0;
  for (const f of files) {
    const sheet = JSON.parse(fs.readFileSync(path.join(sheetsDir, f), 'utf-8'));
    for (const row of sheet.rows) {
      for (const cell of row.cells) {
        if (cell.formula) total++;
      }
    }
  }
  return total;
}

async function runTests() {
  console.log('==================================================================');
  console.log('GRAMSEVA — REAL-TIME BIDIRECTIONAL GOOGLE SHEETS SYNC VERIFICATION');
  console.log('==================================================================\n');

  const baselineFormulas = countAllFormulas();
  console.log(`Baseline formula count across all 26 sheets: ${baselineFormulas}`);
  assert(baselineFormulas === 18340, 'Baseline formula integrity verified (18,340 formula definitions)');

  const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'));
  const webhookSecret = process.env.GRAMSEVA_WEBHOOK_SECRET || settings.webhook_secret || 'gramseva_gohgaon_secure_sync_token_2026';

  // --------------------------------------------------------------------------
  // 1. Inbound Webhook Health & Security
  // --------------------------------------------------------------------------
  console.log('\n--- 1. Inbound Webhook Health & Authentication Tests ---');

  // Test 1.1: Webhook GET Health Check
  const healthRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/webhook/google-sheets',
    method: 'GET',
  });
  assert(healthRes.statusCode === 200, 'Webhook health check returns HTTP 200 OK');
  assert(healthRes.body.status === 'WEBHOOK_READY', 'Webhook listener reports status "WEBHOOK_READY"');

  // Test 1.2: Reject unauthorized request
  const unauthRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/webhook/google-sheets',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-gramseva-secret': 'invalid_secret_token_12345',
      },
    },
    { action: 'EDIT', sheetName: 'नमुना ८', rowIndex: 14, colIndex: 3, newValue: 'Hacked' }
  );
  assert(unauthRes.statusCode === 401, 'Webhook rejects request with invalid secret token (HTTP 401 Unauthorized)');


  // --------------------------------------------------------------------------
  // 2. Real-Time Inbound Edit: Google Sheets -> Gramसेवा
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Inbound Real-Time Edit Test (Google Sheets -> Gramसेवा) ---');

  const n8Path = path.join(sheetsDir, 'namuna-8.json');
  const n8Original = JSON.parse(fs.readFileSync(n8Path, 'utf-8'));
  const targetRowIndex = 14;
  const originalRow = n8Original.rows.find(r => r.row_index === targetRowIndex);
  const originalCol3 = originalRow?.cells.find(c => c.col === 3)?.value || null;

  const testNewName = 'श्री. विलास बाबाराव देशमुख (Google Sheets Live Edit Test)';

  // Send real-time EDIT event as if Google Apps Script triggered onEdit
  const editRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/webhook/google-sheets',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-gramseva-secret': webhookSecret,
      },
    },
    {
      action: 'EDIT',
      sheetName: 'नमुना ८',
      rowIndex: targetRowIndex,
      colIndex: 3,
      newValue: testNewName,
    }
  );

  assert(editRes.statusCode === 200, 'Inbound EDIT webhook accepted (HTTP 200)');
  assert(editRes.body.success === true, 'Webhook reported success for live edit');

  // Verify change in local JSON storage
  const n8Updated = JSON.parse(fs.readFileSync(n8Path, 'utf-8'));
  const updatedRow = n8Updated.rows.find(r => r.row_index === targetRowIndex);
  const updatedCol3 = updatedRow?.cells.find(c => c.col === 3)?.value;
  assert(updatedCol3 === testNewName, `Namuna 8 disk record updated in real-time to: "${updatedCol3}"`);

  // Formula integrity check during edit
  const midFormulaCount = countAllFormulas();
  assert(midFormulaCount === baselineFormulas, `Formula preservation confirmed during edit (Formulas intact: ${midFormulaCount})`);

  // Restore original value via webhook
  await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/webhook/google-sheets',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-gramseva-secret': webhookSecret,
      },
    },
    {
      action: 'EDIT',
      sheetName: 'नमुना ८',
      rowIndex: targetRowIndex,
      colIndex: 3,
      newValue: originalCol3,
    }
  );
  console.log('  ✓ Cleaned up test record in Namuna 8 (original record restored)');


  // --------------------------------------------------------------------------
  // 3. Real-Time Inbound Row Addition, Deduplication & Deletion
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Inbound Row Add, Deduplication & Delete Tests ---');

  const mobilePath = path.join(sheetsDir, 'all-mobile-no.json');
  const mobileOriginal = JSON.parse(fs.readFileSync(mobilePath, 'utf-8'));
  const originalMobileCount = mobileOriginal.rows.length;

  const testTaxpayerPayload = {
    action: 'ADD_ROW',
    sheetName: 'all mobile no',
    cells: [
      { col: 1, value: 'AUTOMATED SYNC TAXPAYER' },
      { col: 2, value: 'स्वयंचलित सिंक चाचणी करदाता' },
      { col: 3, value: 'Male' },
      { col: 7, value: 9988776655 },
    ],
  };

  // Add Row
  const addRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/webhook/google-sheets',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-gramseva-secret': webhookSecret,
      },
    },
    testTaxpayerPayload
  );

  assert(addRes.statusCode === 200, 'Inbound ADD_ROW webhook accepted (HTTP 200)');
  const mobileAfterAdd = JSON.parse(fs.readFileSync(mobilePath, 'utf-8'));
  assert(mobileAfterAdd.rows.length === originalMobileCount + 1, `all-mobile-no rows incremented from ${originalMobileCount} to ${mobileAfterAdd.rows.length}`);

  // Deduplication: send identical taxpayer again
  const duplicateRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/webhook/google-sheets',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-gramseva-secret': webhookSecret,
      },
    },
    testTaxpayerPayload
  );
  assert(duplicateRes.statusCode === 200, 'Deduplicated addition accepted cleanly');
  const mobileAfterDup = JSON.parse(fs.readFileSync(mobilePath, 'utf-8'));
  assert(mobileAfterDup.rows.length === originalMobileCount + 1, `Deduplication verified: record count remained ${mobileAfterDup.rows.length} (no duplicate created)`);

  // Delete the test row
  const addedRow = mobileAfterAdd.rows[mobileAfterAdd.rows.length - 1];
  const deleteRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/webhook/google-sheets',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-gramseva-secret': webhookSecret,
      },
    },
    {
      action: 'DELETE_ROW',
      sheetName: 'all mobile no',
      rowIndex: addedRow.row_index,
    }
  );
  assert(deleteRes.statusCode === 200, 'Inbound DELETE_ROW webhook accepted (HTTP 200)');
  const mobileAfterDelete = JSON.parse(fs.readFileSync(mobilePath, 'utf-8'));
  assert(mobileAfterDelete.rows.length === originalMobileCount, `all-mobile-no restored to original ${originalMobileCount} rows`);


  // --------------------------------------------------------------------------
  // 4. Outbound Sync: Gramसेवा -> Google Sheets
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Outbound Sync Tests (Gramसेवा -> Google Sheets) ---');

  // Start local mock Google Apps Script Web App listener on port 3099
  let mockGasReceived = null;
  const mockGasServer = http.createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      mockGasReceived = JSON.parse(body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          success: true,
          action: mockGasReceived.action,
          sheetName: mockGasReceived.sheetName,
          row: mockGasReceived.rowIndex,
          message: 'Google Sheets mock received and applied update successfully.',
        })
      );
    });
  });

  await new Promise((resolve) => mockGasServer.listen(3099, resolve));

  // Configure Gramसेवा to point to mock Google Apps Script Web App
  await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/sync',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      action: 'SAVE_CONFIG',
      config: {
        gas_web_app_url: 'http://localhost:3099',
        sync_direction: 'two_way',
      },
    }
  );

  // Trigger PUT /api/sheets/namuna-8 (simulating user editing a record in Gramसेवा)
  const putRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/sheets/namuna-8',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      row: {
        row_index: 18,
        cells: [
          { col: 1, value: 7 },
          { col: 2, value: 7 },
          { col: 3, value: 'श्रीमती कलावती बाबाराव डाखोरे' },
          { col: 5, value: '8' },
        ],
      },
    }
  );

  assert(putRes.statusCode === 200, 'Gramसेवा PUT endpoint executed successfully (HTTP 200)');
  assert(putRes.body.sync && putRes.body.sync.dispatched === true, 'Outbound push was dispatched to Google Apps Script');
  assert(mockGasReceived !== null, 'Google Apps Script received the outbound push payload');
  assert(mockGasReceived.sheetName === 'नमुना ८', `Google Apps Script received exact Marathi worksheet name: "${mockGasReceived?.sheetName}"`);
  assert(mockGasReceived.secret === webhookSecret, 'Google Apps Script verified the secret token');
  assert(mockGasReceived.action === 'UPDATE_ROW', 'Google Apps Script action was UPDATE_ROW');

  // Clean up settings & close mock server
  await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/sync',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      action: 'SAVE_CONFIG',
      config: {
        gas_web_app_url: '',
      },
    }
  );

  await new Promise((resolve) => mockGasServer.close(resolve));
  console.log('  ✓ Mock Google Apps Script server closed cleanly');


  // --------------------------------------------------------------------------
  // 5. Manual Sync Now & Audit History Verification
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Manual Sync Now & Audit History Verification ---');

  const manualSyncRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/sync',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { direction: 'two_way' }
  );

  assert(manualSyncRes.statusCode === 200, 'Manual Sync Now executed successfully (HTTP 200)');
  assert(manualSyncRes.body.success === true, 'Sync Now response returned success: true');

  // Verify Audit Log file
  const logs = JSON.parse(fs.readFileSync(syncLogsFile, 'utf-8'));
  assert(logs.length >= 6, `Sync audit logs recorded transactions (Found: ${logs.length} logs)`);
  assert(logs[0].status === 'SUCCESS', `Latest audit log entry is SUCCESS (Timestamp: ${logs[0].timestamp})`);

  // Final Formula Integrity Check
  const finalFormulas = countAllFormulas();
  assert(finalFormulas === 18340, `Final formula integrity verified: 18,340 formulas intact (initial: ${baselineFormulas}, final: ${finalFormulas})`);

  console.log('\n==================================================================');
  console.log(`TOTAL BIDIRECTIONAL SYNC TESTS: ${totalTests}`);
  console.log(`PASSED: ${passedTests}`);
  console.log(`FAILED: ${failedTests}`);
  console.log('==================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log('ALL REAL-TIME BIDIRECTIONAL SYNC TESTS PASSED SUCCESSFULLY! 100% PASS RATE');
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
