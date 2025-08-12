#!/usr/bin/env node

const { htmlFixerBot } = require('./bots-js/html-fixer-bot');

async function applyHTMLFixes() {
  console.log('🔧 Application des corrections HTML...\n');
  
  try {
    // Appliquer les corrections en mode réel (dryRun = false)
    const report = await htmlFixerBot.fixHTMLEncoding(process.cwd(), false);
    
    console.log('\n✅ CORRECTIONS APPLIQUÉES AVEC SUCCÈS !\n');
    console.log(htmlFixerBot.generateDetailedReport(report));
    
    console.log('\n🎯 PROCHAINES ÉTAPES:');
    console.log('1. Vérifier que le code fonctionne toujours');
    console.log('2. Tester avec: npm run lint');
    console.log('3. Si tout va bien, commiter les changements');
    console.log('4. Continuer avec les autres bots de correction');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'application des corrections:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  applyHTMLFixes();
}

module.exports = { applyHTMLFixes };
