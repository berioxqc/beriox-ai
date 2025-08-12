#!/usr/bin/env node

// 🚀 Script de Correction Massive - Beriox AI
// Corrige TOUS les fichiers corrompus en une seule fois

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Couleurs pour la console
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️ ${message}`, 'blue');
}

function logStep(message) {
  log(`🔧 ${message}`, 'cyan');
}

/**
 * Récupère tous les fichiers source
 */
function getAllSourceFiles(dir = 'src') {
  const files = [];
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  
  function walkDir(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (extensions.includes(path.extname(item))) {
        files.push(fullPath);
      }
    }
  }
  
  walkDir(dir);
  return files;
}

/**
 * Vérifie si un fichier contient des apostrophes corrompues
 */
function hasCorruptedApostrophes(content) {
  return content.includes('apos;') || content.includes('&apos;');
}

/**
 * Corrige un fichier corrompu
 */
function fixCorruptedFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (!hasCorruptedApostrophes(content)) {
      return false; // Pas de corruption détectée
    }
    
    // Sauvegarder le fichier original
    const backupPath = `${filePath}.backup`;
    fs.writeFileSync(backupPath, content, 'utf8');
    
    // Corriger les apostrophes corrompues
    let originalContent = content;
    
    // Remplacer tous les patterns corrompus
    content = content.replace(/'apos;/g, "'");
    content = content.replace(/&apos;apos;/g, "'");
    content = content.replace(/'apos;([^']+)'apos;/g, "'$1'");
    content = content.replace(/"apos;([^"]+)"apos;/g, '"$1"');
    
    // Corriger les imports
    content = content.replace(/import\s+.*\s+from\s+['"]apos;([^'"]+)apos;['"]/g, "import $1 from '$1'");
    content = content.replace(/from\s+['"]apos;([^'"]+)apos;['"]/g, "from '$1'");
    
    // Corriger les chaînes dans les expressions JSX
    content = content.replace(/\{([^}]*?)'apos;([^}]*?)\}/g, (match, before, after) => {
      return `{${before}'${after}}`;
    });
    
    // Corriger les attributs JSX
    content = content.replace(/=['"]apos;([^'"]+)apos;['"]/g, "='$1'");
    
    // Corriger les commentaires
    content = content.replace(/\/\/.*'apos;/g, (match) => {
      return match.replace(/'apos;/g, "'");
    });
    
    // Écrire le fichier corrigé
    fs.writeFileSync(filePath, content, 'utf8');
    
    // Vérifier si la correction a fonctionné
    if (hasCorruptedApostrophes(content)) {
      // Restaurer le backup si la correction a échoué
      fs.writeFileSync(filePath, originalContent, 'utf8');
      fs.unlinkSync(backupPath);
      return false;
    }
    
    // Supprimer le backup si tout va bien
    fs.unlinkSync(backupPath);
    return true;
    
  } catch (error) {
    logError(`Erreur lors de la correction de ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Fonction principale
 */
function main() {
  log('🚀 DÉMARRAGE DE LA CORRECTION MASSIVE', 'bold');
  log('Cette opération va corriger TOUS les fichiers corrompus...', 'yellow');
  log('');
  
  const files = getAllSourceFiles();
  logInfo(`📁 Fichiers à analyser: ${files.length}`);
  log('');
  
  let corruptedFiles = 0;
  let fixedFiles = 0;
  let failedFiles = 0;
  const corruptedFileList = [];
  
  // Analyser tous les fichiers
  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (hasCorruptedApostrophes(content)) {
        corruptedFiles++;
        corruptedFileList.push(filePath);
        logWarning(`Corruption détectée: ${filePath}`);
      }
    } catch (error) {
      logError(`Impossible de lire ${filePath}: ${error.message}`);
    }
  }
  
  log('');
  log('📊 ANALYSE TERMINÉE', 'bold');
  log(`🚨 Fichiers corrompus détectés: ${corruptedFiles}`);
  log('');
  
  if (corruptedFiles === 0) {
    logSuccess('Aucun fichier corrompu détecté !');
    return;
  }
  
  // Demander confirmation
  log('🔧 DÉMARRAGE DE LA CORRECTION...', 'bold');
  log('');
  
  // Corriger tous les fichiers corrompus
  for (const filePath of corruptedFileList) {
    logStep(`Correction de ${filePath}...`);
    
    const success = fixCorruptedFile(filePath);
    
    if (success) {
      fixedFiles++;
      logSuccess(`✅ ${filePath} corrigé`);
    } else {
      failedFiles++;
      logError(`❌ Échec de correction: ${filePath}`);
    }
  }
  
  log('');
  log('📊 RÉSUMÉ DE LA CORRECTION MASSIVE', 'bold');
  log(`📁 Fichiers analysés: ${files.length}`);
  log(`🚨 Fichiers corrompus détectés: ${corruptedFiles}`);
  log(`✅ Fichiers corrigés: ${fixedFiles}`);
  log(`❌ Échecs: ${failedFiles}`);
  log('');
  
  if (failedFiles > 0) {
    logWarning('Certains fichiers n\'ont pas pu être corrigés automatiquement.');
    logInfo('Considérez une restauration manuelle depuis Git.');
  } else {
    logSuccess('🎉 TOUS LES FICHIERS ONT ÉTÉ CORRIGÉS AVEC SUCCÈS !');
  }
  
  log('');
  log('🎯 CORRECTION MASSIVE TERMINÉE', 'bold');
}

// Exécuter si appelé directement
if (require.main === module) {
  main();
}

module.exports = {
  fixCorruptedFile,
  hasCorruptedApostrophes,
  getAllSourceFiles
};
