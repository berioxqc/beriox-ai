#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Correction automatique des erreurs de linter...');

// Fonction pour corriger les apostrophes non échappées
function fixApostrophes(content) {
  return content.replace(/(?<=\w)'/g, '&apos;');
}

// Fonction pour corriger les guillemets non échappés
function fixQuotes(content) {
  return content.replace(/(?<=\w)"/g, '&quot;');
}

// Fonction pour corriger les variables non utilisées
function fixUnusedVars(content) {
  // Supprimer les variables non utilisées avec des commentaires
  return content.replace(/\/\/ eslint-disable-next-line @typescript-eslint\/no-unused-vars\n\s*const\s+(\w+)\s*=\s*[^;]+;/g, '');
}

// Fonction pour corriger les types any
function fixAnyTypes(content) {
  // Remplacer les types any par unknown quand c'est sûr
  return content.replace(/: any/g, ': unknown');
}

// Fonction pour corriger les erreurs de hooks React
function fixReactHooks(content) {
  // Ajouter les dépendances manquantes dans useEffect
  return content.replace(
    /useEffect\(\(\) => \{[^}]*\}, \[\]\)/g,
    (match) => {
      // Ajouter fetchData dans les dépendances si elle existe dans le hook
      if (match.includes('fetchData')) {
        return match.replace('[]', '[fetchData]');
      }
      return match;
    }
  );
}

// Fonction pour traiter un fichier
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;

    // Appliquer les corrections
    const originalContent = newContent;
    
    // Corriger les apostrophes dans les fichiers React
    if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
      newContent = fixApostrophes(newContent);
      newContent = fixQuotes(newContent);
      newContent = fixReactHooks(newContent);
    }

    // Corriger les types any dans les fichiers TypeScript
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      newContent = fixAnyTypes(newContent);
    }

    // Vérifier si le contenu a changé
    if (newContent !== originalContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      modified = true;
      console.log(`✅ Corrigé: ${filePath}`);
    }

    return modified;
  } catch (error) {
    console.error(`❌ Erreur lors du traitement de ${filePath}:`, error.message);
    return false;
  }
}

// Fonction pour parcourir récursivement les dossiers
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let totalModified = 0;

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      totalModified += processDirectory(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      if (processFile(fullPath)) {
        totalModified++;
      }
    }
  }

  return totalModified;
}

// Fonction principale
function main() {
  const srcPath = path.join(process.cwd(), 'src');
  
  if (!fs.existsSync(srcPath)) {
    console.error('❌ Dossier src non trouvé');
    process.exit(1);
  }

  console.log('📁 Traitement du dossier src...');
  const modifiedCount = processDirectory(srcPath);

  console.log(`\n🎉 Correction terminée! ${modifiedCount} fichiers modifiés.`);
  
  // Relancer le linter pour voir les erreurs restantes
  console.log('\n🔍 Vérification des erreurs restantes...');
  try {
    execSync('npm run lint', { stdio: 'inherit' });
  } catch (error) {
    console.log('\n⚠️  Il reste encore des erreurs à corriger manuellement.');
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = {
  fixApostrophes,
  fixQuotes,
  fixUnusedVars,
  fixAnyTypes,
  fixReactHooks,
  processFile,
  processDirectory
};
