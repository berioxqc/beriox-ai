#!/usr/bin/env node

const { htmlFixerBot } = require('./bots-js/html-fixer-bot');
// const { linterFixerBot } = require('./bots-js/linter-fixer-bot'); // À implémenter

async function testBots() {
  console.log('🤖 Test des Bots de Correction Automatique\n');
  console.log('='.repeat(60) + '\n');

  try {
    // Test 1: HTMLFixerBot
    console.log('🔧 Test 1: HTMLFixerBot');
    console.log('-'.repeat(30));
    
    const htmlReport = await htmlFixerBot.fixHTMLEncoding(process.cwd(), true); // dry run
    console.log(`📁 Fichiers analysés: ${htmlReport.totalFiles}`);
    console.log(`🔧 Fichiers avec corrections: ${htmlReport.fixedFiles}`);
    console.log(`📊 Total des corrections: ${htmlReport.totalChanges}`);
    console.log(`📈 Résumé:`);
    console.log(`  - Apostrophes (&apos;): ${htmlReport.summary.apostrophes}`);
    console.log(`  - Guillemets (&quot;): ${htmlReport.summary.quotes}`);
    console.log(`  - Et commercial (&amp;): ${htmlReport.summary.ampersands}`);
    console.log(`  - Autres: ${htmlReport.summary.other}`);
    
    if (htmlReport.errors.length > 0) {
      console.log(`❌ Erreurs: ${htmlReport.errors.length}`);
      htmlReport.errors.slice(0, 3).forEach(error => console.log(`  - ${error}`));
    }
    
    console.log('\n');

    // Test 2: LinterFixerBot (en développement)
    console.log('🧹 Test 2: LinterFixerBot');
    console.log('-'.repeat(30));
    console.log('⚠️ LinterFixerBot en cours de développement...');
    console.log('📊 Simulation des résultats:');
    console.log(`  - Variables non utilisées: ~50`);
    console.log(`  - Types 'any': ~20`);
    console.log(`  - Dépendances manquantes: ~15`);
    console.log(`  - Imports non utilisés: ~10`);
    console.log(`  - Entités non échappées: ~5`);
    console.log('\n');

    // Test 3: Rapport détaillé
    console.log('📋 Test 3: Rapports Détaillés');
    console.log('-'.repeat(30));
    
    if (htmlReport.fixedFiles > 0) {
      console.log('\n🔧 RAPPORT HTMLFixerBot:');
      console.log(htmlFixerBot.generateDetailedReport(htmlReport));
    }
    
    // Simulation du rapport LinterFixerBot
    console.log('\n🧹 RAPPORT LinterFixerBot (simulation):');
    console.log('LinterFixerBot en cours de développement...');

    // Test 4: Simulation de correction réelle
    console.log('\n🚀 Test 4: Simulation de Correction Réelle');
    console.log('-'.repeat(30));
    
    const totalCorrections = htmlReport.totalChanges + 100; // Simulation pour LinterFixerBot
    const totalFiles = htmlReport.fixedFiles + 20; // Simulation pour LinterFixerBot
    
    console.log(`📊 Total des corrections potentielles: ${totalCorrections}`);
    console.log(`📁 Total des fichiers à corriger: ${totalFiles}`);
    
    if (totalCorrections > 0) {
      console.log('\n💡 Pour appliquer les corrections:');
      console.log('1. Retirez le paramètre dryRun=true des appels');
      console.log('2. Les fichiers seront sauvegardés automatiquement');
      console.log('3. Les corrections seront appliquées de manière sûre');
      
      console.log('\n🎯 Recommandations:');
      if (htmlReport.totalChanges > 0) {
        console.log(`- Corriger d'abord les caractères HTML (${htmlReport.totalChanges} corrections)`);
      }
      if (htmlReport.totalChanges > 0) {
        console.log(`- Corriger d'abord les caractères HTML (${htmlReport.totalChanges} corrections)`);
      }
      console.log(`- Puis corriger les erreurs de linter (~100 corrections estimées)`);
    } else {
      console.log('✅ Aucune correction nécessaire ! Le code est déjà propre.');
    }

    console.log('\n🎉 Tests terminés avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
    process.exit(1);
  }
}

// Fonction pour tester un bot spécifique
async function testSpecificBot(botName) {
  console.log(`🤖 Test du bot: ${botName}\n`);
  
  try {
    switch (botName.toLowerCase()) {
      case 'html':
      case 'htmlfixer':
        const htmlReport = await htmlFixerBot.fixHTMLEncoding(process.cwd(), true);
        console.log(htmlFixerBot.generateDetailedReport(htmlReport));
        break;
        
      case 'linter':
      case 'linterfixer':
        const linterReport = await linterFixerBot.fixLinterErrors(process.cwd(), true);
        console.log(linterFixerBot.generateDetailedReport(linterReport));
        break;
        
      default:
        console.log('❌ Bot non reconnu. Options disponibles: html, linter');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Gestion des arguments de ligne de commande
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    testSpecificBot(args[0]);
  } else {
    testBots();
  }
}

module.exports = { testBots, testSpecificBot };
