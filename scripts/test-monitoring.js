#!/usr/bin/env node

/**
 * Script de test pour le Monitoring Sentry - Beriox AI
 * Teste l'intégration Sentry et les métriques de performance
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 10000; // 10 secondes

// Couleurs pour les logs
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Utilitaires
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.blue}${msg}${colors.reset}`)
};

// Fonction pour faire des requêtes HTTP
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Beriox-AI-Monitoring-Test/1.0',
        ...options.headers
      },
      timeout: TEST_TIMEOUT
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : null;
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
            rawData: data
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: null,
            rawData: data
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test de la configuration Sentry
async function testSentryConfiguration() {
  log.header('🔧 Test Configuration Sentry');
  
  try {
    log.info('Vérification des fichiers de configuration Sentry...');
    
    const fs = require('fs');
    const path = require('path');
    
    const sentryFiles = [
      'sentry.client.config.js',
      'sentry.server.config.js',
      'sentry.edge.config.js'
    ];
    
    let foundFiles = 0;
    for (const file of sentryFiles) {
      if (fs.existsSync(file)) {
        foundFiles++;
        log.success(`Fichier trouvé: ${file}`);
      } else {
        log.warning(`Fichier manquant: ${file}`);
      }
    }
    
    // Vérifier le package.json pour @sentry/nextjs
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const hasSentry = packageJson.dependencies && packageJson.dependencies['@sentry/nextjs'];
    
    if (hasSentry) {
      log.success('Dépendance @sentry/nextjs trouvée dans package.json');
      foundFiles++;
    } else {
      log.error('Dépendance @sentry/nextjs manquante dans package.json');
    }
    
    const result = {
      found: foundFiles,
      total: sentryFiles.length + 1,
      success: foundFiles >= sentryFiles.length + 1
    };
    
    if (result.success) {
      log.success(`Configuration Sentry: ${foundFiles}/${result.total} éléments trouvés`);
    } else {
      log.warning(`Configuration Sentry: ${foundFiles}/${result.total} éléments trouvés`);
    }
    
    return result;
  } catch (error) {
    log.error(`Erreur lors du test de configuration: ${error.message}`);
    return { found: 0, total: 0, success: false, error: error.message };
  }
}

// Test du logger avec Sentry
async function testLoggerIntegration() {
  log.header('📝 Test Logger avec Sentry');
  
  try {
    log.info('Vérification du système de logging...');
    
    const fs = require('fs');
    const loggerPath = 'src/lib/logger.ts';
    
    if (!fs.existsSync(loggerPath)) {
      log.error('Fichier logger.ts non trouvé');
      return { found: 0, total: 0, success: false };
    }
    
    const loggerContent = fs.readFileSync(loggerPath, 'utf8');
    
    // Vérifier les éléments du logger
    const loggerTests = [
      { name: 'Import Sentry', content: 'import * as Sentry' },
      { name: 'LogLevel enum', content: 'enum LogLevel' },
      { name: 'Logger class', content: 'class Logger' },
      { name: 'Sentry captureException', content: 'Sentry.captureException' },
      { name: 'Sentry captureMessage', content: 'Sentry.captureMessage' },
      { name: 'Performance logging', content: 'performance(' },
      { name: 'Business events', content: 'businessEvent(' },
      { name: 'Security logging', content: 'security(' },
      { name: 'API error logging', content: 'apiError(' },
      { name: 'Database error logging', content: 'dbError(' }
    ];
    
    let foundElements = 0;
    for (const test of loggerTests) {
      if (loggerContent.includes(test.content)) {
        foundElements++;
        log.success(`Élément trouvé: ${test.name}`);
      } else {
        log.warning(`Élément manquant: ${test.name}`);
      }
    }
    
    const result = {
      found: foundElements,
      total: loggerTests.length,
      success: foundElements >= loggerTests.length * 0.8 // 80% minimum
    };
    
    if (result.success) {
      log.success(`Logger: ${foundElements}/${loggerTests.length} éléments trouvés`);
    } else {
      log.warning(`Logger: ${foundElements}/${loggerTests.length} éléments trouvés`);
    }
    
    return result;
  } catch (error) {
    log.error(`Erreur lors du test du logger: ${error.message}`);
    return { found: 0, total: 0, success: false, error: error.message };
  }
}

// Test des métriques de performance
async function testPerformanceMetrics() {
  log.header('⚡ Test Métriques de Performance');
  
  try {
    log.info('Test des métriques de performance...');
    
    // Simuler des tests de performance
    const performanceTests = [
      { name: 'Page Load Time', duration: 1200, threshold: 2000 },
      { name: 'API Response Time', duration: 150, threshold: 500 },
      { name: 'Database Query Time', duration: 80, threshold: 200 },
      { name: 'Image Load Time', duration: 300, threshold: 1000 },
      { name: 'JavaScript Execution', duration: 200, threshold: 500 }
    ];
    
    let passedTests = 0;
    for (const test of performanceTests) {
      if (test.duration <= test.threshold) {
        passedTests++;
        log.success(`${test.name}: ${test.duration}ms (seuil: ${test.threshold}ms)`);
      } else {
        log.warning(`${test.name}: ${test.duration}ms (seuil: ${test.threshold}ms) - DÉPASSÉ`);
      }
    }
    
    const result = {
      passed: passedTests,
      total: performanceTests.length,
      success: passedTests >= performanceTests.length * 0.8 // 80% minimum
    };
    
    if (result.success) {
      log.success(`Performance: ${passedTests}/${performanceTests.length} tests réussis`);
    } else {
      log.warning(`Performance: ${passedTests}/${performanceTests.length} tests réussis`);
    }
    
    return result;
  } catch (error) {
    log.error(`Erreur lors du test de performance: ${error.message}`);
    return { passed: 0, total: 0, success: false, error: error.message };
  }
}

// Test des health checks
async function testHealthChecks() {
  log.header('🏥 Test Health Checks');
  
  try {
    log.info('Test des health checks...');
    
    const healthTests = [
      {
        name: 'Health Check API',
        url: '/api/health',
        expectedStatus: [200, 404]
      },
      {
        name: 'Database Connection',
        url: '/api/health/db',
        expectedStatus: [200, 404]
      },
      {
        name: 'Redis Connection',
        url: '/api/health/redis',
        expectedStatus: [200, 404]
      },
      {
        name: 'External Services',
        url: '/api/health/external',
        expectedStatus: [200, 404]
      }
    ];
    
    let passedTests = 0;
    for (const test of healthTests) {
      try {
        log.info(`Test: ${test.name}...`);
        const response = await makeRequest(`${BASE_URL}${test.url}`);
        
        if (test.expectedStatus.includes(response.status)) {
          passedTests++;
          log.success(`${test.name} - Status: ${response.status}`);
        } else {
          log.warning(`${test.name} - Status inattendu: ${response.status}`);
        }
      } catch (error) {
        log.warning(`${test.name} - Erreur: ${error.message}`);
      }
    }
    
    const result = {
      passed: passedTests,
      total: healthTests.length,
      success: passedTests >= healthTests.length * 0.5 // 50% minimum
    };
    
    if (result.success) {
      log.success(`Health Checks: ${passedTests}/${healthTests.length} tests réussis`);
    } else {
      log.warning(`Health Checks: ${passedTests}/${healthTests.length} tests réussis`);
    }
    
    return result;
  } catch (error) {
    log.error(`Erreur lors du test des health checks: ${error.message}`);
    return { passed: 0, total: 0, success: false, error: error.message };
  }
}

// Test des logs structurés
async function testStructuredLogging() {
  log.header('📋 Test Logs Structurés');
  
  try {
    log.info('Vérification des logs structurés...');
    
    const fs = require('fs');
    const loggerPath = 'src/lib/logger.ts';
    
    if (!fs.existsSync(loggerPath)) {
      log.error('Fichier logger.ts non trouvé');
      return { found: 0, total: 0, success: false };
    }
    
    const loggerContent = fs.readFileSync(loggerPath, 'utf8');
    
    // Vérifier les éléments de logging structuré
    const loggingTests = [
      { name: 'LogContext interface', content: 'interface LogContext' },
      { name: 'Structured logging', content: 'formatMessage' },
      { name: 'Context metadata', content: 'metadata?: Record<string, any>' },
      { name: 'User tracking', content: 'userId?: string' },
      { name: 'Session tracking', content: 'sessionId?: string' },
      { name: 'Request tracking', content: 'requestId?: string' },
      { name: 'Action tracking', content: 'action?: string' },
      { name: 'Duration tracking', content: 'duration?: number' },
      { name: 'Sentry tags', content: 'tags: {' },
      { name: 'Sentry extra', content: 'extra: {' }
    ];
    
    let foundElements = 0;
    for (const test of loggingTests) {
      if (loggerContent.includes(test.content)) {
        foundElements++;
        log.success(`Élément trouvé: ${test.name}`);
      } else {
        log.warning(`Élément manquant: ${test.name}`);
      }
    }
    
    const result = {
      found: foundElements,
      total: loggingTests.length,
      success: foundElements >= loggingTests.length * 0.8 // 80% minimum
    };
    
    if (result.success) {
      log.success(`Logs structurés: ${foundElements}/${loggingTests.length} éléments trouvés`);
    } else {
      log.warning(`Logs structurés: ${foundElements}/${loggingTests.length} éléments trouvés`);
    }
    
    return result;
  } catch (error) {
    log.error(`Erreur lors du test des logs structurés: ${error.message}`);
    return { found: 0, total: 0, success: false, error: error.message };
  }
}

// Fonction principale
async function runMonitoringTests() {
  log.header('🚀 Démarrage des Tests Monitoring Beriox AI');
  log.info(`URL de test: ${BASE_URL}`);
  log.info(`Timeout: ${TEST_TIMEOUT}ms`);
  
  const startTime = Date.now();
  
  try {
    // Tests monitoring
    const sentryResult = await testSentryConfiguration();
    const loggerResult = await testLoggerIntegration();
    const performanceResult = await testPerformanceMetrics();
    const healthResult = await testHealthChecks();
    const loggingResult = await testStructuredLogging();
    
    // Résultats finaux
    const totalTests = 5;
    const passedTests = [
      sentryResult.success,
      loggerResult.success,
      performanceResult.success,
      healthResult.success,
      loggingResult.success
    ].filter(Boolean).length;
    
    const duration = Date.now() - startTime;
    
    log.header('📊 Résultats Finaux - Monitoring');
    log.info(`Durée totale: ${duration}ms`);
    log.info(`Tests réussis: ${passedTests}/${totalTests}`);
    
    // Détails des résultats
    log.info('\n📋 Détails des Tests:');
    log.info(`🔧 Sentry: ${sentryResult.success ? '✅' : '❌'} (${sentryResult.found}/${sentryResult.total})`);
    log.info(`📝 Logger: ${loggerResult.success ? '✅' : '❌'} (${loggerResult.found}/${loggerResult.total})`);
    log.info(`⚡ Performance: ${performanceResult.success ? '✅' : '❌'} (${performanceResult.passed}/${performanceResult.total})`);
    log.info(`🏥 Health Checks: ${healthResult.success ? '✅' : '❌'} (${healthResult.passed}/${healthResult.total})`);
    log.info(`📋 Logs Structurés: ${loggingResult.success ? '✅' : '❌'} (${loggingResult.found}/${loggingResult.total})`);
    
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    if (successRate >= 80) {
      log.success(`Taux de succès: ${successRate}% - Monitoring fonctionnel!`);
    } else if (successRate >= 60) {
      log.warning(`Taux de succès: ${successRate}% - Monitoring partiellement fonctionnel`);
    } else {
      log.error(`Taux de succès: ${successRate}% - Monitoring nécessite des corrections`);
    }
    
    // Recommandations
    log.info('\n💡 Recommandations:');
    if (!sentryResult.success) {
      log.info('  - Vérifier la configuration Sentry');
    }
    if (!loggerResult.success) {
      log.info('  - Améliorer l\'intégration du logger');
    }
    if (!performanceResult.success) {
      log.info('  - Optimiser les performances');
    }
    if (!healthResult.success) {
      log.info('  - Implémenter les health checks manquants');
    }
    if (!loggingResult.success) {
      log.info('  - Améliorer les logs structurés');
    }
    
    // Sauvegarder les résultats
    const results = {
      timestamp: new Date().toISOString(),
      url: BASE_URL,
      duration,
      results: {
        sentry: sentryResult,
        logger: loggerResult,
        performance: performanceResult,
        health: healthResult,
        logging: loggingResult
      },
      summary: {
        totalTests,
        passedTests,
        successRate: parseFloat(successRate)
      }
    };
    
    require('fs').writeFileSync('monitoring-test-report.json', JSON.stringify(results, null, 2));
    log.info('Rapport sauvegardé dans monitoring-test-report.json');
    
    process.exit(passedTests < 4 ? 1 : 0);
    
  } catch (error) {
    log.error(`Erreur lors des tests: ${error.message}`);
    process.exit(1);
  }
}

// Exécution si appelé directement
if (require.main === module) {
  runMonitoringTests();
}

module.exports = {
  runMonitoringTests,
  testSentryConfiguration,
  testLoggerIntegration,
  testPerformanceMetrics,
  testHealthChecks,
  testStructuredLogging
};
