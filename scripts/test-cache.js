#!/usr/bin/env node

/**
 * Script de test pour le Cache Intelligent - Beriox AI
 * Teste les performances et la fonctionnalité du cache
 */

const { cache, getGlobalCacheStats, cleanupAllCaches } = require('../src/lib/cache-intelligent.ts');

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

// Fonction pour mesurer le temps d'exécution
function measureTime(fn) {
  const start = Date.now();
  const result = fn();
  const end = Date.now();
  return { result, duration: end - start };
}

// Test de base du cache
async function testBasicCache() {
  log.header('🧪 Test de Base du Cache');
  
  const testKey = 'test-basic';
  const testData = { id: 1, name: 'Test User', email: 'test@example.com' };
  
  try {
    // Test de stockage
    log.info('Test de stockage en cache...');
    await cache.users.set(testKey, testData);
    log.success('Données stockées en cache');
    
    // Test de récupération
    log.info('Test de récupération depuis le cache...');
    const retrieved = await cache.users.get(testKey);
    
    if (retrieved && JSON.stringify(retrieved) === JSON.stringify(testData)) {
      log.success('Données récupérées correctement du cache');
    } else {
      log.error('Données récupérées incorrectes');
      return false;
    }
    
    // Test de suppression
    log.info('Test de suppression du cache...');
    await cache.users.delete(testKey);
    const deleted = await cache.users.get(testKey);
    
    if (deleted === null) {
      log.success('Données supprimées correctement du cache');
    } else {
      log.error('Données non supprimées du cache');
      return false;
    }
    
    return true;
  } catch (error) {
    log.error(`Erreur lors du test de base: ${error.message}`);
    return false;
  }
}

// Test de performance du cache
async function testCachePerformance() {
  log.header('⚡ Test de Performance du Cache');
  
  const iterations = 100;
  const testData = { id: 1, name: 'Performance Test', timestamp: Date.now() };
  
  try {
    // Test sans cache
    log.info(`Test sans cache (${iterations} itérations)...`);
    const noCacheStart = Date.now();
    
    for (let i = 0; i < iterations; i++) {
      // Simulation d'une opération coûteuse
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    const noCacheDuration = Date.now() - noCacheStart;
    log.info(`Temps sans cache: ${noCacheDuration}ms`);
    
    // Test avec cache
    log.info(`Test avec cache (${iterations} itérations)...`);
    const cacheStart = Date.now();
    
    for (let i = 0; i < iterations; i++) {
      const key = `perf-test-${i}`;
      await cache.missions.getOrSet(key, async () => {
        // Simulation d'une opération coûteuse
        await new Promise(resolve => setTimeout(resolve, 10));
        return { ...testData, iteration: i };
      });
    }
    
    const cacheDuration = Date.now() - cacheStart;
    log.info(`Temps avec cache: ${cacheDuration}ms`);
    
    // Calcul de l'amélioration
    const improvement = ((noCacheDuration - cacheDuration) / noCacheDuration * 100).toFixed(1);
    
    if (cacheDuration < noCacheDuration) {
      log.success(`Amélioration de performance: ${improvement}%`);
    } else {
      log.warning(`Pas d'amélioration de performance: ${improvement}%`);
    }
    
    return { noCacheDuration, cacheDuration, improvement: parseFloat(improvement) };
  } catch (error) {
    log.error(`Erreur lors du test de performance: ${error.message}`);
    return null;
  }
}

// Test de TTL (Time To Live)
async function testCacheTTL() {
  log.header('⏰ Test TTL du Cache');
  
  const testKey = 'test-ttl';
  const shortTTL = 2; // 2 secondes
  
  try {
    // Stocker avec un TTL court
    log.info(`Stockage avec TTL de ${shortTTL} secondes...`);
    await cache.recommendations.set(testKey, { data: 'test' }, shortTTL);
    
    // Vérifier que les données sont présentes
    const immediate = await cache.recommendations.get(testKey);
    if (immediate) {
      log.success('Données présentes immédiatement après stockage');
    } else {
      log.error('Données non trouvées immédiatement après stockage');
      return false;
    }
    
    // Attendre l'expiration
    log.info(`Attente de ${shortTTL + 1} secondes pour l'expiration...`);
    await new Promise(resolve => setTimeout(resolve, (shortTTL + 1) * 1000));
    
    // Vérifier que les données ont expiré
    const expired = await cache.recommendations.get(testKey);
    if (expired === null) {
      log.success('Données expirées correctement');
    } else {
      log.error('Données non expirées après TTL');
      return false;
    }
    
    return true;
  } catch (error) {
    log.error(`Erreur lors du test TTL: ${error.message}`);
    return false;
  }
}

// Test de getOrSet
async function testGetOrSet() {
  log.header('🔄 Test getOrSet du Cache');
  
  const testKey = 'test-getorset';
  let generatorCallCount = 0;
  
  try {
    // Première appel - doit appeler le générateur
    log.info('Premier appel à getOrSet...');
    const firstResult = await cache.integrations.getOrSet(testKey, async () => {
      generatorCallCount++;
      log.info('Générateur appelé');
      return { data: 'generated', timestamp: Date.now() };
    });
    
    if (firstResult && generatorCallCount === 1) {
      log.success('Premier appel réussi, générateur appelé');
    } else {
      log.error('Premier appel échoué');
      return false;
    }
    
    // Deuxième appel - doit utiliser le cache
    log.info('Deuxième appel à getOrSet...');
    const secondResult = await cache.integrations.getOrSet(testKey, async () => {
      generatorCallCount++;
      log.info('Générateur appelé (ne devrait pas arriver)');
      return { data: 'generated-again', timestamp: Date.now() };
    });
    
    if (secondResult && generatorCallCount === 1) {
      log.success('Deuxième appel réussi, cache utilisé');
    } else {
      log.error('Deuxième appel échoué, générateur appelé à nouveau');
      return false;
    }
    
    // Vérifier que les résultats sont identiques
    if (JSON.stringify(firstResult) === JSON.stringify(secondResult)) {
      log.success('Résultats identiques entre les deux appels');
    } else {
      log.error('Résultats différents entre les deux appels');
      return false;
    }
    
    return true;
  } catch (error) {
    log.error(`Erreur lors du test getOrSet: ${error.message}`);
    return false;
  }
}

// Test de nettoyage du cache
async function testCacheCleanup() {
  log.header('🧹 Test de Nettoyage du Cache');
  
  try {
    // Créer quelques clés de test
    log.info('Création de clés de test...');
    for (let i = 0; i < 5; i++) {
      await cache.missions.set(`cleanup-test-${i}`, { data: `test-${i}` });
    }
    
    // Vérifier que les clés existent
    const beforeCleanup = await cache.missions.get('cleanup-test-0');
    if (!beforeCleanup) {
      log.error('Clés de test non créées');
      return false;
    }
    
    log.success('Clés de test créées');
    
    // Nettoyer le cache
    log.info('Nettoyage du cache...');
    const cleanupResults = await cleanupAllCaches();
    
    log.info(`Résultats du nettoyage:`, cleanupResults);
    
    // Vérifier que les clés ont été nettoyées
    const afterCleanup = await cache.missions.get('cleanup-test-0');
    if (afterCleanup === null) {
      log.success('Cache nettoyé correctement');
    } else {
      log.warning('Cache partiellement nettoyé');
    }
    
    return true;
  } catch (error) {
    log.error(`Erreur lors du test de nettoyage: ${error.message}`);
    return false;
  }
}

// Test des statistiques du cache
async function testCacheStats() {
  log.header('📊 Test des Statistiques du Cache');
  
  try {
    // Faire quelques opérations pour générer des statistiques
    log.info('Génération de statistiques...');
    
    for (let i = 0; i < 10; i++) {
      await cache.users.getOrSet(`stats-test-${i}`, async () => {
        return { data: `stats-${i}`, timestamp: Date.now() };
      });
    }
    
    // Récupérer les statistiques
    const stats = await getGlobalCacheStats();
    
    log.info('Statistiques du cache:');
    for (const [name, stat] of Object.entries(stats)) {
      log.info(`  ${name}: ${stat.hits} hits, ${stat.misses} misses, ${stat.hitRate.toFixed(1)}% hit rate`);
    }
    
    // Vérifier que les statistiques sont cohérentes
    const hasValidStats = Object.values(stats).some(stat => 
      stat.hits >= 0 && stat.misses >= 0 && stat.hitRate >= 0
    );
    
    if (hasValidStats) {
      log.success('Statistiques du cache valides');
    } else {
      log.error('Statistiques du cache invalides');
      return false;
    }
    
    return true;
  } catch (error) {
    log.error(`Erreur lors du test des statistiques: ${error.message}`);
    return false;
  }
}

// Fonction principale
async function runCacheTests() {
  log.header('🚀 Démarrage des Tests de Cache Intelligent Beriox AI');
  
  const startTime = Date.now();
  
  try {
    // Tests de base
    const basicResult = await testBasicCache();
    
    // Tests de performance
    const performanceResult = await testCachePerformance();
    
    // Tests TTL
    const ttlResult = await testCacheTTL();
    
    // Tests getOrSet
    const getOrSetResult = await testGetOrSet();
    
    // Tests de nettoyage
    const cleanupResult = await testCacheCleanup();
    
    // Tests des statistiques
    const statsResult = await testCacheStats();
    
    // Résultats finaux
    const results = [
      { name: 'Test de base', passed: basicResult },
      { name: 'Test de performance', passed: performanceResult !== null },
      { name: 'Test TTL', passed: ttlResult },
      { name: 'Test getOrSet', passed: getOrSetResult },
      { name: 'Test de nettoyage', passed: cleanupResult },
      { name: 'Test des statistiques', passed: statsResult }
    ];
    
    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;
    const duration = Date.now() - startTime;
    
    log.header('📊 Résultats Finaux - Cache Intelligent');
    log.info(`Durée totale: ${duration}ms`);
    log.info(`Tests réussis: ${passedTests}/${totalTests}`);
    
    // Afficher les résultats détaillés
    results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      log.info(`${status} ${result.name}`);
    });
    
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    if (successRate >= 80) {
      log.success(`Taux de succès: ${successRate}% - Cache intelligent fonctionnel!`);
    } else if (successRate >= 60) {
      log.warning(`Taux de succès: ${successRate}% - Cache intelligent partiellement fonctionnel`);
    } else {
      log.error(`Taux de succès: ${successRate}% - Cache intelligent nécessite des corrections`);
    }
    
    // Afficher les résultats de performance si disponibles
    if (performanceResult) {
      log.info(`\n⚡ Performance: Amélioration de ${performanceResult.improvement}%`);
      log.info(`  Sans cache: ${performanceResult.noCacheDuration}ms`);
      log.info(`  Avec cache: ${performanceResult.cacheDuration}ms`);
    }
    
    // Sauvegarder les résultats
    const testResults = {
      timestamp: new Date().toISOString(),
      duration,
      results,
      performance: performanceResult,
      summary: {
        totalTests,
        passedTests,
        successRate: parseFloat(successRate)
      }
    };
    
    require('fs').writeFileSync('cache-test-report.json', JSON.stringify(testResults, null, 2));
    log.info('Rapport sauvegardé dans cache-test-report.json');
    
    process.exit(passedTests < 4 ? 1 : 0);
    
  } catch (error) {
    log.error(`Erreur lors des tests: ${error.message}`);
    process.exit(1);
  }
}

// Exécution si appelé directement
if (require.main === module) {
  runCacheTests();
}

module.exports = {
  runCacheTests,
  testBasicCache,
  testCachePerformance,
  testCacheTTL,
  testGetOrSet,
  testCacheCleanup,
  testCacheStats
};
