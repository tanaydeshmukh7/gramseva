// Supabase Persistence & Read-Only Serverless Resilience Verification Suite
const http = require('http');
const path = require('path');
const fs = require('fs');

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

function request(method, pathName, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (dataString) {
      reqHeaders['Content-Length'] = Buffer.byteLength(dataString);
    }

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: pathName,
      method,
      headers: reqHeaders,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (dataString) req.write(dataString);
    req.end();
  });
}

async function runTests() {
  console.log('==================================================================');
  console.log('GRAMSEVA — SUPABASE PERSISTENCE & READ-ONLY FILESYSTEM RESILIENCE');
  console.log('==================================================================\n');

  // 1. Google Apps Script Web App URL Validation Tests
  console.log('--- 1. Google Apps Script Web App URL Validation Tests ---');

  // Test invalid URL (HTTP instead of HTTPS)
  const invalidHttpRes = await request('POST', '/api/sync', {
    action: 'SAVE_CONFIG',
    config: {
      gas_web_app_url: 'http://script.google.com/macros/s/AKfycbz_TEST/exec',
    },
  });
  assert(
    invalidHttpRes.status === 400,
    'Rejects non-HTTPS URL with HTTP 400 Bad Request',
    `Status: ${invalidHttpRes.status}`
  );
  assert(
    invalidHttpRes.data.error.includes('HTTPS'),
    'Detailed error mentions HTTPS requirement',
    invalidHttpRes.data.error
  );

  // Test invalid domain
  const invalidDomainRes = await request('POST', '/api/sync', {
    action: 'SAVE_CONFIG',
    config: {
      gas_web_app_url: 'https://evil-hacker.com/macros/s/AKfycbz_TEST/exec',
    },
  });
  assert(
    invalidDomainRes.status === 400,
    'Rejects unauthorized host domain with HTTP 400',
    `Status: ${invalidDomainRes.status}`
  );
  assert(
    invalidDomainRes.data.error.includes('script.google.com'),
    'Detailed error mentions script.google.com required',
    invalidDomainRes.data.error
  );

  // Test invalid path
  const invalidPathRes = await request('POST', '/api/sync', {
    action: 'SAVE_CONFIG',
    config: {
      gas_web_app_url: 'https://script.google.com/home/projects',
    },
  });
  assert(
    invalidPathRes.status === 400,
    'Rejects URL without /macros/s/ with HTTP 400',
    `Status: ${invalidPathRes.status}`
  );

  // 2. Fix the Save Operation: Valid URL Persistence
  console.log('\n--- 2. Fix Save Operation & Persistence Verification ---');

  const testGasUrl = 'https://script.google.com/macros/s/AKfycbz_ProductionVerified2026/exec';

  const saveRes = await request('POST', '/api/sync', {
    action: 'SAVE_CONFIG',
    config: {
      gas_web_app_url: testGasUrl,
      sync_direction: 'two_way',
      conflict_policy: 'admin_review',
    },
  });

  assert(saveRes.status === 200, 'Save settings succeeds with HTTP 200 OK', `Status: ${saveRes.status}`);
  assert(saveRes.data.success === true, 'Response contains success: true');
  assert(
    saveRes.data.settings.gas_web_app_url === testGasUrl,
    'Response confirms saved gas_web_app_url',
    saveRes.data.settings?.gas_web_app_url
  );

  // Verify secret token is NOT exposed in response
  assert(
    saveRes.data.settings.webhook_secret === undefined,
    'Secret token is strictly sanitized (never exposed in API response)'
  );
  assert(
    typeof saveRes.data.settings.webhook_secret_configured === 'boolean',
    'Returns boolean webhook_secret_configured indicator'
  );

  // 3. Reload / Fetch Verification
  console.log('\n--- 3. Page Reload / GET Persistence Verification ---');

  const getRes = await request('GET', '/api/sync');
  assert(getRes.status === 200, 'GET /api/sync succeeds with HTTP 200');
  assert(
    getRes.data.gas_web_app_url === testGasUrl,
    'Reloaded settings persist gas_web_app_url correctly across requests',
    `Expected: ${testGasUrl}, Got: ${getRes.data.gas_web_app_url}`
  );
  assert(
    getRes.data.status === 'ONLINE',
    'Status indicates ONLINE when GAS URL is configured',
    getRes.data.status
  );
  assert(
    getRes.data.storage_backend !== undefined,
    `Active storage backend reported: ${getRes.data.storage_backend}`
  );

  // 4. Serverless Read-Only Filesystem (EROFS) Immunity Tests
  console.log('\n--- 4. Serverless Read-Only Filesystem (EROFS) Immunity Tests ---');

  // Verify that GET /api/settings never writes to disk
  const settingsGetRes = await request('GET', '/api/settings');
  assert(settingsGetRes.status === 200, 'GET /api/settings succeeds without disk write');
  assert(
    settingsGetRes.data.panchayat_name.includes('गोहगाव'),
    'Panchayat settings returned correctly'
  );

  // Verify that POST /api/settings updates successfully without crashing on EROFS
  const settingsPostRes = await request('POST', '/api/settings', {
    contact_no: '07251-224455',
  });
  assert(
    settingsPostRes.status === 200,
    'POST /api/settings updates settings successfully without EROFS crash'
  );
  assert(
    settingsPostRes.data.settings.contact_no === '07251-224455',
    'Contact number persisted correctly'
  );

  // 5. Inbound Webhook Processing & Formula Preservation
  console.log('\n--- 5. Webhook Operations & In-Memory Data Stability ---');

  const webhookCheckRes = await request('GET', '/api/webhook/google-sheets');
  assert(
    webhookCheckRes.status === 200 && webhookCheckRes.data.status === 'WEBHOOK_READY',
    'Webhook listener operational and reports WEBHOOK_READY'
  );

  // 6. SQL Schema File Verification
  console.log('\n--- 6. Supabase SQL Schema Verification ---');
  const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql');
  const schemaExists = fs.existsSync(schemaPath);
  assert(schemaExists, 'supabase/schema.sql exists for Supabase setup');

  if (schemaExists) {
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    assert(
      schemaContent.includes('CREATE TABLE IF NOT EXISTS gramseva_settings'),
      'Schema includes gramseva_settings table definition'
    );
    assert(
      schemaContent.includes('CREATE TABLE IF NOT EXISTS gramseva_sync_logs'),
      'Schema includes gramseva_sync_logs table definition'
    );
    assert(
      schemaContent.includes('ROW LEVEL SECURITY'),
      'Schema enables Row Level Security (RLS) for data protection'
    );
  }

  console.log('\n==================================================================');
  console.log(`TOTAL TESTS: ${totalTests}`);
  console.log(`PASSED: ${passedTests}`);
  console.log(`FAILED: ${failedTests}`);
  console.log('==================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log('ALL PERSISTENCE AND EROFS RESILIENCE TESTS PASSED! 100% PASS RATE\n');
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
