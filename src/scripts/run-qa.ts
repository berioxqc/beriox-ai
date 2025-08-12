import { runQA } from '../lib/qa-bot';

async function main() {
  console.log('🤖 Démarrage du Bot de QA Beriox AI...');
  console.log('URL à tester: https://beriox-ai.vercel.app');
  
  try {
    const report = await runQA('https://beriox-ai.vercel.app');
    
    console.log('\n📊 RAPPORT DE QA COMPLET');
    console.log('========================');
    console.log(`URL testée: ${report.url}`);
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`\n📈 RÉSUMÉ:`);
    console.log(`- Total: ${report.summary.total} tests`);
    console.log(`- ✅ Réussis: ${report.summary.passed}`);
    console.log(`- ❌ Échoués: ${report.summary.failed}`);
    console.log(`- ⚠️ Avertissements: ${report.summary.warnings}`);
    
    console.log(`\n🔍 DÉTAILS DES TESTS:`);
    report.results.forEach((result, index) => {
      const emoji = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${index + 1}. ${emoji} ${result.test}: ${result.message}`);
      
      if (result.details) {
        console.log(`   Détails:`, JSON.stringify(result.details, null, 2));
      }
    });
    
    // Sauvegarder le rapport dans un fichier
    const fs = require('fs');
    const reportFile = `qa-report-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n💾 Rapport sauvegardé dans: ${reportFile}`);
    
  } catch (error) {
    console.error('❌ Erreur lors du test QA:', error);
  }
}

main();
