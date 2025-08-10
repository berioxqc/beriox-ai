#!/usr/bin/env node

/**
 * Script de test pour le Rate Limiting - Beriox AI
 * Teste les limites de requêtes et la protection contre les abus
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 5000; // 5 secondes

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
        'User-Agent': 'Beriox-AI-RateLimit-Test/1.0',
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

// Test de rate limiting pour les routes d'authentification
async function testAuthRateLimit() {
  log.header('🔐 Test Rate Limiting - Authentification');
  
  const endpoint = `${BASE_URL}/api/auth/signin`;
  const maxRequests = 10; // Limite configurée pour /api/auth
  let blockedRequests = 0;
  let successfulRequests = 0;

  log.info(`Test de ${maxRequests + 5} requêtes sur ${endpoint} (limite: ${maxRequests})`);

  // Faire plus de requêtes que la limite
  for (let i = 0; i < maxRequests + 5; i++) {
    try {
      const response = await makeRequest(endpoint, {
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'password123'
        }
      });

      if (response.status === 429) {
        blockedRequests++;
        log.info(`Requête ${i + 1}: Bloquée (429) - Headers: X-RateLimit-Remaining=${response.headers['x-ratelimit-remaining']}`);
      } else {
        successfulRequests++;
        log.info(`Requête ${i + 1}: Succès (${response.status})`);
      }

      // Petite pause entre les requêtes
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      log.error(`Requête ${i + 1}: Erreur - ${error.message}`);
    }
  }

  const result = {
    successful: successfulRequests,
    blocked: blockedRequests,
    total: maxRequests + 5,
    expectedBlocked: 5,
    passed: blockedRequests >= 3 // Au moins 3 requêtes doivent être bloquées
  };

  if (result.passed) {
    log.success(`Rate limiting auth: ${blockedRequests} requêtes bloquées sur ${result.total}`);
  } else {
    log.error(`Rate limiting auth: Seulement ${blockedRequests} requêtes bloquées, attendu au moins 3`);
  }

  return result;
}

// Test de rate limiting pour les missions
async function testMissionsRateLimit() {
  log.header('📋 Test Rate Limiting - Missions');
  
  const endpoint = `${BASE_URL}/api/missions`;
  const maxRequests = 50; // Limite configurée pour /api/missions
  let blockedRequests = 0;
  let successfulRequests = 0;

  log.info(`Test de ${maxRequests + 10} requêtes sur ${endpoint} (limite: ${maxRequests})`);

  // Faire plus de requêtes que la limite
  for (let i = 0; i < maxRequests + 10; i++) {
    try {
      const response = await makeRequest(endpoint, {
        method: 'POST',
        body: {
          title: `Test Mission ${i}`,
          objective: 'Test objective',
          email: 'test@example.com',
          context: 'Test context'
        }
      });

      if (response.status === 429) {
        blockedRequests++;
        log.info(`Requête ${i + 1}: Bloquée (429) - Headers: X-RateLimit-Remaining=${response.headers['x-ratelimit-remaining']}`);
      } else {
        successfulRequests++;
        log.info(`Requête ${i + 1}: Succès (${response.status})`);
      }

      // Petite pause entre les requêtes
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      log.error(`Requête ${i + 1}: Erreur - ${error.message}`);
    }
  }

  const result = {
    successful: successfulRequests,
    blocked: blockedRequests,
    total: maxRequests + 10,
    expectedBlocked: 10,
    passed: blockedRequests >= 5 // Au moins 5 requêtes doivent être bloquées
  };

  if (result.passed) {
    log.success(`Rate limiting missions: ${blockedRequests} requêtes bloquées sur ${result.total}`);
  } else {
    log.error(`Rate limiting missions: Seulement ${blockedRequests} requêtes bloquées, attendu au moins 5`);
  }

  return result;
}

// Test de rate limiting pour les paiements Stripe
async function testStripeRateLimit() {
  log.header('💳 Test Rate Limiting - Stripe');
  
  const endpoint = `${BASE_URL}/api/stripe/checkout`;
  const maxRequests = 5; // Limite configurée pour /api/stripe
  let blockedRequests = 0;
  let successfulRequests = 0;

  log.info(`Test de ${maxRequests + 3} requêtes sur ${endpoint} (limite: ${maxRequests})`);

  // Faire plus de requêtes que la limite
  for (let i = 0; i < maxRequests + 3; i++) {
    try {
      const response = await makeRequest(endpoint, {
        method: 'POST',
        body: {
          priceId: 'price_test',
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel'
        }
      });

      if (response.status === 429) {
        blockedRequests++;
        log.info(`Requête ${i + 1}: Bloquée (429) - Headers: X-RateLimit-Remaining=${response.headers['x-ratelimit-remaining']}`);
      } else {
        successfulRequests++;
        log.info(`Requête ${i + 1}: Succès (${response.status})`);
      }

      // Petite pause entre les requêtes
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      log.error(`Requête ${i + 1}: Erreur - ${error.message}`);
    }
  }

  const result = {
    successful: successfulRequests,
    blocked: blockedRequests,
    total: maxRequests + 3,
    expectedBlocked: 3,
    passed: blockedRequests >= 2 // Au moins 2 requêtes doivent être bloquées
  };

  if (result.passed) {
    log.success(`Rate limiting Stripe: ${blockedRequests} requêtes bloquées sur ${result.total}`);
  } else {
    log.error(`Rate limiting Stripe: Seulement ${blockedRequests} requêtes bloquées, attendu au moins 2`);
  }

  return result;
}

// Test des headers de rate limiting
async function testRateLimitHeaders() {
  log.header('📊 Test Headers Rate Limiting');
  
  const endpoint = `${BASE_URL}/api/missions`;
  let headersFound = 0;
  let totalTests = 0;

  // Faire quelques requêtes pour vérifier les headers
  for (let i = 0; i < 3; i++) {
    try {
      const response = await makeRequest(endpoint, {
        method: 'POST',
        body: {
          title: `Test Headers ${i}`,
          objective: 'Test objective',
          email: 'test@example.com'
        }
      });

      totalTests++;
      
      // Vérifier la présence des headers de rate limiting
      const hasLimitHeader = response.headers['x-ratelimit-limit'];
      const hasRemainingHeader = response.headers['x-ratelimit-remaining'];
      const hasResetHeader = response.headers['x-ratelimit-reset'];

      if (hasLimitHeader && hasRemainingHeader && hasResetHeader) {
        headersFound++;
        log.success(`Requête ${i + 1}: Headers présents - Limit: ${hasLimitHeader}, Remaining: ${hasRemainingHeader}`);
      } else {
        log.warning(`Requête ${i + 1}: Headers manquants - Limit: ${hasLimitHeader}, Remaining: ${hasRemainingHeader}, Reset: ${hasResetHeader}`);
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      log.error(`Requête ${i + 1}: Erreur - ${error.message}`);
    }
  }

  const result = {
    headersFound,
    totalTests,
    passed: headersFound >= 2 // Au moins 2 requêtes doivent avoir les headers
  };

  if (result.passed) {
    log.success(`Headers rate limiting: ${headersFound}/${totalTests} requêtes avec headers`);
  } else {
    log.error(`Headers rate limiting: Seulement ${headersFound}/${totalTests} requêtes avec headers`);
  }

  return result;
}

// Test de récupération après expiration
async function testRateLimitRecovery() {
  log.header('⏰ Test Récupération Rate Limiting');
  
  const endpoint = `${BASE_URL}/api/auth/signin`;
  
  // Faire des requêtes jusqu'à atteindre la limite
  log.info('Phase 1: Atteindre la limite de rate limiting');
  let blockedCount = 0;
  
  for (let i = 0; i < 15; i++) {
    try {
      const response = await makeRequest(endpoint, {
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'password123'
        }
      });

      if (response.status === 429) {
        blockedCount++;
      }

      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      log.error(`Erreur requête ${i + 1}: ${error.message}`);
    }
  }

  log.info(`Phase 1 terminée: ${blockedCount} requêtes bloquées`);
  
  // Attendre un peu et tester la récupération
  log.info('Phase 2: Attendre la récupération (5 secondes)');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Tester quelques requêtes pour voir si on peut récupérer
  let recoverySuccess = 0;
  for (let i = 0; i < 3; i++) {
    try {
      const response = await makeRequest(endpoint, {
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'password123'
        }
      });

      if (response.status !== 429) {
        recoverySuccess++;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      log.error(`Erreur récupération ${i + 1}: ${error.message}`);
    }
  }

  const result = {
    blockedCount,
    recoverySuccess,
    passed: recoverySuccess >= 1 // Au moins 1 requête doit réussir après récupération
  };

  if (result.passed) {
    log.success(`Récupération rate limiting: ${recoverySuccess}/3 requêtes réussies après récupération`);
  } else {
    log.warning(`Récupération rate limiting: ${recoverySuccess}/3 requêtes réussies après récupération`);
  }

  return result;
}

// Fonction principale
async function runRateLimitTests() {
  log.header('🚀 Démarrage des Tests de Rate Limiting Beriox AI');
  log.info(`URL de test: ${BASE_URL}`);
  log.info(`Timeout: ${TEST_TIMEOUT}ms`);
  
  const startTime = Date.now();
  
  try {
    // Tests de rate limiting
    const authResults = await testAuthRateLimit();
    const missionsResults = await testMissionsRateLimit();
    const stripeResults = await testStripeRateLimit();
    const headersResults = await testRateLimitHeaders();
    const recoveryResults = await testRateLimitRecovery();
    
    // Résultats finaux
    const totalTests = 5;
    const passedTests = [
      authResults.passed,
      missionsResults.passed,
      stripeResults.passed,
      headersResults.passed,
      recoveryResults.passed
    ].filter(Boolean).length;
    
    const duration = Date.now() - startTime;
    
    log.header('📊 Résultats Finaux - Rate Limiting');
    log.info(`Durée totale: ${duration}ms`);
    log.info(`Tests réussis: ${passedTests}/${totalTests}`);
    
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    if (successRate >= 80) {
      log.success(`Taux de succès: ${successRate}% - Rate limiting fonctionnel!`);
    } else if (successRate >= 60) {
      log.warning(`Taux de succès: ${successRate}% - Rate limiting partiellement fonctionnel`);
    } else {
      log.error(`Taux de succès: ${successRate}% - Rate limiting nécessite des corrections`);
    }
    
    // Détails des résultats
    log.info('\n📋 Détails des Tests:');
    log.info(`🔐 Authentification: ${authResults.blocked} bloquées/${authResults.total} total`);
    log.info(`📋 Missions: ${missionsResults.blocked} bloquées/${missionsResults.total} total`);
    log.info(`💳 Stripe: ${stripeResults.blocked} bloquées/${stripeResults.total} total`);
    log.info(`📊 Headers: ${headersResults.headersFound}/${headersResults.totalTests} avec headers`);
    log.info(`⏰ Récupération: ${recoveryResults.recoverySuccess}/3 requêtes après récupération`);
    
    // Sauvegarder les résultats
    const results = {
      timestamp: new Date().toISOString(),
      url: BASE_URL,
      duration,
      results: {
        auth: authResults,
        missions: missionsResults,
        stripe: stripeResults,
        headers: headersResults,
        recovery: recoveryResults
      },
      summary: {
        totalTests,
        passedTests,
        successRate: parseFloat(successRate)
      }
    };
    
    require('fs').writeFileSync('rate-limiting-test-report.json', JSON.stringify(results, null, 2));
    log.info('Rapport sauvegardé dans rate-limiting-test-report.json');
    
    process.exit(passedTests < 3 ? 1 : 0);
    
  } catch (error) {
    log.error(`Erreur lors des tests: ${error.message}`);
    process.exit(1);
  }
}

// Exécution si appelé directement
if (require.main === module) {
  runRateLimitTests();
}

module.exports = {
  runRateLimitTests,
  testAuthRateLimit,
  testMissionsRateLimit,
  testStripeRateLimit,
  testRateLimitHeaders,
  testRateLimitRecovery
};
