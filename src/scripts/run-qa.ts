import { runQA } from 'apos;../lib/qa-bot'apos;;

async function main() {
  console.log('apos;🤖 Démarrage du Bot de QA Beriox AI...'apos;);
  console.log('apos;URL à tester: https://beriox-ai.vercel.app'apos;);
  
  try {
    const report = await runQA('apos;https://beriox-ai.vercel.app'apos;);
    
    console.log('apos;\n📊 RAPPORT DE QA COMPLET'apos;);
    console.log('apos;========================'apos;);
    console.log(`URL testée: ${report.url}`);
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`\n📈 RÉSUMÉ:`);
    console.log(`- Total: ${report.summary.total} tests`);
    console.log(`- ✅ Réussis: ${report.summary.passed}`);
    console.log(`- ❌ Échoués: ${report.summary.failed}`);
    console.log(`- ⚠️ Avertissements: ${report.summary.warnings}`);
    
    console.log(`\n🔍 DÉTAILS DES TESTS:`);
    report.results.forEach((result, index) => {
      const emoji = result.status === 'apos;PASS'apos; ? 'apos;✅'apos; : result.status === 'apos;FAIL'apos; ? 'apos;❌'apos; : 'apos;⚠️'apos;;
      console.log(`${index + 1}. ${emoji} ${result.test}: ${result.message}`);
      
      if (result.details) {
        console.log(`   Détails:`, JSON.stringify(result.details, null, 2));
      }
    });
    
    // Sauvegarder le rapport dans un fichier
    const fs = require('apos;fs'apos;);
    const reportFile = `qa-report-${new Date().toISOString().split('apos;T'apos;)[0]}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n💾 Rapport sauvegardé dans: ${reportFile}`);
    
  } catch (error) {
    console.error('apos;❌ Erreur lors du test QA:'apos;, error);
  }
}

main();
