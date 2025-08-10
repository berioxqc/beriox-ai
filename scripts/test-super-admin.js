#!/usr/bin/env node

/**
 * Script de test pour la Section Super-Admin - Beriox AI
 * Teste l'accès et les fonctionnalités de la section super-admin
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
        'User-Agent': 'Beriox-AI-SuperAdmin-Test/1.0',
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

// Test d'accès à la page super-admin
async function testSuperAdminAccess() {
  log.header('👑 Test Accès Super-Admin');
  
  try {
    log.info('Test d\'accès à la page super-admin...');
    const response = await makeRequest(`${BASE_URL}/super-admin`);
    
    if (response.status === 200) {
      // Vérifier si la page contient les éléments super-admin
      const hasSuperAdminContent = response.rawData.includes('Super-Admin Dashboard') ||
                                  response.rawData.includes('info@beriox.ca') ||
                                  response.rawData.includes('Contrôle total');
      
      if (hasSuperAdminContent) {
        log.success('Page super-admin accessible et contient le contenu attendu');
        return { passed: true, status: response.status };
      } else {
        log.warning('Page accessible mais contenu super-admin non détecté');
        return { passed: false, status: response.status, reason: 'Contenu manquant' };
      }
    } else if (response.status === 401 || response.status === 403) {
      log.success('Accès correctement protégé (401/403)');
      return { passed: true, status: response.status };
    } else {
      log.error(`Statut inattendu: ${response.status}`);
      return { passed: false, status: response.status, reason: 'Statut inattendu' };
    }
  } catch (error) {
    log.error(`Erreur lors du test d'accès: ${error.message}`);
    return { passed: false, error: error.message };
  }
}

// Test de protection de la page super-admin
async function testSuperAdminProtection() {
  log.header('🔒 Test Protection Super-Admin');
  
  try {
    log.info('Test de protection avec utilisateur non autorisé...');
    
    // Simuler une requête sans authentification
    const response = await makeRequest(`${BASE_URL}/super-admin`, {
      headers: {
        'X-User-Email': 'user@example.com' // Email non autorisé
      }
    });
    
    if (response.status === 401 || response.status === 403) {
      log.success('Protection active - accès refusé pour utilisateur non autorisé');
      return { passed: true, status: response.status };
    } else if (response.status === 200) {
      // Vérifier si la page affiche un message d'accès refusé
      const hasAccessDenied = response.rawData.includes('Accès Super-Admin Refusé') ||
                             response.rawData.includes('Seul info@beriox.ca') ||
                             response.rawData.includes('Accès refusé');
      
      if (hasAccessDenied) {
        log.success('Protection active - message d\'accès refusé affiché');
        return { passed: true, status: response.status };
      } else {
        log.error('Page accessible sans protection appropriée');
        return { passed: false, status: response.status, reason: 'Pas de protection' };
      }
    } else {
      log.warning(`Statut inattendu: ${response.status}`);
      return { passed: false, status: response.status, reason: 'Statut inattendu' };
    }
  } catch (error) {
    log.error(`Erreur lors du test de protection: ${error.message}`);
    return { passed: false, error: error.message };
  }
}

// Test de navigation dans la section super-admin
async function testSuperAdminNavigation() {
  log.header('🧭 Test Navigation Super-Admin');
  
  const navigationTests = [
    {
      name: 'Page Gestion Utilisateurs',
      url: '/admin/users',
      expectedContent: ['Gestion des Utilisateurs', 'Utilisateurs', 'Premium']
    },
    {
      name: 'Page Accès Premium',
      url: '/admin/premium-access',
      expectedContent: ['Accès Premium', 'Abonnements']
    },
    {
      name: 'Page Gestion Missions',
      url: '/admin/missions',
      expectedContent: ['Missions', 'Gestion']
    },
    {
      name: 'Page Remboursements',
      url: '/admin/refunds',
      expectedContent: ['Remboursements', 'Demandes']
    },
    {
      name: 'Page Codes Promo',
      url: '/admin/coupons',
      expectedContent: ['Codes Promo', 'Réductions']
    }
  ];
  
  let passedTests = 0;
  let totalTests = navigationTests.length;
  
  for (const test of navigationTests) {
    try {
      log.info(`Test: ${test.name}...`);
      const response = await makeRequest(`${BASE_URL}${test.url}`);
      
      if (response.status === 200) {
        // Vérifier si la page contient le contenu attendu
        const hasExpectedContent = test.expectedContent.some(content => 
          response.rawData.includes(content)
        );
        
        if (hasExpectedContent) {
          log.success(`${test.name} - Page accessible et contenu correct`);
          passedTests++;
        } else {
          log.warning(`${test.name} - Page accessible mais contenu manquant`);
        }
      } else if (response.status === 401 || response.status === 403) {
        log.success(`${test.name} - Accès protégé (${response.status})`);
        passedTests++;
      } else {
        log.error(`${test.name} - Statut inattendu: ${response.status}`);
      }
    } catch (error) {
      log.error(`${test.name} - Erreur: ${error.message}`);
    }
  }
  
  const result = {
    passed: passedTests,
    total: totalTests,
    success: passedTests >= totalTests * 0.8 // 80% de succès minimum
  };
  
  if (result.success) {
    log.success(`Navigation: ${passedTests}/${totalTests} pages accessibles`);
  } else {
    log.warning(`Navigation: ${passedTests}/${totalTests} pages accessibles`);
  }
  
  return result;
}

// Test des call-to-actions
async function testCallToActions() {
  log.header('🎯 Test Call-to-Actions Super-Admin');
  
  try {
    log.info('Test des call-to-actions dans la page super-admin...');
    const response = await makeRequest(`${BASE_URL}/super-admin`);
    
    if (response.status === 200) {
      // Vérifier la présence des call-to-actions
      const ctaTests = [
        { name: 'Actions Rapides', content: 'Actions Rapides' },
        { name: 'Gestion Utilisateurs', content: 'Gestion Utilisateurs' },
        { name: 'Gestion Missions', content: 'Gestion Missions' },
        { name: 'Paiements Stripe', content: 'Paiements Stripe' },
        { name: 'Monitoring', content: 'Monitoring' },
        { name: 'Sécurité', content: 'Sécurité' },
        { name: 'Analytics', content: 'Analytics' }
      ];
      
      let foundCTAs = 0;
      for (const cta of ctaTests) {
        if (response.rawData.includes(cta.content)) {
          foundCTAs++;
          log.success(`CTA trouvé: ${cta.name}`);
        } else {
          log.warning(`CTA manquant: ${cta.name}`);
        }
      }
      
      const result = {
        found: foundCTAs,
        total: ctaTests.length,
        success: foundCTAs >= ctaTests.length * 0.7 // 70% des CTAs minimum
      };
      
      if (result.success) {
        log.success(`Call-to-actions: ${foundCTAs}/${ctaTests.length} trouvés`);
      } else {
        log.warning(`Call-to-actions: ${foundCTAs}/${ctaTests.length} trouvés`);
      }
      
      return result;
    } else {
      log.error(`Impossible d'accéder à la page super-admin: ${response.status}`);
      return { found: 0, total: 0, success: false };
    }
  } catch (error) {
    log.error(`Erreur lors du test des CTAs: ${error.message}`);
    return { found: 0, total: 0, success: false, error: error.message };
  }
}

// Test de l'interface utilisateur
async function testSuperAdminUI() {
  log.header('🎨 Test Interface Super-Admin');
  
  try {
    log.info('Test de l\'interface utilisateur...');
    const response = await makeRequest(`${BASE_URL}/super-admin`);
    
    if (response.status === 200) {
      // Vérifier les éléments d'interface
      const uiTests = [
        { name: 'Header Super-Admin', content: 'Super-Admin Dashboard' },
        { name: 'Tabs Navigation', content: 'Vue d\'ensemble' },
        { name: 'Stats Cards', content: 'Utilisateurs' },
        { name: 'Actions Grid', content: 'Actions Rapides' },
        { name: 'Crown Icon', content: '👑' },
        { name: 'Responsive Design', content: 'grid-template-columns' }
      ];
      
      let foundElements = 0;
      for (const element of uiTests) {
        if (response.rawData.includes(element.content)) {
          foundElements++;
          log.success(`Élément UI trouvé: ${element.name}`);
        } else {
          log.warning(`Élément UI manquant: ${element.name}`);
        }
      }
      
      const result = {
        found: foundElements,
        total: uiTests.length,
        success: foundElements >= uiTests.length * 0.8 // 80% des éléments minimum
      };
      
      if (result.success) {
        log.success(`Interface: ${foundElements}/${uiTests.length} éléments trouvés`);
      } else {
        log.warning(`Interface: ${foundElements}/${uiTests.length} éléments trouvés`);
      }
      
      return result;
    } else {
      log.error(`Impossible d'accéder à la page super-admin: ${response.status}`);
      return { found: 0, total: 0, success: false };
    }
  } catch (error) {
    log.error(`Erreur lors du test de l'interface: ${error.message}`);
    return { found: 0, total: 0, success: false, error: error.message };
  }
}

// Fonction principale
async function runSuperAdminTests() {
  log.header('🚀 Démarrage des Tests Super-Admin Beriox AI');
  log.info(`URL de test: ${BASE_URL}`);
  log.info(`Timeout: ${TEST_TIMEOUT}ms`);
  
  const startTime = Date.now();
  
  try {
    // Tests super-admin
    const accessResult = await testSuperAdminAccess();
    const protectionResult = await testSuperAdminProtection();
    const navigationResult = await testSuperAdminNavigation();
    const ctaResult = await testCallToActions();
    const uiResult = await testSuperAdminUI();
    
    // Résultats finaux
    const totalTests = 5;
    const passedTests = [
      accessResult.passed,
      protectionResult.passed,
      navigationResult.success,
      ctaResult.success,
      uiResult.success
    ].filter(Boolean).length;
    
    const duration = Date.now() - startTime;
    
    log.header('📊 Résultats Finaux - Super-Admin');
    log.info(`Durée totale: ${duration}ms`);
    log.info(`Tests réussis: ${passedTests}/${totalTests}`);
    
    // Détails des résultats
    log.info('\n📋 Détails des Tests:');
    log.info(`🔐 Accès: ${accessResult.passed ? '✅' : '❌'} (${accessResult.status})`);
    log.info(`🔒 Protection: ${protectionResult.passed ? '✅' : '❌'} (${protectionResult.status})`);
    log.info(`🧭 Navigation: ${navigationResult.success ? '✅' : '❌'} (${navigationResult.passed}/${navigationResult.total})`);
    log.info(`🎯 Call-to-actions: ${ctaResult.success ? '✅' : '❌'} (${ctaResult.found}/${ctaResult.total})`);
    log.info(`🎨 Interface: ${uiResult.success ? '✅' : '❌'} (${uiResult.found}/${uiResult.total})`);
    
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    if (successRate >= 80) {
      log.success(`Taux de succès: ${successRate}% - Section Super-Admin fonctionnelle!`);
    } else if (successRate >= 60) {
      log.warning(`Taux de succès: ${successRate}% - Section Super-Admin partiellement fonctionnelle`);
    } else {
      log.error(`Taux de succès: ${successRate}% - Section Super-Admin nécessite des corrections`);
    }
    
    // Sauvegarder les résultats
    const results = {
      timestamp: new Date().toISOString(),
      url: BASE_URL,
      duration,
      results: {
        access: accessResult,
        protection: protectionResult,
        navigation: navigationResult,
        callToActions: ctaResult,
        ui: uiResult
      },
      summary: {
        totalTests,
        passedTests,
        successRate: parseFloat(successRate)
      }
    };
    
    require('fs').writeFileSync('super-admin-test-report.json', JSON.stringify(results, null, 2));
    log.info('Rapport sauvegardé dans super-admin-test-report.json');
    
    process.exit(passedTests < 4 ? 1 : 0);
    
  } catch (error) {
    log.error(`Erreur lors des tests: ${error.message}`);
    process.exit(1);
  }
}

// Exécution si appelé directement
if (require.main === module) {
  runSuperAdminTests();
}

module.exports = {
  runSuperAdminTests,
  testSuperAdminAccess,
  testSuperAdminProtection,
  testSuperAdminNavigation,
  testCallToActions,
  testSuperAdminUI
};
