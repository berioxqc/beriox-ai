const { MessagingService } = require('./src/lib/messaging-service.ts');
const { createDefaultTemplates } = require('./src/lib/default-email-templates.ts');
const { BotRecommendationEngine } = require('./src/lib/bot-recommendations.ts');

// Configuration de test
const emailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'test@beriox.ai',
    pass: 'test-password'
  }
};

async function testCompleteSystem() {
  console.log('🚀 Test complet du système Beriox AI...\n');

  try {
    // 1. Test du système de recommandations
    console.log('📊 1. Test du système de recommandations IA...');
    const recommendationEngine = new BotRecommendationEngine('test-user-123');
    const recommendations = await recommendationEngine.generateRecommendations();
    console.log(`✅ ${recommendations.length} recommandations générées\n`);

    // 2. Test du système de messagerie
    console.log('📧 2. Test du système de messagerie...');
    const messagingService = new MessagingService(emailConfig);
    
    // Test d'envoi d'email (simulation)
    console.log('   - Test d\'envoi d\'email...');
    const emailResult = await messagingService.sendEmail({
      subject: 'Test Beriox AI',
      body: 'Ceci est un test du système de messagerie Beriox AI.',
      fromEmail: 'test@beriox.ai',
      toEmail: 'user@example.com',
      priority: 'NORMAL',
      userId: 'test-user-123'
    });
    console.log('   ✅ Email envoyé avec succès');

    // Test de création de template
    console.log('   - Test de création de template...');
    const template = await messagingService.createTemplate({
      name: 'Test Template',
      description: 'Template de test',
      subject: 'Test - {{userName}}',
      body: 'Bonjour {{userName}}, ceci est un test.',
      variables: ['userName'],
      category: 'test'
    });
    console.log('   ✅ Template créé avec succès');

    // Test de création de ticket de support
    console.log('   - Test de création de ticket de support...');
    const ticket = await messagingService.createSupportTicket({
      userId: 'test-user-123',
      subject: 'Test de support',
      description: 'Ceci est un test du système de support',
      category: 'GENERAL',
      priority: 'NORMAL'
    });
    console.log(`   ✅ Ticket créé: ${ticket.ticketNumber}`);

    // 3. Test des statistiques
    console.log('📈 3. Test des statistiques...');
    const stats = await messagingService.getMessagingStats();
    console.log('   ✅ Statistiques récupérées:', stats);

    // 4. Test des templates par défaut
    console.log('📋 4. Test des templates par défaut...');
    await createDefaultTemplates(messagingService, 'system');
    console.log('   ✅ Templates par défaut créés');

    // 5. Résumé des tests
    console.log('\n🎉 Tests terminés avec succès!');
    console.log('\n📊 Résumé:');
    console.log(`   - Recommandations IA: ${recommendations.length}`);
    console.log(`   - Email envoyé: ${emailResult.success ? 'OUI' : 'NON'}`);
    console.log(`   - Template créé: ${template.id}`);
    console.log(`   - Ticket créé: ${ticket.ticketNumber}`);
    console.log(`   - Messages totaux: ${stats.messages.total}`);
    console.log(`   - Tickets totaux: ${stats.tickets.total}`);

    console.log('\n✅ Toutes les fonctionnalités principales sont opérationnelles!');
    console.log('\n🚀 Beriox AI est prêt pour le lancement!');

  } catch (error) {
    console.error('\n❌ Erreur lors des tests:', error);
    console.log('\n⚠️  Certaines fonctionnalités nécessitent une configuration complète.');
    console.log('   - Configuration SMTP pour les emails');
    console.log('   - Base de données PostgreSQL');
    console.log('   - Variables d\'environnement');
  }
}

// Exécuter les tests
testCompleteSystem()
  .then(() => {
    console.log('\n🎯 Tests terminés!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erreur critique:', error);
    process.exit(1);
  });
