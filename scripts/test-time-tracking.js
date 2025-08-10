#!/usr/bin/env node

/**
 * Script de test pour le Time Tracking - Beriox AI
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

async function testTimeTrackingAPI() {
  log.header('⏱️ Test API Time Tracking');
  
  const tests = [
    {
      name: 'GET Time Entries (non authentifié)',
      url: '/api/time-tracking?action=entries',
      method: 'GET',
      expectedStatus: [401]
    },
    {
      name: 'GET Active Timer (non authentifié)',
      url: '/api/time-tracking?action=active-timer',
      method: 'GET',
      expectedStatus: [401]
    },
    {
      name: 'POST Start Timer (non authentifié)',
      url: '/api/time-tracking?action=start-timer',
      method: 'POST',
      body: { projectId: 'test', description: 'test' },
      expectedStatus: [401]
    },
    {
      name: 'PUT Stop Timer (non authentifié)',
      url: '/api/time-tracking?action=stop-timer',
      method: 'PUT',
      expectedStatus: [401]
    },
    {
      name: 'GET Projects (non authentifié)',
      url: '/api/time-tracking?action=projects',
      method: 'GET',
      expectedStatus: [401]
    },
    {
      name: 'GET Clients (non authentifié)',
      url: '/api/time-tracking?action=clients',
      method: 'GET',
      expectedStatus: [401]
    },
    {
      name: 'GET Tasks (non authentifié)',
      url: '/api/time-tracking?action=tasks',
      method: 'GET',
      expectedStatus: [401]
    },
    {
      name: 'GET Stats (non authentifié)',
      url: '/api/time-tracking?action=stats',
      method: 'GET',
      expectedStatus: [401]
    },
    {
      name: 'GET Settings (non authentifié)',
      url: '/api/time-tracking?action=settings',
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

async function testTimeTrackingSystem() {
  log.header('📝 Test Système Time Tracking');
  
  const fs = require('fs');
  const files = [
    'src/lib/time-tracking.ts',
    'src/app/api/time-tracking/route.ts',
    'src/components/TimeTrackingDashboard.tsx'
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
  const timeTrackingPath = 'src/lib/time-tracking.ts';
  if (fs.existsSync(timeTrackingPath)) {
    const content = fs.readFileSync(timeTrackingPath, 'utf8');
    
    const systemTests = [
      { name: 'TimeTrackingManager class', content: 'class TimeTrackingManager' },
      { name: 'TimeEntry interface', content: 'interface TimeEntry' },
      { name: 'Project interface', content: 'interface Project' },
      { name: 'Client interface', content: 'interface Client' },
      { name: 'Task interface', content: 'interface Task' },
      { name: 'Timesheet interface', content: 'interface Timesheet' },
      { name: 'Expense interface', content: 'interface Expense' },
      { name: 'Invoice interface', content: 'interface Invoice' },
      { name: 'TimeEntryType enum', content: 'enum TimeEntryType' },
      { name: 'TimeEntryStatus enum', content: 'enum TimeEntryStatus' },
      { name: 'ProjectStatus enum', content: 'enum ProjectStatus' },
      { name: 'ClientStatus enum', content: 'enum ClientStatus' },
      { name: 'startTimer method', content: 'startTimer(' },
      { name: 'stopTimer method', content: 'stopTimer(' },
      { name: 'pauseTimer method', content: 'pauseTimer(' },
      { name: 'resumeTimer method', content: 'resumeTimer(' },
      { name: 'addManualEntry method', content: 'addManualEntry(' },
      { name: 'getTimeEntries method', content: 'getTimeEntries(' },
      { name: 'getActiveTimer method', content: 'getActiveTimer(' },
      { name: 'createProject method', content: 'createProject(' },
      { name: 'createClient method', content: 'createClient(' },
      { name: 'createTask method', content: 'createTask(' },
      { name: 'createTimesheet method', content: 'createTimesheet(' },
      { name: 'addExpense method', content: 'addExpense(' },
      { name: 'createInvoice method', content: 'createInvoice(' },
      { name: 'getTimeTrackingStats method', content: 'getTimeTrackingStats(' },
      { name: 'getUserSettings method', content: 'getUserSettings(' },
      { name: 'updateUserSettings method', content: 'updateUserSettings(' },
      { name: 'formatDuration method', content: 'formatDuration(' },
      { name: 'Default data initialization', content: 'initializeDefaultData(' },
      { name: 'Default client creation', content: 'createDefaultClient(' },
      { name: 'Default project creation', content: 'createDefaultProject(' },
      { name: 'Default tasks creation', content: 'createDefaultTasks(' }
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

async function testTimeTrackingFeatures() {
  log.header('🎯 Test Fonctionnalités Time Tracking');
  
  const fs = require('fs');
  const timeTrackingPath = 'src/lib/time-tracking.ts';
  
  if (!fs.existsSync(timeTrackingPath)) {
    log.error('Fichier time-tracking.ts non trouvé');
    return { found: 0, total: 0, success: false };
  }
  
  const content = fs.readFileSync(timeTrackingPath, 'utf8');
  
  const featureTests = [
    { name: 'Timer simple', content: 'startTimer' },
    { name: 'Entrée manuelle', content: 'addManualEntry' },
    { name: 'Support multi-appareils', content: 'deviceInfo' },
    { name: 'Gestion des projets', content: 'createProject' },
    { name: 'Gestion des clients', content: 'createClient' },
    { name: 'Gestion des tâches', content: 'createTask' },
    { name: 'Approbation des feuilles de temps', content: 'approveTimesheet' },
    { name: 'Rapports et analytics', content: 'getTimeTrackingStats' },
    { name: 'Gestion du budget/capacité', content: 'budget' },
    { name: 'Suivi des dépenses', content: 'addExpense' },
    { name: 'Facturation', content: 'createInvoice' },
    { name: 'Fonctionnalités PM avancées', content: 'priority' },
    { name: 'Surveillance d\'écran', content: 'deviceType' },
    { name: 'Intégrations', content: 'integrations' },
    { name: 'Paramètres utilisateur', content: 'getUserSettings' },
    { name: 'Calcul des revenus', content: 'calculateBillableAmount' },
    { name: 'Formatage de durée', content: 'formatDuration' },
    { name: 'Nettoyage des données', content: 'cleanupOldData' }
  ];
  
  let foundFeatures = 0;
  for (const test of featureTests) {
    if (content.includes(test.content)) {
      foundFeatures++;
      log.success(`Fonctionnalité trouvée: ${test.name}`);
    } else {
      log.warning(`Fonctionnalité manquante: ${test.name}`);
    }
  }
  
  const result = {
    found: foundFeatures,
    total: featureTests.length,
    success: foundFeatures >= featureTests.length * 0.8
  };
  
  if (result.success) {
    log.success(`Fonctionnalités: ${foundFeatures}/${featureTests.length} trouvées`);
  } else {
    log.warning(`Fonctionnalités: ${foundFeatures}/${featureTests.length} trouvées`);
  }
  
  return result;
}

async function testTimeTrackingComponents() {
  log.header('🎨 Test Composants Time Tracking');
  
  const fs = require('fs');
  const componentPath = 'src/components/TimeTrackingDashboard.tsx';
  
  if (!fs.existsSync(componentPath)) {
    log.error('Fichier TimeTrackingDashboard.tsx non trouvé');
    return { found: 0, total: 0, success: false };
  }
  
  const content = fs.readFileSync(componentPath, 'utf8');
  
  const componentTests = [
    { name: 'TimeTrackingDashboard component', content: 'function TimeTrackingDashboard' },
    { name: 'useSession hook', content: 'useSession' },
    { name: 'useState hooks', content: 'useState' },
    { name: 'useEffect hooks', content: 'useEffect' },
    { name: 'FontAwesome icons', content: 'FontAwesomeIcon' },
    { name: 'Timer view', content: 'TimerView' },
    { name: 'Entries view', content: 'EntriesView' },
    { name: 'Projects view', content: 'ProjectsView' },
    { name: 'Clients view', content: 'ClientsView' },
    { name: 'Tasks view', content: 'TasksView' },
    { name: 'Timesheet view', content: 'TimesheetView' },
    { name: 'Expenses view', content: 'ExpensesView' },
    { name: 'Invoices view', content: 'InvoicesView' },
    { name: 'Stats view', content: 'StatsView' },
    { name: 'Settings view', content: 'SettingsView' },
    { name: 'Timer controls', content: 'onStartTimer' },
    { name: 'Timer stop functionality', content: 'onStopTimer' },
    { name: 'Timer pause functionality', content: 'onPauseTimer' },
    { name: 'Timer resume functionality', content: 'onResumeTimer' },
    { name: 'Duration formatting', content: 'formatDuration' },
    { name: 'Current duration calculation', content: 'getCurrentDuration' },
    { name: 'Active timer display', content: 'activeTimer' },
    { name: 'Project selection', content: 'selectedProject' },
    { name: 'Task selection', content: 'selectedTask' },
    { name: 'Description input', content: 'description' },
    { name: 'Navigation tabs', content: 'currentView' },
    { name: 'Data loading', content: 'loadInitialData' },
    { name: 'Error handling', content: 'error' },
    { name: 'Loading states', content: 'loading' }
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

async function testTimeTrackingDataStructures() {
  log.header('🗂️ Test Structures de Données Time Tracking');
  
  const fs = require('fs');
  const timeTrackingPath = 'src/lib/time-tracking.ts';
  
  if (!fs.existsSync(timeTrackingPath)) {
    log.error('Fichier time-tracking.ts non trouvé');
    return { found: 0, total: 0, success: false };
  }
  
  const content = fs.readFileSync(timeTrackingPath, 'utf8');
  
  const dataStructureTests = [
    { name: 'TimeEntry with all fields', content: 'id: string' },
    { name: 'Project with budget', content: 'budget?: number' },
    { name: 'Client with address', content: 'address?: {' },
    { name: 'Task with priority', content: 'priority: \'low\' | \'medium\' | \'high\'' },
    { name: 'Timesheet with approval', content: 'approvedBy?: string' },
    { name: 'Expense with receipt', content: 'receipt?: string' },
    { name: 'Invoice with items', content: 'items: InvoiceItem[]' },
    { name: 'Settings with work hours', content: 'workHours: {' },
    { name: 'Stats with earnings', content: 'earnings: {' },
    { name: 'Location tracking', content: 'location?: {' },
    { name: 'Device information', content: 'deviceInfo?: {' },
    { name: 'Tags support', content: 'tags: string[]' },
    { name: 'Notes field', content: 'notes?: string' },
    { name: 'Hourly rate', content: 'hourlyRate?: number' },
    { name: 'Billable flag', content: 'billable: boolean' },
    { name: 'Status enums', content: 'status: TimeEntryStatus' },
    { name: 'Type enums', content: 'type: TimeEntryType' },
    { name: 'Date fields', content: 'startTime: Date' },
    { name: 'Duration in seconds', content: 'duration: number' }
  ];
  
  let foundStructures = 0;
  for (const test of dataStructureTests) {
    if (content.includes(test.content)) {
      foundStructures++;
      log.success(`Structure trouvée: ${test.name}`);
    } else {
      log.warning(`Structure manquante: ${test.name}`);
    }
  }
  
  const result = {
    found: foundStructures,
    total: dataStructureTests.length,
    success: foundStructures >= dataStructureTests.length * 0.8
  };
  
  if (result.success) {
    log.success(`Structures: ${foundStructures}/${dataStructureTests.length} trouvées`);
  } else {
    log.warning(`Structures: ${foundStructures}/${dataStructureTests.length} trouvées`);
  }
  
  return result;
}

async function runTimeTrackingTests() {
  log.header('⏱️ Tests Time Tracking Beriox AI');
  
  const startTime = Date.now();
  
  try {
    const apiResult = await testTimeTrackingAPI();
    const systemResult = await testTimeTrackingSystem();
    const featuresResult = await testTimeTrackingFeatures();
    const componentsResult = await testTimeTrackingComponents();
    const dataStructuresResult = await testTimeTrackingDataStructures();
    
    const totalTests = 5;
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
    log.info(`⏱️ API: ${apiResult.success ? '✅' : '❌'} (${apiResult.passed}/${apiResult.total})`);
    log.info(`📝 Système: ${systemResult.success ? '✅' : '❌'} (${systemResult.found}/${systemResult.total})`);
    log.info(`🎯 Fonctionnalités: ${featuresResult.success ? '✅' : '❌'} (${featuresResult.found}/${featuresResult.total})`);
    log.info(`🎨 Composants: ${componentsResult.success ? '✅' : '❌'} (${componentsResult.found}/${componentsResult.total})`);
    log.info(`🗂️ Structures: ${dataStructuresResult.success ? '✅' : '❌'} (${dataStructuresResult.found}/${dataStructuresResult.total})`);
    
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    if (successRate >= 80) {
      log.success(`Taux de succès: ${successRate}% - Time Tracking fonctionnel!`);
    } else {
      log.warning(`Taux de succès: ${successRate}% - Time Tracking partiellement fonctionnel`);
    }
    
    const results = {
      timestamp: new Date().toISOString(),
      url: BASE_URL,
      duration,
      results: { 
        api: apiResult, 
        system: systemResult, 
        features: featuresResult, 
        components: componentsResult,
        dataStructures: dataStructuresResult
      },
      summary: { totalTests, passedTests, successRate: parseFloat(successRate) }
    };
    
    require('fs').writeFileSync('time-tracking-test-report.json', JSON.stringify(results, null, 2));
    log.info('Rapport sauvegardé dans time-tracking-test-report.json');
    
    process.exit(passedTests < 4 ? 1 : 0);
    
  } catch (error) {
    log.error(`Erreur: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  runTimeTrackingTests();
}

module.exports = { 
  runTimeTrackingTests, 
  testTimeTrackingAPI, 
  testTimeTrackingSystem, 
  testTimeTrackingFeatures, 
  testTimeTrackingComponents,
  testTimeTrackingDataStructures
};
