#!/usr/bin/env node

/**
 * Script de test pour le Système de Notifications - Beriox AI
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 10000;

const colors = {
  green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', blue: '\x1b[34m',
  reset: '\x1b[0m', bold: '\x1b[1m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.blue}${msg}${colors.reset}`)
};

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      timeout: TEST_TIMEOUT
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: data ? JSON.parse(data) : null,
            rawData: data
          });
        } catch (e) {
          resolve({ status: res.statusCode, data: null, rawData: data });
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

async function testNotificationsAPI() {
  log.header('🔔 Test API Notifications');
  
  const tests = [
    {
      name: 'GET Notifications (non authentifié)',
      url: '/api/notifications',
      method: 'GET',
      expectedStatus: [401]
    },
    {
      name: 'POST Notification (non authentifié)',
      url: '/api/notifications',
      method: 'POST',
      body: { type: 'info', priority: 'medium', title: 'Test', message: 'Test' },
      expectedStatus: [401]
    }
  ];
  
  let passed = 0;
  for (const test of tests) {
    try {
      const response = await makeRequest(`${BASE_URL}${test.url}`, {
        method: test.method,
        body: test.body
      });
      
      if (test.expectedStatus.includes(response.status)) {
        passed++;
        log.success(`${test.name} - Status: ${response.status}`);
      } else {
        log.warning(`${test.name} - Status: ${response.status}`);
      }
    } catch (error) {
      log.error(`${test.name} - Erreur: ${error.message}`);
    }
  }
  
  return { passed, total: tests.length, success: passed >= tests.length * 0.8 };
}

async function testNotificationSystem() {
  log.header('📝 Test Système de Notifications');
  
  const fs = require('fs');
  const files = [
    'src/lib/notifications.ts',
    'src/app/api/notifications/route.ts',
    'src/components/NotificationSystem.tsx'
  ];
  
  let found = 0;
  for (const file of files) {
    if (fs.existsSync(file)) {
      found++;
      log.success(`Fichier trouvé: ${file}`);
    } else {
      log.warning(`Fichier manquant: ${file}`);
    }
  }
  
  return { found, total: files.length, success: found >= files.length };
}

async function runNotificationTests() {
  log.header('🚀 Tests Notifications Beriox AI');
  
  const startTime = Date.now();
  
  try {
    const apiResult = await testNotificationsAPI();
    const systemResult = await testNotificationSystem();
    
    const totalTests = 2;
    const passedTests = [apiResult.success, systemResult.success].filter(Boolean).length;
    const duration = Date.now() - startTime;
    
    log.header('📊 Résultats Finaux');
    log.info(`Durée: ${duration}ms`);
    log.info(`Tests réussis: ${passedTests}/${totalTests}`);
    
    log.info('\n📋 Détails:');
    log.info(`🔔 API: ${apiResult.success ? '✅' : '❌'} (${apiResult.passed}/${apiResult.total})`);
    log.info(`📝 Système: ${systemResult.success ? '✅' : '❌'} (${systemResult.found}/${systemResult.total})`);
    
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    if (successRate >= 80) {
      log.success(`Taux de succès: ${successRate}% - Notifications fonctionnel!`);
    } else {
      log.warning(`Taux de succès: ${successRate}% - Notifications partiellement fonctionnel`);
    }
    
    const results = {
      timestamp: new Date().toISOString(),
      url: BASE_URL,
      duration,
      results: { api: apiResult, system: systemResult },
      summary: { totalTests, passedTests, successRate: parseFloat(successRate) }
    };
    
    require('fs').writeFileSync('notifications-test-report.json', JSON.stringify(results, null, 2));
    log.info('Rapport sauvegardé dans notifications-test-report.json');
    
    process.exit(passedTests < 2 ? 1 : 0);
    
  } catch (error) {
    log.error(`Erreur: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  runNotificationTests();
}

module.exports = { runNotificationTests, testNotificationsAPI, testNotificationSystem };
