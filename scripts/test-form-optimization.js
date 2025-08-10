#!/usr/bin/env node

/**
 * Script de test pour l'Optimisation des Formulaires - Beriox AI
 */

const https = require('https');
const http = require('http');
const fs = require('fs');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 10000;

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

const log = {
  header: (msg) => console.log(`\n${colors.cyan}${colors.bright}${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.magenta}🧪 ${msg}${colors.reset}`)
};

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      timeout: TEST_TIMEOUT,
      ...options
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testFormOptimizationAPI() {
  log.test('Test des endpoints API Form Optimization');
  
  const tests = [
    {
      name: 'GET forms (non authentifié)',
      url: `${BASE_URL}/api/form-optimization?action=forms`,
      method: 'GET',
      expectedStatus: 401
    },
    {
      name: 'POST start form (non authentifié)',
      url: `${BASE_URL}/api/form-optimization?action=start`,
      method: 'POST',
      body: JSON.stringify({ formId: 'contact-form' }),
      expectedStatus: 401
    },
    {
      name: 'PUT update form data (non authentifié)',
      url: `${BASE_URL}/api/form-optimization?action=update`,
      method: 'PUT',
      body: JSON.stringify({ sessionId: 'test', fieldId: 'name', value: 'test' }),
      expectedStatus: 401
    },
    {
      name: 'POST validate form (non authentifié)',
      url: `${BASE_URL}/api/form-optimization?action=validate`,
      method: 'POST',
      body: JSON.stringify({ sessionId: 'test' }),
      expectedStatus: 401
    },
    {
      name: 'POST submit form (non authentifié)',
      url: `${BASE_URL}/api/form-optimization?action=submit`,
      method: 'POST',
      body: JSON.stringify({ sessionId: 'test' }),
      expectedStatus: 401
    },
    {
      name: 'POST save draft (non authentifié)',
      url: `${BASE_URL}/api/form-optimization?action=save-draft`,
      method: 'POST',
      body: JSON.stringify({ sessionId: 'test' }),
      expectedStatus: 401
    },
    {
      name: 'POST abandon form (non authentifié)',
      url: `${BASE_URL}/api/form-optimization?action=abandon`,
      method: 'POST',
      body: JSON.stringify({ sessionId: 'test' }),
      expectedStatus: 401
    },
    {
      name: 'GET analytics (non authentifié)',
      url: `${BASE_URL}/api/form-optimization?action=analytics&formId=contact-form`,
      method: 'GET',
      expectedStatus: 401
    },
    {
      name: 'POST optimizations (non authentifié)',
      url: `${BASE_URL}/api/form-optimization?action=optimizations`,
      method: 'POST',
      body: JSON.stringify({ formId: 'contact-form' }),
      expectedStatus: 401
    }
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    try {
      const response = await makeRequest(test.url, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: test.body
      });

      if (response.status === test.expectedStatus) {
        log.success(`${test.name} - ${response.status}`);
        passed++;
      } else {
        log.error(`${test.name} - Expected ${test.expectedStatus}, got ${response.status}`);
      }
    } catch (error) {
      log.error(`${test.name} - Error: ${error.message}`);
    }
  }

  return { success: passed === total, passed, total };
}

async function testFormOptimizationSystem() {
  log.test('Test du système Form Optimization');
  
  const files = [
    'src/lib/form-optimization.ts',
    'src/app/api/form-optimization/route.ts',
    'src/components/FormOptimizer.tsx'
  ];

  const requiredClasses = [
    'FormOptimizer',
    'FormFieldType',
    'ValidationRule',
    'FormField',
    'FormConfig',
    'FormData',
    'FormAnalytics',
    'FormOptimization'
  ];

  const requiredMethods = [
    'addForm',
    'getForm',
    'startForm',
    'updateFormData',
    'validateForm',
    'submitForm',
    'saveDraft',
    'abandonForm',
    'getFormAnalytics',
    'generateOptimizations'
  ];

  let found = 0;
  let total = files.length + requiredClasses.length + requiredMethods.length;

  // Vérifier l'existence des fichiers
  for (const file of files) {
    if (fs.existsSync(file)) {
      log.success(`Fichier trouvé: ${file}`);
      found++;
    } else {
      log.error(`Fichier manquant: ${file}`);
    }
  }

  // Vérifier le contenu du fichier principal
  try {
    const formOptimizationContent = fs.readFileSync('src/lib/form-optimization.ts', 'utf8');
    
    // Vérifier les classes
    for (const className of requiredClasses) {
      if (formOptimizationContent.includes(className)) {
        log.success(`Classe trouvée: ${className}`);
        found++;
      } else {
        log.error(`Classe manquante: ${className}`);
      }
    }

    // Vérifier les méthodes
    for (const methodName of requiredMethods) {
      if (formOptimizationContent.includes(methodName)) {
        log.success(`Méthode trouvée: ${methodName}`);
        found++;
      } else {
        log.error(`Méthode manquante: ${methodName}`);
      }
    }
  } catch (error) {
    log.error(`Erreur lors de la lecture du fichier: ${error.message}`);
  }

  return { success: found === total, found, total };
}

async function testFormOptimizationFeatures() {
  log.test('Test des fonctionnalités Form Optimization');
  
  const features = [
    'Timer simple',
    'Saisie manuelle',
    'Multi-devices',
    'Mode hors-ligne',
    'Reminders',
    'Timesheet Approvals',
    'Activity Log',
    'Calendrier intégré',
    'Validation automatique',
    'Rapports visuels',
    'Rapports personnalisés',
    'Analytics avancés',
    'Export automatisé',
    'Suivi budgets',
    'Gestion capacité',
    'Alertes intelligentes',
    'Forecasting',
    'Suivi dépenses',
    'Dépenses facturables',
    'Multi-currency',
    'Upload reçus',
    'Création invoices',
    'Facturation intégrée',
    'Customisation invoices',
    'Suivi paiements',
    'Tableau de Gantt',
    'Kanban boards',
    'Roadmaps',
    'Dépendances',
    'Screenshots',
    'Surveillance écran',
    'Productivity tracking',
    'Idle detection',
    'UI épurée',
    'Responsive design',
    'Dark mode',
    'Accessibilité',
    'Calendriers',
    'Project management',
    'Accounting',
    'Communication',
    'Plan Basic',
    'Plan Professional',
    'Plan Enterprise',
    'Plan Custom'
  ];

  let found = 0;
  let total = features.length;

  try {
    const timeTrackingContent = fs.readFileSync('src/lib/time-tracking.ts', 'utf8');
    
    for (const feature of features) {
      if (timeTrackingContent.includes(feature)) {
        log.success(`Fonctionnalité trouvée: ${feature}`);
        found++;
      } else {
        log.error(`Fonctionnalité manquante: ${feature}`);
      }
    }
  } catch (error) {
    log.error(`Erreur lors de la lecture du fichier: ${error.message}`);
  }

  return { success: found >= total * 0.8, found, total };
}

async function testFormOptimizationComponents() {
  log.test('Test des composants Form Optimization');
  
  const requiredComponents = [
    'FormOptimizer',
    'useSession',
    'useState',
    'useEffect',
    'FontAwesomeIcon'
  ];

  const requiredUIElements = [
    'form-field',
    'active',
    'error',
    'progress',
    'analytics',
    'optimization',
    'suggestions',
    'aBTestVariants'
  ];

  let found = 0;
  let total = requiredComponents.length + requiredUIElements.length;

  try {
    const componentContent = fs.readFileSync('src/components/FormOptimizer.tsx', 'utf8');
    
    // Vérifier les composants React
    for (const component of requiredComponents) {
      if (componentContent.includes(component)) {
        log.success(`Composant trouvé: ${component}`);
        found++;
      } else {
        log.error(`Composant manquant: ${component}`);
      }
    }

    // Vérifier les éléments UI
    for (const element of requiredUIElements) {
      if (componentContent.includes(element)) {
        log.success(`Élément UI trouvé: ${element}`);
        found++;
      } else {
        log.error(`Élément UI manquant: ${element}`);
      }
    }
  } catch (error) {
    log.error(`Erreur lors de la lecture du fichier: ${error.message}`);
  }

  return { success: found >= total * 0.8, found, total };
}

async function testFormOptimizationDataStructures() {
  log.test('Test des structures de données Form Optimization');
  
  const requiredFields = [
    'id: string',
    'name: string',
    'type: FormFieldType',
    'label: string',
    'required?: boolean',
    'validation?: ValidationRule[]',
    'helpText?: string',
    'order: number',
    'fields: FormField[]',
    'autoSave?: boolean',
    'showProgress?: boolean',
    'allowDraft?: boolean',
    'sessionId: string',
    'data: Record<string, any>',
    'progress: number',
    'errors: Record<string, string[]>',
    'totalStarts: number',
    'totalCompletions: number',
    'completionRate: number',
    'abandonmentRate: number',
    'suggestions: Array<',
    'aBTestVariants: Array<',
    'priority: \'low\' | \'medium\' | \'high\'',
    'impact: number'
  ];

  let found = 0;
  let total = requiredFields.length;

  try {
    const formOptimizationContent = fs.readFileSync('src/lib/form-optimization.ts', 'utf8');
    
    for (const field of requiredFields) {
      if (formOptimizationContent.includes(field)) {
        log.success(`Champ trouvé: ${field}`);
        found++;
      } else {
        log.error(`Champ manquant: ${field}`);
      }
    }
  } catch (error) {
    log.error(`Erreur lors de la lecture du fichier: ${error.message}`);
  }

  return { success: found >= total * 0.8, found, total };
}

async function runFormOptimizationTests() {
  log.header('🎨 Tests Form Optimization Beriox AI');
  const startTime = Date.now();
  
  try {
    const apiResult = await testFormOptimizationAPI();
    const systemResult = await testFormOptimizationSystem();
    const featuresResult = await testFormOptimizationFeatures();
    const componentsResult = await testFormOptimizationComponents();
    const dataStructuresResult = await testFormOptimizationDataStructures();

    const totalTests = 5; // API, System, Features, Components, Data Structures
    const passedTests = [
      apiResult.success,
      systemResult.success,
      featuresResult.success,
      componentsResult.success,
      dataStructuresResult.success
    ].filter(Boolean).length;

    const duration = Date.now() - startTime;

    log.header('📊 Résultats Finaux');
    log.info(`Durée: ${duration}ms`);
    log.info(`Tests réussis: ${passedTests}/${totalTests}`);

    log.info('\n📋 Détails:');
    log.info(`🎨 API: ${apiResult.success ? '✅' : '❌'} (${apiResult.passed}/${apiResult.total})`);
    log.info(`📝 Système: ${systemResult.success ? '✅' : '❌'} (${systemResult.found}/${systemResult.total})`);
    log.info(`🎯 Fonctionnalités: ${featuresResult.success ? '✅' : '❌'} (${featuresResult.found}/${featuresResult.total})`);
    log.info(`🎨 Composants: ${componentsResult.success ? '✅' : '❌'} (${componentsResult.found}/${componentsResult.total})`);
    log.info(`🗂️ Structures: ${dataStructuresResult.success ? '✅' : '❌'} (${dataStructuresResult.found}/${dataStructuresResult.total})`);

    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    if (successRate >= 80) {
      log.success(`Taux de succès: ${successRate}% - Form Optimization fonctionnel!`);
    } else {
      log.warning(`Taux de succès: ${successRate}% - Form Optimization partiellement fonctionnel`);
    }

    const results = {
      timestamp: new Date().toISOString(),
      duration: duration,
      totalTests: totalTests,
      passedTests: passedTests,
      successRate: parseFloat(successRate),
      details: {
        api: {
          success: apiResult.success,
          passed: apiResult.passed,
          total: apiResult.total
        },
        system: {
          success: systemResult.success,
          found: systemResult.found,
          total: systemResult.total
        },
        features: {
          success: featuresResult.success,
          found: featuresResult.found,
          total: featuresResult.total
        },
        components: {
          success: componentsResult.success,
          found: componentsResult.found,
          total: componentsResult.total
        },
        dataStructures: {
          success: dataStructuresResult.success,
          found: dataStructuresResult.found,
          total: dataStructuresResult.total
        }
      }
    };

    fs.writeFileSync('form-optimization-test-report.json', JSON.stringify(results, null, 2));
    log.info('Rapport sauvegardé dans form-optimization-test-report.json');

    process.exit(passedTests < 4 ? 1 : 0);

  } catch (error) {
    log.error(`Erreur: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  runFormOptimizationTests();
}

module.exports = {
  runFormOptimizationTests,
  testFormOptimizationAPI,
  testFormOptimizationSystem,
  testFormOptimizationFeatures,
  testFormOptimizationComponents,
  testFormOptimizationDataStructures
};
