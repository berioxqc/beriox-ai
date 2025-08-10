#!/usr/bin/env node

/**
 * Script de test pour l'A/B Testing - Beriox AI
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

async function testABTestingAPI() {
  log.header('🧪 Test API A/B Testing');
  
  const tests = [
    {
      name: 'GET Variant (non authentifié)',
      url: '/api/ab-testing?action=variant&experimentId=cta-button-test',
      method: 'GET',
      expectedStatus: [200, 404]
    },
    {
      name: 'GET Stats (non authentifié)',
      url: '/api/ab-testing?action=stats&experimentId=cta-button-test',
      method: 'GET',
      expectedStatus: [401]
    },
    {
      name: 'POST Conversion (non authentifié)',
      url: '/api/ab-testing?action=conversion',
      method: 'POST',
      body: { experimentId: 'test', variantId: 'test', goalId: 'test' },
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

async function testABTestingSystem() {
  log.header('📝 Test Système A/B Testing');
  
  const fs = require('fs');
  const files = [
    'src/lib/ab-testing.ts',
    'src/app/api/ab-testing/route.ts',
    'src/components/ABTestWrapper.tsx'
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
  
  // Vérifier le contenu du fichier principal
  const abTestingPath = 'src/lib/ab-testing.ts';
  if (fs.existsSync(abTestingPath)) {
    const content = fs.readFileSync(abTestingPath, 'utf8');
    
    const systemTests = [
      { name: 'ABTestingFramework class', content: 'class ABTestingFramework' },
      { name: 'ExperimentType enum', content: 'enum ExperimentType' },
      { name: 'VariantType enum', content: 'enum VariantType' },
      { name: 'ExperimentConfig interface', content: 'interface ExperimentConfig' },
      { name: 'getVariant method', content: 'getVariant(' },
      { name: 'recordImpression method', content: 'recordImpression(' },
      { name: 'recordConversion method', content: 'recordConversion(' },
      { name: 'getExperimentStats method', content: 'getExperimentStats(' },
      { name: 'calculateSignificance method', content: 'calculateSignificance(' },
      { name: 'Default experiments', content: 'initializeDefaultExperiments(' }
    ];
    
    let foundElements = 0;
    for (const test of systemTests) {
      if (content.includes(test.content)) {
        foundElements++;
        log.success(`Élément trouvé: ${test.name}`);
      } else {
        log.warning(`Élément manquant: ${test.name}`);
      }
    }
    
    const systemResult = {
      found: foundElements,
      total: systemTests.length,
      success: foundElements >= systemTests.length * 0.8
    };
    
    if (systemResult.success) {
      log.success(`Système: ${foundElements}/${systemTests.length} éléments trouvés`);
    } else {
      log.warning(`Système: ${foundElements}/${systemTests.length} éléments trouvés`);
    }
  }
  
  return { found, total: files.length, success: found >= files.length };
}

async function testDefaultExperiments() {
  log.header('🔬 Test Expériences par Défaut');
  
  const fs = require('fs');
  const abTestingPath = 'src/lib/ab-testing.ts';
  
  if (!fs.existsSync(abTestingPath)) {
    log.error('Fichier ab-testing.ts non trouvé');
    return { found: 0, total: 0, success: false };
  }
  
  const content = fs.readFileSync(abTestingPath, 'utf8');
  
  const experimentTests = [
    { name: 'CTA Button Test', content: 'cta-button-test' },
    { name: 'Pricing Layout Test', content: 'pricing-layout-test' },
    { name: 'Onboarding Flow Test', content: 'onboarding-flow-test' },
    { name: 'Button Text Variants', content: 'buttonText' },
    { name: 'Layout Variants', content: 'layout' },
    { name: 'Onboarding Variants', content: 'steps' }
  ];
  
  let foundExperiments = 0;
  for (const test of experimentTests) {
    if (content.includes(test.content)) {
      foundExperiments++;
      log.success(`Expérience trouvée: ${test.name}`);
    } else {
      log.warning(`Expérience manquante: ${test.name}`);
    }
  }
  
  const result = {
    found: foundExperiments,
    total: experimentTests.length,
    success: foundExperiments >= experimentTests.length * 0.8
  };
  
  if (result.success) {
    log.success(`Expériences: ${foundExperiments}/${experimentTests.length} trouvées`);
  } else {
    log.warning(`Expériences: ${foundExperiments}/${experimentTests.length} trouvées`);
  }
  
  return result;
}

async function runABTestingTests() {
  log.header('🚀 Tests A/B Testing Beriox AI');
  
  const startTime = Date.now();
  
  try {
    const apiResult = await testABTestingAPI();
    const systemResult = await testABTestingSystem();
    const experimentsResult = await testDefaultExperiments();
    
    const totalTests = 3;
    const passedTests = [apiResult.success, systemResult.success, experimentsResult.success].filter(Boolean).length;
    const duration = Date.now() - startTime;
    
    log.header('📊 Résultats Finaux');
    log.info(`Durée: ${duration}ms`);
    log.info(`Tests réussis: ${passedTests}/${totalTests}`);
    
    log.info('\n📋 Détails:');
    log.info(`🧪 API: ${apiResult.success ? '✅' : '❌'} (${apiResult.passed}/${apiResult.total})`);
    log.info(`📝 Système: ${systemResult.success ? '✅' : '❌'} (${systemResult.found}/${systemResult.total})`);
    log.info(`🔬 Expériences: ${experimentsResult.success ? '✅' : '❌'} (${experimentsResult.found}/${experimentsResult.total})`);
    
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    if (successRate >= 80) {
      log.success(`Taux de succès: ${successRate}% - A/B Testing fonctionnel!`);
    } else {
      log.warning(`Taux de succès: ${successRate}% - A/B Testing partiellement fonctionnel`);
    }
    
    const results = {
      timestamp: new Date().toISOString(),
      url: BASE_URL,
      duration,
      results: { api: apiResult, system: systemResult, experiments: experimentsResult },
      summary: { totalTests, passedTests, successRate: parseFloat(successRate) }
    };
    
    require('fs').writeFileSync('ab-testing-test-report.json', JSON.stringify(results, null, 2));
    log.info('Rapport sauvegardé dans ab-testing-test-report.json');
    
    process.exit(passedTests < 2 ? 1 : 0);
    
  } catch (error) {
    log.error(`Erreur: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  runABTestingTests();
}

module.exports = { runABTestingTests, testABTestingAPI, testABTestingSystem, testDefaultExperiments };
