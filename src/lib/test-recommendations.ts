import { BotRecommendationEngine } from './bot-recommendations';

/**
 * Script de test pour le système de recommandations IA
 */
export async function testRecommendations() {
  console.log('🤖 Test du système de recommandations IA...\n');

  // Simuler un utilisateur
  const userId = 'test-user-123';
  const engine = new BotRecommendationEngine(userId);

  try {
    // Générer des recommandations
    console.log('📊 Génération des recommandations...');
    const recommendations = await engine.generateRecommendations();

    console.log(`✅ ${recommendations.length} recommandations générées\n`);

    // Afficher les recommandations par catégorie
    const categories = {
      performance: recommendations.filter(r => r.type === 'performance'),
      security: recommendations.filter(r => r.type === 'security'),
      ux: recommendations.filter(r => r.type === 'ux'),
      business: recommendations.filter(r => r.type === 'business'),
      technical: recommendations.filter(r => r.type === 'technical')
    };

    Object.entries(categories).forEach(([category, recs]) => {
      if (recs.length > 0) {
        console.log(`📋 ${category.toUpperCase()} (${recs.length} recommandations):`);
        recs.forEach((rec, index) => {
          console.log(`  ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
          console.log(`     Effort: ${rec.effort} | Temps: ${rec.estimatedTime}`);
          console.log(`     Impact: ${rec.impact.substring(0, 80)}...`);
          console.log('');
        });
      }
    });

    // Statistiques
    const priorityStats = {
      critical: recommendations.filter(r => r.priority === 'critical').length,
      high: recommendations.filter(r => r.priority === 'high').length,
      medium: recommendations.filter(r => r.priority === 'medium').length,
      low: recommendations.filter(r => r.priority === 'low').length
    };

    console.log('📈 Statistiques des recommandations:');
    console.log(`  🔴 Critique: ${priorityStats.critical}`);
    console.log(`  🟠 Haute: ${priorityStats.high}`);
    console.log(`  🟡 Moyenne: ${priorityStats.medium}`);
    console.log(`  🟢 Basse: ${priorityStats.low}`);

    // Recommandations prioritaires
    const criticalRecs = recommendations.filter(r => r.priority === 'critical');
    if (criticalRecs.length > 0) {
      console.log('\n🚨 RECOMMANDATIONS CRITIQUES:');
      criticalRecs.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec.title}`);
        console.log(`     ${rec.description}`);
        console.log('');
      });
    }

    // Sauvegarder les recommandations (simulation)
    console.log('💾 Sauvegarde des recommandations...');
    // await engine.saveRecommendations(recommendations);
    console.log('✅ Recommandations sauvegardées (simulation)');

    return recommendations;

  } catch (error) {
    console.error('❌ Erreur lors du test des recommandations:', error);
    throw error;
  }
}

/**
 * Test des analyses spécifiques
 */
export async function testSpecificAnalyses() {
  console.log('\n🔍 Test des analyses spécifiques...\n');

  const userId = 'test-user-123';
  const engine = new BotRecommendationEngine(userId);

  // Test d'analyse de performance
  console.log('⚡ Test analyse performance:');
  const perfRecs = await engine['analyzePerformance']();
  console.log(`  ${perfRecs.length} recommandations de performance`);

  // Test d'analyse de sécurité
  console.log('🔒 Test analyse sécurité:');
  const secRecs = await engine['analyzeSecurity']();
  console.log(`  ${secRecs.length} recommandations de sécurité`);

  // Test d'analyse UX
  console.log('🎨 Test analyse UX:');
  const uxRecs = await engine['analyzeUX']();
  console.log(`  ${uxRecs.length} recommandations UX`);

  // Test d'analyse business
  console.log('💰 Test analyse business:');
  const busRecs = await engine['analyzeBusiness']();
  console.log(`  ${busRecs.length} recommandations business`);

  // Test d'analyse technique
  console.log('⚙️ Test analyse technique:');
  const techRecs = await engine['analyzeTechnical']();
  console.log(`  ${techRecs.length} recommandations techniques`);

  return {
    performance: perfRecs,
    security: secRecs,
    ux: uxRecs,
    business: busRecs,
    technical: techRecs
  };
}

// Exécution du test si le script est appelé directement
if (require.main === module) {
  testRecommendations()
    .then(() => testSpecificAnalyses())
    .then(() => {
      console.log('\n🎉 Tests terminés avec succès!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Erreur lors des tests:', error);
      process.exit(1);
    });
}
