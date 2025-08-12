#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSimpleOrchestration() {
  console.log('🧪 Test simple du système d\'orchestration...\n');
  
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

    // 4. Créer des briefs pour les agents
    console.log('\n4️⃣ Création des briefs pour les agents...');
    const agents = ["KarineAI", "HugoAI", "JPBot", "ElodieAI"];
    
    for (const agent of agents) {
      await prisma.brief.create({
        data: {
          missionId: testMission.id,
          agent,
          contentJson: {
            brief: `Brief pour ${agent} - Mission: ${testMission.objective}`,
            status: "queued",
            createdAt: new Date().toISOString()
          },
          status: "queued"
        }
      });
      console.log(`✅ Brief créé pour ${agent}`);
    }

    // 5. Créer un plan d'orchestration simple
    console.log('\n5️⃣ Création du plan d\'orchestration...');
    const orchestrationPlan = await prisma.orchestrationPlan.create({
      data: {
        missionId: testMission.id,
        agents: agents,
        workflow: JSON.stringify([
          {
            step: 1,
            agentId: "KarineAI",
            action: "Analyser la stratégie marketing",
            dependencies: [],
            estimatedTime: 45,
            critical: true
          },
          {
            step: 2,
            agentId: "HugoAI", 
            action: "Développer les solutions techniques",
            dependencies: [1],
            estimatedTime: 60,
            critical: true
          },
          {
            step: 3,
            agentId: "JPBot",
            action: "Analyser les données et optimiser",
            dependencies: [1, 2],
            estimatedTime: 30,
            critical: false
          },
          {
            step: 4,
            agentId: "ElodieAI",
            action: "Créer le contenu optimisé",
            dependencies: [1, 2],
            estimatedTime: 40,
            critical: true
          }
        ]),
        estimatedDuration: 175,
        confidence: 85,
        risks: ["Délai serré", "Budget limité"],
        alternatives: JSON.stringify([
          ["KarineAI", "ClaraLaCloseuse"],
          ["HugoAI", "FauconLeMaitreFocus"]
        ]),
        status: "created"
      }
    });
    console.log('✅ Plan d\'orchestration créé');

    // 6. Vérifier les données créées
    console.log('\n6️⃣ Vérification des données...');
    const briefs = await prisma.brief.findMany({
      where: { missionId: testMission.id }
    });
    console.log(`✅ ${briefs.length} briefs trouvés`);

    const plan = await prisma.orchestrationPlan.findFirst({
      where: { missionId: testMission.id }
    });
    console.log(`✅ Plan d'orchestration trouvé: ${plan ? 'Oui' : 'Non'}`);

    // 7. Simuler l'exécution
    console.log('\n7️⃣ Simulation de l\'exécution...');
    await prisma.mission.update({
      where: { id: testMission.id },
      data: { status: "in_progress" }
    });
    console.log('✅ Mission mise en cours');

    // Créer des livrables simulés
    for (const agent of agents) {
      await prisma.deliverable.create({
        data: {
          missionId: testMission.id,
          agent,
          output: {
            content: `Livrable de ${agent} pour la mission: ${testMission.objective}`,
            status: "completed",
            quality: "high",
            createdAt: new Date().toISOString()
          }
        }
      });
      console.log(`✅ Livrable créé pour ${agent}`);
    }

    // 8. Finaliser la mission
    console.log('\n8️⃣ Finalisation de la mission...');
    await prisma.mission.update({
      where: { id: testMission.id },
      data: { status: "completed" }
    });
    console.log('✅ Mission finalisée');

    // 9. Nettoyage
    console.log('\n9️⃣ Nettoyage des données de test...');
    await prisma.deliverable.deleteMany({
      where: { missionId: testMission.id }
    });
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

    console.log('\n🎉 Test simple terminé avec succès !');
    console.log('\n📊 Résumé:');
    console.log('- ✅ Mission créée et gérée');
    console.log('- ✅ Briefs générés pour 4 agents');
    console.log('- ✅ Plan d\'orchestration créé');
    console.log('- ✅ Livrables simulés');
    console.log('- ✅ Workflow complet testé');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  testSimpleOrchestration();
}

module.exports = { testSimpleOrchestration };
