const http = require('http');

const urls = [
  '/',
  '/sheets/namuna-8',
  '/sheets/utara',
  '/sheets/magani-bill',
  '/sheets/namuna-10-pavati',
  '/sheets/namuna-7-pavati',
  '/sheets/masik-sabha-notice',
  '/sync',
  '/settings',
  '/api/sync',
  '/api/settings',
  '/api/lookup/property/6B'
];

let completed = 0;
let hasError = false;

urls.forEach(u => {
  http.get('http://localhost:3000' + u, res => {
    console.log(`[HTTP ${res.statusCode}] ${u}`);
    if (res.statusCode >= 400) {
      hasError = true;
    }
    completed++;
    if (completed === urls.length) {
      if (hasError) {
        console.error('Some routes failed!');
        process.exit(1);
      } else {
        console.log('All live endpoints verified successfully (HTTP 200 OK)!');
        process.exit(0);
      }
    }
  }).on('error', err => {
    console.error(`[ERROR] ${u}: ${err.message}`);
    completed++;
    hasError = true;
    if (completed === urls.length) process.exit(1);
  });
});
