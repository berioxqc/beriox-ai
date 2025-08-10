#!/usr/bin/env node

/**
 * Script de test pour l'authentification Beriox AI
 * Vérifie que les problèmes de connexion sont résolus
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
      'User-Agent': 'Beriox-AI-Test-Script/1.0'
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

// Test de la page de connexion
async function testSignInPage() {
  log.header('🔐 Test de la Page de Connexion');
  
  const tests = [
    {
      name: 'Accès à la page de connexion',
      url: `${BASE_URL}/auth/signin`,
      expectedStatus: 200,
      description: 'La page de connexion doit être accessible'
    },
    {
      name: 'Redirection depuis la page d\'accueil (non connecté)',
      url: `${BASE_URL}/`,
      expectedStatus: [200, 302],
      description: 'Doit rediriger vers la connexion ou afficher la page'
    },
    {
      name: 'Accès à la page d\'erreur d\'authentification',
      url: `${BASE_URL}/auth/error`,
      expectedStatus: 200,
      description: 'La page d\'erreur doit être accessible'
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

// Test des redirections d'authentification
async function testAuthRedirects() {
  log.header('🔄 Test des Redirections d\'Authentification');
  
  const tests = [
    {
      name: 'Redirection vers signin depuis missions (non connecté)',
      url: `${BASE_URL}/missions`,
      expectedRedirect: '/auth/signin',
      description: 'Doit rediriger vers la page de connexion'
    },
    {
      name: 'Redirection vers signin depuis profile (non connecté)',
      url: `${BASE_URL}/profile`,
      expectedRedirect: '/auth/signin',
      description: 'Doit rediriger vers la page de connexion'
    },
    {
      name: 'Redirection vers signin depuis admin (non connecté)',
      url: `${BASE_URL}/admin`,
      expectedRedirect: '/auth/signin',
      description: 'Doit rediriger vers la page de connexion'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      log.info(`Test: ${test.name}`);
      const response = await makeRequest(test.url);

      if (response.redirected && response.url.includes(test.expectedRedirect)) {
        log.success(`${test.name} - ${test.description}`);
        passed++;
      } else if (response.status === 401 || response.status === 403) {
        log.success(`${test.name} - Accès refusé (comportement attendu)`);
        passed++;
      } else {
        log.error(`${test.name} - Pas de redirection vers ${test.expectedRedirect}`);
        failed++;
      }
    } catch (error) {
      log.error(`${test.name} - Erreur: ${error.message}`);
      failed++;
    }
  }

  return { passed, failed, total: tests.length };
}

// Test des endpoints d'API protégés
async function testProtectedEndpoints() {
  log.header('🛡️ Test des Endpoints API Protégés');
  
  const tests = [
    {
      name: 'API missions (non connecté)',
      url: `${BASE_URL}/api/missions`,
      expectedStatus: 401,
      description: 'Doit retourner 401 pour utilisateur non connecté'
    },
    {
      name: 'API user profile (non connecté)',
      url: `${BASE_URL}/api/user/profile`,
      expectedStatus: 401,
      description: 'Doit retourner 401 pour utilisateur non connecté'
    },
    {
      name: 'API admin stats (non connecté)',
      url: `${BASE_URL}/api/admin/stats`,
      expectedStatus: 401,
      description: 'Doit retourner 401 pour utilisateur non connecté'
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

// Test de la configuration NextAuth
async function testNextAuthConfig() {
  log.header('⚙️ Test de la Configuration NextAuth');
  
  const tests = [
    {
      name: 'Endpoint de session NextAuth',
      url: `${BASE_URL}/api/auth/session`,
      expectedStatus: 200,
      description: 'L\'endpoint de session doit être accessible'
    },
    {
      name: 'Endpoint des providers NextAuth',
      url: `${BASE_URL}/api/auth/providers`,
      expectedStatus: 200,
      description: 'L\'endpoint des providers doit être accessible'
    },
    {
      name: 'Endpoint CSRF',
      url: `${BASE_URL}/api/csrf`,
      expectedStatus: 200,
      description: 'L\'endpoint CSRF doit être accessible'
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

// Test de performance des redirections
async function testRedirectPerformance() {
  log.header('⚡ Test de Performance des Redirections');
  
  const tests = [
    {
      name: 'Temps de redirection vers signin',
      url: `${BASE_URL}/missions`,
      maxTime: 2000, // 2 secondes max
      description: 'La redirection doit être rapide'
    },
    {
      name: 'Temps de chargement page signin',
      url: `${BASE_URL}/auth/signin`,
      maxTime: 1000, // 1 seconde max
      description: 'La page de connexion doit se charger rapidement'
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

// Fonction principale
async function runTests() {
  log.header('🧪 Tests d\'Authentification Beriox AI');
  log.info(`URL de base: ${BASE_URL}`);
  log.separator();

  const results = [];

  // Exécuter tous les tests
  results.push(await testSignInPage());
  results.push(await testAuthRedirects());
  results.push(await testProtectedEndpoints());
  results.push(await testNextAuthConfig());
  results.push(await testRedirectPerformance());

  // Résumé final
  log.separator();
  log.header('📊 Résumé des Tests');

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
      log.warning('Plusieurs problèmes détectés. Vérifiez la configuration NextAuth.');
    }
    
    log.info('1. Vérifiez que le serveur Next.js est démarré');
    log.info('2. Vérifiez les variables d\'environnement Google OAuth');
    log.info('3. Vérifiez la configuration de la base de données');
    log.info('4. Vérifiez les logs du serveur pour plus de détails');
  }

  return { totalPassed, totalFailed, totalTests, successRate };
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runTests()
    .then((results) => {
      process.exit(results.totalFailed > 0 ? 1 : 0);
    })
    .catch((error) => {
      log.error(`Erreur lors de l'exécution des tests: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { runTests };
