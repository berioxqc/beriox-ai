const { BotRecommendationEngine } = require('./src/lib/bot-recommendations.ts');

async function testRecommendations() {
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

    return recommendations;

  } catch (error) {
    console.error('❌ Erreur lors du test des recommandations:', error);
    throw error;
  }
}

// Exécuter le test
testRecommendations()
  .then(() => {
    console.log('\n🎉 Test terminé avec succès!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erreur lors du test:', error);
    process.exit(1);
  });
