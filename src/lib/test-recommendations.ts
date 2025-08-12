import { BotRecommendationEngine } from 'apos;./bot-recommendations'apos;;

/**
 * Script de test pour le système de recommandations IA
 */
export async function testRecommendations() {
  console.log('apos;🤖 Test du système de recommandations IA...\n'apos;);

  // Simuler un utilisateur
  const userId = 'apos;test-user-123'apos;;
  const engine = new BotRecommendationEngine(userId);

  try {
    // Générer des recommandations
    console.log('apos;📊 Génération des recommandations...'apos;);
    const recommendations = await engine.generateRecommendations();

    console.log(`✅ ${recommendations.length} recommandations générées\n`);

    // Afficher les recommandations par catégorie
    const categories = {
      performance: recommendations.filter(r => r.type === 'apos;performance'apos;),
      security: recommendations.filter(r => r.type === 'apos;security'apos;),
      ux: recommendations.filter(r => r.type === 'apos;ux'apos;),
      business: recommendations.filter(r => r.type === 'apos;business'apos;),
      technical: recommendations.filter(r => r.type === 'apos;technical'apos;)
    };

    Object.entries(categories).forEach(([category, recs]) => {
      if (recs.length > 0) {
        console.log(`📋 ${category.toUpperCase()} (${recs.length} recommandations):`);
        recs.forEach((rec, index) => {
          console.log(`  ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
          console.log(`     Effort: ${rec.effort} | Temps: ${rec.estimatedTime}`);
          console.log(`     Impact: ${rec.impact.substring(0, 80)}...`);
          console.log('apos;'apos;);
        });
      }
    });

    // Statistiques
    const priorityStats = {
      critical: recommendations.filter(r => r.priority === 'apos;critical'apos;).length,
      high: recommendations.filter(r => r.priority === 'apos;high'apos;).length,
      medium: recommendations.filter(r => r.priority === 'apos;medium'apos;).length,
      low: recommendations.filter(r => r.priority === 'apos;low'apos;).length
    };

    console.log('apos;📈 Statistiques des recommandations:'apos;);
    console.log(`  🔴 Critique: ${priorityStats.critical}`);
    console.log(`  🟠 Haute: ${priorityStats.high}`);
    console.log(`  🟡 Moyenne: ${priorityStats.medium}`);
    console.log(`  🟢 Basse: ${priorityStats.low}`);

    // Recommandations prioritaires
    const criticalRecs = recommendations.filter(r => r.priority === 'apos;critical'apos;);
    if (criticalRecs.length > 0) {
      console.log('apos;\n🚨 RECOMMANDATIONS CRITIQUES:'apos;);
      criticalRecs.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec.title}`);
        console.log(`     ${rec.description}`);
        console.log('apos;'apos;);
      });
    }

    // Sauvegarder les recommandations (simulation)
    console.log('apos;💾 Sauvegarde des recommandations...'apos;);
    // await engine.saveRecommendations(recommendations);
    console.log('apos;✅ Recommandations sauvegardées (simulation)'apos;);

    return recommendations;

  } catch (error) {
    console.error('apos;❌ Erreur lors du test des recommandations:'apos;, error);
    throw error;
  }
}

/**
 * Test des analyses spécifiques
 */
export async function testSpecificAnalyses() {
  console.log('apos;\n🔍 Test des analyses spécifiques...\n'apos;);

  const userId = 'apos;test-user-123'apos;;
  const engine = new BotRecommendationEngine(userId);

  // Test d'apos;analyse de performance
  console.log('apos;⚡ Test analyse performance:'apos;);
  const perfRecs = await engine['apos;analyzePerformance'apos;]();
  console.log(`  ${perfRecs.length} recommandations de performance`);

  // Test d'apos;analyse de sécurité
  console.log('apos;🔒 Test analyse sécurité:'apos;);
  const secRecs = await engine['apos;analyzeSecurity'apos;]();
  console.log(`  ${secRecs.length} recommandations de sécurité`);

  // Test d'apos;analyse UX
  console.log('apos;🎨 Test analyse UX:'apos;);
  const uxRecs = await engine['apos;analyzeUX'apos;]();
  console.log(`  ${uxRecs.length} recommandations UX`);

  // Test d'apos;analyse business
  console.log('apos;💰 Test analyse business:'apos;);
  const busRecs = await engine['apos;analyzeBusiness'apos;]();
  console.log(`  ${busRecs.length} recommandations business`);

  // Test d'apos;analyse technique
  console.log('apos;⚙️ Test analyse technique:'apos;);
  const techRecs = await engine['apos;analyzeTechnical'apos;]();
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
      console.log('apos;\n🎉 Tests terminés avec succès!'apos;);
      process.exit(0);
    })
    .catch((error) => {
      console.error('apos;\n💥 Erreur lors des tests:'apos;, error);
      process.exit(1);
    });
}
