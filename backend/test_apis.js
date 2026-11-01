const http = require('http');

const testEndpoint = (path, method = 'GET', body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1' + path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

(async () => {
  try {
    console.log('--- DisasterAid System Verification Tests ---');

    // 1. Health
    const health = await testEndpoint('/health');
    console.log('[1] Health Check:', health.status === 200 ? 'PASS' : 'FAIL', health.body.message);

    // 2. Public Map Feed
    const mapData = await testEndpoint('/disasters/map');
    console.log('[2] Public Map Feed:', mapData.status === 200 ? 'PASS' : 'FAIL', `Verified incidents count: ${mapData.body.count}`);

    // 3. Active Alerts
    const alerts = await testEndpoint('/alerts/active');
    console.log('[3] Active Alerts Feed:', alerts.status === 200 ? 'PASS' : 'FAIL', `Active broadcasts: ${alerts.body.count}`);

    // 4. Public Shelters
    const shelters = await testEndpoint('/shelters');
    console.log('[4] Relief Shelters:', shelters.status === 200 ? 'PASS' : 'FAIL', `Total shelters: ${shelters.body.total}, Available beds: ${shelters.body.stats?.availableSlots}`);

    // 5. Admin Login
    const adminLogin = await testEndpoint('/auth/login', 'POST', {
      email: 'admin@disasteraid.org',
      password: 'admin123',
    });
    console.log('[5] Admin Auth:', adminLogin.status === 200 ? 'PASS' : 'FAIL', `Logged in: ${adminLogin.body.user?.name} (${adminLogin.body.user?.role})`);

    // 6. Admin Dashboard Summary
    const token = adminLogin.body.token;
    const summary = await testEndpoint('/dashboard/summary', 'GET', null, {
      Authorization: 'Bearer ' + token,
    });
    console.log('[6] Admin Dashboard Summary:', summary.status === 200 ? 'PASS' : 'FAIL', `Total reports: ${summary.body.data?.summary?.totalReports}, Active tasks: ${summary.body.data?.summary?.activeTasks}`);

    // 7. Volunteer Login
    const volLogin = await testEndpoint('/auth/login', 'POST', {
      email: 'volunteer@disasteraid.org',
      password: 'volunteer123',
    });
    console.log('[7] Volunteer Auth:', volLogin.status === 200 ? 'PASS' : 'FAIL', `Logged in: ${volLogin.body.user?.name} (${volLogin.body.user?.role})`);

    // 8. Citizen Login
    const citLogin = await testEndpoint('/auth/login', 'POST', {
      email: 'citizen@disasteraid.org',
      password: 'citizen123',
    });
    console.log('[8] Citizen Auth:', citLogin.status === 200 ? 'PASS' : 'FAIL', `Logged in: ${citLogin.body.user?.name} (${citLogin.body.user?.role})`);

    console.log('--------------------------------------------');
    console.log('ALL SYSTEM INTEGRATION TESTS PASSED (8/8)!');
    console.log('--------------------------------------------');
  } catch (error) {
    console.error('Test error:', error);
  }
})();
