#!/usr/bin/env node

/**
 * Script de test automatisé pour les formulaires Beriox AI
 * Teste la validation, soumission et gestion d'erreurs
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
        'User-Agent': 'Beriox-AI-Test-Suite/1.0',
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

// Tests de validation des formulaires
async function testFormValidation() {
  log.header('🧪 Tests de Validation des Formulaires');
  
  const tests = [
    {
      name: 'Création de Mission - Validation Email',
      url: `${BASE_URL}/api/missions`,
      method: 'POST',
      body: {
        title: 'Test Mission',
        objective: 'Test objective',
        email: 'invalid-email',
        context: 'Test context'
      },
      expectedStatus: 400,
      description: 'Doit rejeter un email invalide'
    },
    {
      name: 'Création de Mission - Champs Requis',
      url: `${BASE_URL}/api/missions`,
      method: 'POST',
      body: {
        title: '',
        objective: '',
        email: 'test@example.com'
      },
      expectedStatus: 400,
      description: 'Doit rejeter des champs vides'
    },
    {
      name: 'Profil Utilisateur - Validation',
      url: `${BASE_URL}/api/user/profile`,
      method: 'PUT',
      body: {
        name: 'A'.repeat(1000), // Nom trop long
        email: 'invalid-email'
      },
      expectedStatus: 400,
      description: 'Doit rejeter des données invalides'
    },
    {
      name: 'Demande Remboursement - Validation',
      url: `${BASE_URL}/api/refunds/request`,
      method: 'POST',
      body: {
        reason: '',
        amount: -100,
        missionId: 'invalid-id'
      },
      expectedStatus: 400,
      description: 'Doit rejeter des données invalides'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      log.info(`Test: ${test.name}`);
      const response = await makeRequest(test.url, {
        method: test.method,
        body: test.body
      });

      if (response.status === test.expectedStatus) {
        log.success(`${test.name} - ${test.description}`);
        passed++;
      } else {
        log.error(`${test.name} - Attendu ${test.expectedStatus}, reçu ${response.status}`);
        failed++;
      }
    } catch (error) {
      log.error(`${test.name} - Erreur: ${error.message}`);
      failed++;
    }
  }

  return { passed, failed, total: tests.length };
}

// Tests de soumission des formulaires
async function testFormSubmission() {
  log.header('📝 Tests de Soumission des Formulaires');
  
  const tests = [
    {
      name: 'Création de Mission - Données Valides',
      url: `${BASE_URL}/api/missions`,
      method: 'POST',
      body: {
        title: 'Test Mission Valid',
        objective: 'Test objective valid',
        email: 'test@example.com',
        context: 'Test context valid'
      },
      expectedStatus: [200, 201, 401], // 401 si pas authentifié
      description: 'Doit accepter des données valides'
    },
    {
      name: 'Profil Utilisateur - Mise à Jour',
      url: `${BASE_URL}/api/user/profile`,
      method: 'PUT',
      body: {
        name: 'Test User',
        email: 'test@example.com',
        company: 'Test Company'
      },
      expectedStatus: [200, 401], // 401 si pas authentifié
      description: 'Doit permettre la mise à jour du profil'
    },
    {
      name: 'Demande Remboursement - Soumission',
      url: `${BASE_URL}/api/refunds/request`,
      method: 'POST',
      body: {
        reason: 'Test reason',
        amount: 50,
        missionId: 'test-mission-id',
        description: 'Test description'
      },
      expectedStatus: [200, 201, 401], // 401 si pas authentifié
      description: 'Doit permettre la soumission de demande'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      log.info(`Test: ${test.name}`);
      const response = await makeRequest(test.url, {
        method: test.method,
        body: test.body
      });

      if (test.expectedStatus.includes(response.status)) {
        log.success(`${test.name} - ${test.description}`);
        passed++;
      } else {
        log.error(`${test.name} - Attendu ${test.expectedStatus.join(' ou ')}, reçu ${response.status}`);
        failed++;
      }
    } catch (error) {
      log.error(`${test.name} - Erreur: ${error.message}`);
      failed++;
    }
  }

  return { passed, failed, total: tests.length };
}

// Tests de gestion d'erreurs
async function testErrorHandling() {
  log.header('⚠️ Tests de Gestion d\'Erreurs');
  
  const tests = [
    {
      name: 'Endpoint Inexistant',
      url: `${BASE_URL}/api/nonexistent`,
      method: 'GET',
      expectedStatus: 404,
      description: 'Doit retourner 404 pour endpoint inexistant'
    },
    {
      name: 'Méthode HTTP Non Supportée',
      url: `${BASE_URL}/api/missions`,
      method: 'DELETE',
      expectedStatus: 405,
      description: 'Doit retourner 405 pour méthode non supportée'
    },
    {
      name: 'Données JSON Invalides',
      url: `${BASE_URL}/api/missions`,
      method: 'POST',
      body: 'invalid-json',
      headers: { 'Content-Type': 'application/json' },
      expectedStatus: 400,
      description: 'Doit gérer les données JSON invalides'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      log.info(`Test: ${test.name}`);
      const response = await makeRequest(test.url, {
        method: test.method,
        body: test.body,
        headers: test.headers
      });

      if (response.status === test.expectedStatus) {
        log.success(`${test.name} - ${test.description}`);
        passed++;
      } else {
        log.error(`${test.name} - Attendu ${test.expectedStatus}, reçu ${response.status}`);
        failed++;
      }
    } catch (error) {
      log.error(`${test.name} - Erreur: ${error.message}`);
      failed++;
    }
  }

  return { passed, failed, total: tests.length };
}

// Tests de sécurité CSRF
async function testCSRFSecurity() {
  log.header('🔒 Tests de Sécurité CSRF');
  
  const tests = [
    {
      name: 'Vérification Headers CSRF',
      url: `${BASE_URL}/api/csrf`,
      method: 'GET',
      expectedStatus: 200,
      description: 'Doit fournir un token CSRF'
    },
    {
      name: 'Validation Token CSRF',
      url: `${BASE_URL}/api/missions`,
      method: 'POST',
      body: {
        title: 'Test CSRF',
        objective: 'Test objective',
        email: 'test@example.com'
      },
      headers: {
        'X-CSRF-Token': 'invalid-token'
      },
      expectedStatus: [400, 401, 403],
      description: 'Doit rejeter un token CSRF invalide'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      log.info(`Test: ${test.name}`);
      const response = await makeRequest(test.url, {
        method: test.method,
        body: test.body,
        headers: test.headers
      });

      if (Array.isArray(test.expectedStatus) 
          ? test.expectedStatus.includes(response.status)
          : response.status === test.expectedStatus) {
        log.success(`${test.name} - ${test.description}`);
        passed++;
      } else {
        log.error(`${test.name} - Attendu ${test.expectedStatus}, reçu ${response.status}`);
        failed++;
      }
    } catch (error) {
      log.error(`${test.name} - Erreur: ${error.message}`);
      failed++;
    }
  }

  return { passed, failed, total: tests.length };
}

// Test de santé générale
async function testHealthCheck() {
  log.header('🏥 Test de Santé Générale');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/health`);
    
    if (response.status === 200) {
      log.success('Health check réussi');
      return { passed: 1, failed: 0, total: 1 };
    } else {
      log.error(`Health check échoué - Status: ${response.status}`);
      return { passed: 0, failed: 1, total: 1 };
    }
  } catch (error) {
    log.error(`Health check échoué - Erreur: ${error.message}`);
    return { passed: 0, failed: 1, total: 1 };
  }
}

// Fonction principale
async function runAllTests() {
  log.header('🚀 Démarrage des Tests Automatisés Beriox AI');
  log.info(`URL de test: ${BASE_URL}`);
  log.info(`Timeout: ${TEST_TIMEOUT}ms`);
  
  const startTime = Date.now();
  
  try {
    // Tests de santé
    const healthResults = await testHealthCheck();
    
    // Tests de validation
    const validationResults = await testFormValidation();
    
    // Tests de soumission
    const submissionResults = await testFormSubmission();
    
    // Tests de gestion d'erreurs
    const errorResults = await testErrorHandling();
    
    // Tests de sécurité CSRF
    const csrfResults = await testCSRFSecurity();
    
    // Résultats finaux
    const totalPassed = healthResults.passed + validationResults.passed + 
                       submissionResults.passed + errorResults.passed + csrfResults.passed;
    const totalFailed = healthResults.failed + validationResults.failed + 
                       submissionResults.failed + errorResults.failed + csrfResults.failed;
    const totalTests = healthResults.total + validationResults.total + 
                      submissionResults.total + errorResults.total + csrfResults.total;
    
    const duration = Date.now() - startTime;
    
    log.header('📊 Résultats Finaux');
    log.info(`Durée totale: ${duration}ms`);
    log.info(`Tests réussis: ${totalPassed}/${totalTests}`);
    log.info(`Tests échoués: ${totalFailed}/${totalTests}`);
    
    const successRate = ((totalPassed / totalTests) * 100).toFixed(1);
    
    if (successRate >= 90) {
      log.success(`Taux de succès: ${successRate}% - Excellent!`);
    } else if (successRate >= 80) {
      log.warning(`Taux de succès: ${successRate}% - Bon, mais peut être amélioré`);
    } else {
      log.error(`Taux de succès: ${successRate}% - Nécessite des corrections`);
    }
    
    // Sauvegarder les résultats
    const results = {
      timestamp: new Date().toISOString(),
      url: BASE_URL,
      duration,
      results: {
        health: healthResults,
        validation: validationResults,
        submission: submissionResults,
        errorHandling: errorResults,
        csrf: csrfResults
      },
      summary: {
        totalPassed,
        totalFailed,
        totalTests,
        successRate: parseFloat(successRate)
      }
    };
    
    require('fs').writeFileSync('form-testing-report.json', JSON.stringify(results, null, 2));
    log.info('Rapport sauvegardé dans form-testing-report.json');
    
    process.exit(totalFailed > 0 ? 1 : 0);
    
  } catch (error) {
    log.error(`Erreur lors des tests: ${error.message}`);
    process.exit(1);
  }
}

// Exécution si appelé directement
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testFormValidation,
  testFormSubmission,
  testErrorHandling,
  testCSRFSecurity,
  testHealthCheck
};
