#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testOrchestration() {
  console.log('🧪 Test du système d\'orchestration IA...\n');

  try {
    // 1. Créer une mission de test
    console.log('1️⃣ Création d\'une mission de test...');
    const testMission = await prisma.mission.create({
      data: {
        objective: 'Créer une stratégie marketing pour une startup tech',
        context: 'Startup dans le domaine de l\'IA, besoin d\'une stratégie complète',
        priority: 'high',
        status: 'received',
        source: 'test',
        sourceEventId: `test-${Date.now()}`
      }
    });
    console.log(`✅ Mission créée: ${testMission.id}`);

    // 2. Tester l'API d'orchestration
    console.log('\n2️⃣ Test de l\'API d\'orchestration...');
    const response = await fetch('http://localhost:3000/api/missions/orchestrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ missionId: testMission.id }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Orchestration réussie !');
      console.log('📊 Résultats:');
      console.log(`   - Confiance: ${result.plan.confidence}%`);
      console.log(`   - Durée estimée: ${result.plan.estimatedDuration} minutes`);
      console.log(`   - Agents sélectionnés: ${result.plan.agents.map(a => a.name).join(', ')}`);
      console.log(`   - Risques identifiés: ${result.plan.risks.length}`);
      console.log(`   - Recommandations: ${result.recommendations?.length || 0}`);
    } else {
      console.log('❌ Erreur API:', response.status, response.statusText);
    }

    // 3. Vérifier les briefs créés
    console.log('\n3️⃣ Vérification des briefs créés...');
    const briefs = await prisma.brief.findMany({
      where: { missionId: testMission.id }
    });
    console.log(`✅ ${briefs.length} briefs créés`);

    // 4. Vérifier le plan d'orchestration
    console.log('\n4️⃣ Vérification du plan d\'orchestration...');
    const plan = await prisma.orchestrationPlan.findFirst({
      where: { missionId: testMission.id }
    });
    
    if (plan) {
      console.log('✅ Plan d\'orchestration sauvegardé');
      console.log(`   - Statut: ${plan.status}`);
      console.log(`   - Agents: ${plan.agents.join(', ')}`);
      console.log(`   - Confiance: ${plan.confidence}%`);
    } else {
      console.log('❌ Plan d\'orchestration non trouvé');
    }

    // 5. Nettoyer les données de test
    console.log('\n5️⃣ Nettoyage des données de test...');
    await prisma.brief.deleteMany({
      where: { missionId: testMission.id }
    });
    await prisma.orchestrationPlan.deleteMany({
      where: { missionId: testMission.id }
    });
    await prisma.mission.delete({
      where: { id: testMission.id }
    });
    console.log('✅ Données de test nettoyées');

    console.log('\n🎉 Test d\'orchestration terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le test
if (require.main === module) {
  testOrchestration();
}

module.exports = { testOrchestration };
