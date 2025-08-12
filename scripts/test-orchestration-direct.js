#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const { AIOrchestrator } = require('../src/lib/ai-orchestration');

const prisma = new PrismaClient();

async function testOrchestrationDirect() {
  console.log('🧪 Test direct du système d\'orchestration IA...\n');
  
  try {
    // 1. Créer une mission de test
    console.log('1️⃣ Création d\'une mission de test...');
    const testMission = await prisma.mission.create({
      data: {
        objective: "Créer une stratégie marketing pour une startup tech",
        context: "Startup dans le domaine de l'IA, budget limité, cible B2B",
        priority: "high",
        source: "test",
        status: "received"
      }
    });
    console.log(`✅ Mission créée: ${testMission.id}`);

    // 2. Créer un utilisateur de test
    console.log('\n2️⃣ Création d\'un utilisateur de test...');
    const testUser = await prisma.user.create({
      data: {
        email: "test@orchestration.com",
        name: "Test User",
        role: "USER"
      }
    });
    console.log(`✅ Utilisateur créé: ${testUser.id}`);

    // 3. Associer la mission à l'utilisateur
    console.log('\n3️⃣ Association mission-utilisateur...');
    await prisma.mission.update({
      where: { id: testMission.id },
      data: { userId: testUser.id }
    });
    console.log('✅ Mission associée à l\'utilisateur');

    // 4. Tester l'orchestrateur directement
    console.log('\n4️⃣ Test de l\'orchestrateur IA...');
    const orchestrator = new AIOrchestrator();
    
    const missionContext = {
      objective: testMission.objective,
      context: testMission.context,
      priority: testMission.priority,
      expectedOutcome: "Livrables de qualité professionnelle"
    };

    const result = await orchestrator.orchestrateMission(testMission.id, missionContext);
    
    if (result.success) {
      console.log('✅ Orchestration réussie !');
      console.log(`📊 Confiance: ${result.plan?.confidence}%`);
      console.log(`⏱️ Durée estimée: ${result.plan?.estimatedDuration} minutes`);
      console.log(`🤖 Agents sélectionnés: ${result.plan?.agents.map(a => a.name).join(', ')}`);
      
      // 5. Exécuter le plan
      console.log('\n5️⃣ Exécution du plan...');
      const executionSuccess = await orchestrator.executePlan(result.plan);
      console.log(`✅ Exécution: ${executionSuccess ? 'Succès' : 'Échec'}`);
      
      // 6. Vérifier les briefs créés
      console.log('\n6️⃣ Vérification des briefs...');
      const briefs = await prisma.brief.findMany({
        where: { missionId: testMission.id }
      });
      console.log(`✅ ${briefs.length} briefs créés`);
      
      // 7. Vérifier le plan d'orchestration
      console.log('\n7️⃣ Vérification du plan d\'orchestration...');
      const plan = await prisma.orchestrationPlan.findFirst({
        where: { missionId: testMission.id }
      });
      
      if (plan) {
        console.log('✅ Plan d\'orchestration créé');
        console.log(`📋 Status: ${plan.status}`);
        console.log(`🎯 Agents: ${plan.agents.join(', ')}`);
      } else {
        console.log('❌ Plan d\'orchestration non trouvé');
      }
      
    } else {
      console.log('❌ Orchestration échouée:', result.error);
    }

    // 8. Nettoyage
    console.log('\n8️⃣ Nettoyage des données de test...');
    await prisma.brief.deleteMany({
      where: { missionId: testMission.id }
    });
    await prisma.orchestrationPlan.deleteMany({
      where: { missionId: testMission.id }
    });
    await prisma.mission.delete({
      where: { id: testMission.id }
    });
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    console.log('✅ Données de test nettoyées');

    console.log('\n🎉 Test direct terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  testOrchestrationDirect();
}

module.exports = { testOrchestrationDirect };
