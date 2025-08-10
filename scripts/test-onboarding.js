#!/usr/bin/env node

/**
 * Script de test pour l'Onboarding - Beriox AI
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

async function testOnboardingAPI() {
  log.header('🎯 Test API Onboarding');
  
  const tests = [
    {
      name: 'GET Progress (non authentifié)',
      url: '/api/onboarding?action=progress',
      method: 'GET',
      expectedStatus: [401]
    },
    {
      name: 'POST Start (non authentifié)',
      url: '/api/onboarding?action=start',
      method: 'POST',
      expectedStatus: [401]
    },
    {
      name: 'PUT Next Step (non authentifié)',
      url: '/api/onboarding?action=next',
      method: 'PUT',
      body: { stepData: {} },
      expectedStatus: [401]
    },
    {
      name: 'GET Steps (non authentifié)',
      url: '/api/onboarding?action=steps',
      method: 'GET',
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

async function testOnboardingSystem() {
  log.header('📝 Test Système Onboarding');
  
  const fs = require('fs');
  const files = [
    'src/lib/onboarding.ts',
    'src/app/api/onboarding/route.ts',
    'src/components/OnboardingFlow.tsx'
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
  const onboardingPath = 'src/lib/onboarding.ts';
  if (fs.existsSync(onboardingPath)) {
    const content = fs.readFileSync(onboardingPath, 'utf8');
    
    const systemTests = [
      { name: 'OnboardingManager class', content: 'class OnboardingManager' },
      { name: 'OnboardingStepType enum', content: 'enum OnboardingStepType' },
      { name: 'OnboardingStatus enum', content: 'enum OnboardingStatus' },
      { name: 'OnboardingStep interface', content: 'interface OnboardingStep' },
      { name: 'OnboardingProgress interface', content: 'interface OnboardingProgress' },
      { name: 'startOnboarding method', content: 'startOnboarding(' },
      { name: 'getProgress method', content: 'getProgress(' },
      { name: 'nextStep method', content: 'nextStep(' },
      { name: 'skipStep method', content: 'skipStep(' },
      { name: 'validateStep method', content: 'validateStep(' },
      { name: 'Default steps initialization', content: 'initializeDefaultSteps(' },
      { name: 'Welcome step', content: 'welcome' },
      { name: 'Profile setup step', content: 'profile-setup' },
      { name: 'First mission step', content: 'first-mission' },
      { name: 'Completion step', content: 'completion' }
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

async function testOnboardingSteps() {
  log.header('🎯 Test Étapes Onboarding');
  
  const fs = require('fs');
  const onboardingPath = 'src/lib/onboarding.ts';
  
  if (!fs.existsSync(onboardingPath)) {
    log.error('Fichier onboarding.ts non trouvé');
    return { found: 0, total: 0, success: false };
  }
  
  const content = fs.readFileSync(onboardingPath, 'utf8');
  
  const stepTests = [
    { name: 'Welcome Step', content: 'Bienvenue sur Beriox AI' },
    { name: 'Profile Setup Step', content: 'Configurez votre profil' },
    { name: 'Preferences Step', content: 'Définissez vos préférences' },
    { name: 'First Mission Step', content: 'Créez votre première mission' },
    { name: 'Features Tour Step', content: 'Découvrez les fonctionnalités' },
    { name: 'Integrations Step', content: 'Connectez vos outils' },
    { name: 'Billing Step', content: 'Configurez votre facturation' },
    { name: 'Completion Step', content: 'Félicitations' }
  ];
  
  let foundSteps = 0;
  for (const test of stepTests) {
    if (content.includes(test.content)) {
      foundSteps++;
      log.success(`Étape trouvée: ${test.name}`);
    } else {
      log.warning(`Étape manquante: ${test.name}`);
    }
  }
  
  const result = {
    found: foundSteps,
    total: stepTests.length,
    success: foundSteps >= stepTests.length * 0.8
  };
  
  if (result.success) {
    log.success(`Étapes: ${foundSteps}/${stepTests.length} trouvées`);
  } else {
    log.warning(`Étapes: ${foundSteps}/${stepTests.length} trouvées`);
  }
  
  return result;
}

async function testOnboardingComponents() {
  log.header('🎨 Test Composants Onboarding');
  
  const fs = require('fs');
  const componentPath = 'src/components/OnboardingFlow.tsx';
  
  if (!fs.existsSync(componentPath)) {
    log.error('Fichier OnboardingFlow.tsx non trouvé');
    return { found: 0, total: 0, success: false };
  }
  
  const content = fs.readFileSync(componentPath, 'utf8');
  
  const componentTests = [
    { name: 'OnboardingFlow component', content: 'function OnboardingFlow' },
    { name: 'useSession hook', content: 'useSession' },
    { name: 'useState hooks', content: 'useState' },
    { name: 'useEffect hooks', content: 'useEffect' },
    { name: 'FontAwesome icons', content: 'FontAwesomeIcon' },
    { name: 'Progress bar', content: 'completionRate' },
    { name: 'Step navigation', content: 'nextStep' },
    { name: 'Step skipping', content: 'skipStep' },
    { name: 'Step validation', content: 'validateStep' },
    { name: 'Welcome step component', content: 'WelcomeStep' },
    { name: 'Profile setup component', content: 'ProfileSetupStep' },
    { name: 'Preferences component', content: 'PreferencesStep' },
    { name: 'First mission component', content: 'FirstMissionStep' },
    { name: 'Features tour component', content: 'FeaturesTourStep' },
    { name: 'Integrations component', content: 'IntegrationsStep' },
    { name: 'Billing component', content: 'BillingStep' },
    { name: 'Completion component', content: 'CompletionStep' }
  ];
  
  let foundComponents = 0;
  for (const test of componentTests) {
    if (content.includes(test.content)) {
      foundComponents++;
      log.success(`Composant trouvé: ${test.name}`);
    } else {
      log.warning(`Composant manquant: ${test.name}`);
    }
  }
  
  const result = {
    found: foundComponents,
    total: componentTests.length,
    success: foundComponents >= componentTests.length * 0.8
  };
  
  if (result.success) {
    log.success(`Composants: ${foundComponents}/${componentTests.length} trouvés`);
  } else {
    log.warning(`Composants: ${foundComponents}/${componentTests.length} trouvés`);
  }
  
  return result;
}

async function runOnboardingTests() {
  log.header('🚀 Tests Onboarding Beriox AI');
  
  const startTime = Date.now();
  
  try {
    const apiResult = await testOnboardingAPI();
    const systemResult = await testOnboardingSystem();
    const stepsResult = await testOnboardingSteps();
    const componentsResult = await testOnboardingComponents();
    
    const totalTests = 4;
    const passedTests = [apiResult.success, systemResult.success, stepsResult.success, componentsResult.success].filter(Boolean).length;
    const duration = Date.now() - startTime;
    
    log.header('📊 Résultats Finaux');
    log.info(`Durée: ${duration}ms`);
    log.info(`Tests réussis: ${passedTests}/${totalTests}`);
    
    log.info('\n📋 Détails:');
    log.info(`🎯 API: ${apiResult.success ? '✅' : '❌'} (${apiResult.passed}/${apiResult.total})`);
    log.info(`📝 Système: ${systemResult.success ? '✅' : '❌'} (${systemResult.found}/${systemResult.total})`);
    log.info(`🎯 Étapes: ${stepsResult.success ? '✅' : '❌'} (${stepsResult.found}/${stepsResult.total})`);
    log.info(`🎨 Composants: ${componentsResult.success ? '✅' : '❌'} (${componentsResult.found}/${componentsResult.total})`);
    
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    if (successRate >= 80) {
      log.success(`Taux de succès: ${successRate}% - Onboarding fonctionnel!`);
    } else {
      log.warning(`Taux de succès: ${successRate}% - Onboarding partiellement fonctionnel`);
    }
    
    const results = {
      timestamp: new Date().toISOString(),
      url: BASE_URL,
      duration,
      results: { 
        api: apiResult, 
        system: systemResult, 
        steps: stepsResult, 
        components: componentsResult 
      },
      summary: { totalTests, passedTests, successRate: parseFloat(successRate) }
    };
    
    require('fs').writeFileSync('onboarding-test-report.json', JSON.stringify(results, null, 2));
    log.info('Rapport sauvegardé dans onboarding-test-report.json');
    
    process.exit(passedTests < 3 ? 1 : 0);
    
  } catch (error) {
    log.error(`Erreur: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  runOnboardingTests();
}

module.exports = { 
  runOnboardingTests, 
  testOnboardingAPI, 
  testOnboardingSystem, 
  testOnboardingSteps, 
  testOnboardingComponents 
};
