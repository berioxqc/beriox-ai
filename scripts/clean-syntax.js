#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Nettoyage complet de la syntaxe...');

// Fonction pour nettoyer un fichier
function cleanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Corriger les entités HTML mal converties
    content = content.replace(/&apos;/g, "'");
    content = content.replace(/&quot;/g, '"');
    content = content.replace(/&lt;/g, '<');
    content = content.replace(/&gt;/g, '>');
    content = content.replace(/&amp;/g, '&');
    
    // Corriger les problèmes de guillemets dans les classes CSS
    content = content.replace(/after:content-\['"\]/g, "after:content-['']");
    content = content.replace(/after:content-\[""\]/g, "after:content-['']");
    
    // Corriger les problèmes de syntaxe JSX
    content = content.replace(/\s*;\s*$/gm, ''); // Supprimer les points-virgules en fin de ligne
    
    // Si le contenu a changé, l'écrire
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Corrigé: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Erreur avec ${filePath}:`, error.message);
    return false;
  }
}

// Fonction pour parcourir récursivement les dossiers
function cleanDirectory(dir) {
  const files = fs.readdirSync(dir);
  let cleanedCount = 0;
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      cleanedCount += cleanDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      if (cleanFile(filePath)) {
        cleanedCount++;
      }
    }
  }
  
  return cleanedCount;
}

// Nettoyer le dossier src
const srcDir = path.join(process.cwd(), 'src');
console.log(`📁 Nettoyage de ${srcDir}...`);

const cleanedFiles = cleanDirectory(srcDir);
console.log(`\n🎉 Nettoyage terminé! ${cleanedFiles} fichiers corrigés.`);

// Tester le build
console.log('\n🔨 Test du build...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build réussi!');
} catch (error) {
  console.log('❌ Build échoué, mais les fichiers ont été nettoyés.');
}
