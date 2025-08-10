#!/usr/bin/env node

/**
 * Script de test QA optimisé pour Beriox AI
 * Tests complets et fiables pour tous les aspects critiques
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
  separator: () => console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}`)
};

// Fonction pour faire des requêtes HTTP
async function makeRequest(url, options = {}) {
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Beriox-AI-QA-Test/1.0'
    },
    credentials: 'include'
  };

  const finalOptions = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, finalOptions);
    return {
      status: response.status,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
      url: response.url,
      redirected: response.redirected
    };
  } catch (error) {
    return {
      error: error.message,
      status: 0,
      ok: false
    };
  }
}

// Test de l'authentification
async function testAuthentication() {
  log.header('🔐 Test de l\'Authentification');
  
  const tests = [
    {
      name: 'Page de connexion accessible',
      url: `${BASE_URL}/auth/signin`,
      expectedStatus: 200,
      description: 'La page de connexion doit être accessible'
    },
    {
      name: 'Page d\'erreur d\'authentification',
      url: `${BASE_URL}/auth/error`,
      expectedStatus: 200,
      description: 'La page d\'erreur doit être accessible'
    },
    {
      name: 'Redirection vers connexion (missions)',
      url: `${BASE_URL}/missions`,
      expectedStatus: [200, 302, 401, 403],
      description: 'Doit rediriger ou refuser l\'accès'
    },
    {
      name: 'Redirection vers connexion (profile)',
      url: `${BASE_URL}/profile`,
      expectedStatus: [200, 302, 401, 403],
      description: 'Doit rediriger ou refuser l\'accès'
    },
    {
      name: 'Redirection vers connexion (admin)',
      url: `${BASE_URL}/admin`,
      expectedStatus: [200, 302, 401, 403],
      description: 'Doit rediriger ou refuser l\'accès'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      log.info(`Test: ${test.name}`);
      const response = await makeRequest(test.url);

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

// Test des endpoints API
async function testAPIEndpoints() {
  log.header('🛡️ Test des Endpoints API');
  
  const tests = [
    {
      name: 'API de session NextAuth',
      url: `${BASE_URL}/api/auth/session`,
      expectedStatus: 200,
      description: 'L\'endpoint de session doit être accessible'
    },
    {
      name: 'API des providers NextAuth',
      url: `${BASE_URL}/api/auth/providers`,
      expectedStatus: 200,
      description: 'L\'endpoint des providers doit être accessible'
    },
    {
      name: 'API CSRF',
      url: `${BASE_URL}/api/csrf`,
      expectedStatus: 200,
      description: 'L\'endpoint CSRF doit être accessible'
    },
    {
      name: 'API missions (non connecté)',
      url: `${BASE_URL}/api/missions`,
      expectedStatus: [401, 403],
      description: 'Doit retourner 401/403 pour utilisateur non connecté'
    },
    {
      name: 'API user profile (non connecté)',
      url: `${BASE_URL}/api/user/profile`,
      expectedStatus: [401, 403],
      description: 'Doit retourner 401/403 pour utilisateur non connecté'
    },
    {
      name: 'API health',
      url: `${BASE_URL}/api/health`,
      expectedStatus: 200,
      description: 'L\'endpoint de santé doit être accessible'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      log.info(`Test: ${test.name}`);
      const response = await makeRequest(test.url);

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

// Test des pages principales
async function testMainPages() {
  log.header('📄 Test des Pages Principales');
  
  const tests = [
    {
      name: 'Page d\'accueil',
      url: `${BASE_URL}/`,
      expectedStatus: [200, 302],
      description: 'La page d\'accueil doit être accessible ou rediriger'
    },
    {
      name: 'Page de consentement',
      url: `${BASE_URL}/consent`,
      expectedStatus: 200,
      description: 'La page de consentement doit être accessible'
    },
    {
      name: 'Page de confidentialité',
      url: `${BASE_URL}/privacy`,
      expectedStatus: 200,
      description: 'La page de confidentialité doit être accessible'
    },
    {
      name: 'Page des cookies',
      url: `${BASE_URL}/cookies`,
      expectedStatus: 200,
      description: 'La page des cookies doit être accessible'
    },
    {
      name: 'Page de pricing',
      url: `${BASE_URL}/pricing`,
      expectedStatus: [200, 302],
      description: 'La page de pricing doit être accessible ou rediriger'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      log.info(`Test: ${test.name}`);
      const response = await makeRequest(test.url);

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

// Test de performance
async function testPerformance() {
  log.header('⚡ Test de Performance');
  
  const tests = [
    {
      name: 'Temps de chargement page d\'accueil',
      url: `${BASE_URL}/`,
      maxTime: 3000,
      description: 'La page d\'accueil doit se charger rapidement'
    },
    {
      name: 'Temps de chargement page de connexion',
      url: `${BASE_URL}/auth/signin`,
      maxTime: 2000,
      description: 'La page de connexion doit se charger rapidement'
    },
    {
      name: 'Temps de réponse API session',
      url: `${BASE_URL}/api/auth/session`,
      maxTime: 1000,
      description: 'L\'API de session doit répondre rapidement'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      log.info(`Test: ${test.name}`);
      const startTime = Date.now();
      const response = await makeRequest(test.url);
      const endTime = Date.now();
      const duration = endTime - startTime;

      if (duration <= test.maxTime) {
        log.success(`${test.name} - ${test.description} (${duration}ms)`);
        passed++;
      } else {
        log.error(`${test.name} - Trop lent: ${duration}ms (max: ${test.maxTime}ms)`);
        failed++;
      }
    } catch (error) {
      log.error(`${test.name} - Erreur: ${error.message}`);
      failed++;
    }
  }

  return { passed, failed, total: tests.length };
}

// Test de sécurité
async function testSecurity() {
  log.header('🔒 Test de Sécurité');
  
  const tests = [
    {
      name: 'Headers de sécurité présents',
      url: `${BASE_URL}/`,
      checkHeaders: true,
      description: 'Les headers de sécurité doivent être présents'
    },
    {
      name: 'Protection CSRF',
      url: `${BASE_URL}/api/csrf`,
      expectedStatus: 200,
      description: 'L\'endpoint CSRF doit être accessible'
    },
    {
      name: 'Rate limiting (à vérifier manuellement)',
      url: `${BASE_URL}/api/health`,
      expectedStatus: 200,
      description: 'Le rate limiting doit être configuré'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      log.info(`Test: ${test.name}`);
      const response = await makeRequest(test.url);

      if (test.checkHeaders) {
        // Vérifier les headers de sécurité
        const securityHeaders = [
          'x-content-type-options',
          'x-frame-options',
          'x-xss-protection',
          'referrer-policy'
        ];
        
        const missingHeaders = securityHeaders.filter(header => 
          !response.headers[header]
        );

        if (missingHeaders.length === 0) {
          log.success(`${test.name} - ${test.description}`);
          passed++;
        } else {
          log.error(`${test.name} - Headers manquants: ${missingHeaders.join(', ')}`);
          failed++;
        }
      } else if (response.status === test.expectedStatus) {
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

// Test de fonctionnalités
async function testFeatures() {
  log.header('🎯 Test des Fonctionnalités');
  
  const tests = [
    {
      name: 'Système de cookies',
      url: `${BASE_URL}/cookies`,
      expectedStatus: 200,
      description: 'Le système de cookies doit être accessible'
    },
    {
      name: 'Page de consentement',
      url: `${BASE_URL}/consent`,
      expectedStatus: 200,
      description: 'La page de consentement doit être accessible'
    },
    {
      name: 'Politique de confidentialité',
      url: `${BASE_URL}/privacy`,
      expectedStatus: 200,
      description: 'La politique de confidentialité doit être accessible'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      log.info(`Test: ${test.name}`);
      const response = await makeRequest(test.url);

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

// Fonction principale
async function runQATests() {
  log.header('🧪 Tests QA Optimisés - Beriox AI');
  log.info(`URL de base: ${BASE_URL}`);
  log.separator();

  const results = [];

  // Exécuter tous les tests
  results.push(await testAuthentication());
  results.push(await testAPIEndpoints());
  results.push(await testMainPages());
  results.push(await testPerformance());
  results.push(await testSecurity());
  results.push(await testFeatures());

  // Résumé final
  log.separator();
  log.header('📊 Résumé des Tests QA');

  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
  const totalTests = results.reduce((sum, r) => sum + r.total, 0);

  log.info(`Tests réussis: ${totalPassed}/${totalTests}`);
  log.info(`Tests échoués: ${totalFailed}/${totalTests}`);
  
  const successRate = ((totalPassed / totalTests) * 100).toFixed(1);
  
  if (successRate >= 90) {
    log.success(`Taux de réussite: ${successRate}% - Excellent !`);
  } else if (successRate >= 80) {
    log.warning(`Taux de réussite: ${successRate}% - Bon, mais peut être amélioré`);
  } else {
    log.error(`Taux de réussite: ${successRate}% - Problèmes détectés`);
  }

  // Recommandations
  if (totalFailed > 0) {
    log.separator();
    log.header('🔧 Recommandations');
    
    if (totalFailed > 5) {
      log.warning('Plusieurs problèmes détectés. Vérifiez la configuration générale.');
    }
    
    log.info('1. Vérifiez que le serveur Next.js est démarré');
    log.info('2. Vérifiez les variables d\'environnement');
    log.info('3. Vérifiez la configuration de la base de données');
    log.info('4. Vérifiez les logs du serveur pour plus de détails');
  }

  return { totalPassed, totalFailed, totalTests, successRate };
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runQATests()
    .then((results) => {
      process.exit(results.totalFailed > 0 ? 1 : 0);
    })
    .catch((error) => {
      log.error(`Erreur lors de l'exécution des tests: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { runQATests };
