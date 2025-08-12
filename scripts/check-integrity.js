#!/usr/bin/env node

// 🔍 Script de Vérification d'Intégrité - Beriox AI
// Détecte et corrige les fichiers corrompus

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Patterns de corruption à détecter
const CORRUPTION_PATTERNS = [
  /'apos;/g,
  /&apos;apos;/g,
  /import.*'apos;/g,
  /from.*'apos;/g,
  /'apos;([^']+)'apos;/g,
  /"apos;([^"]+)"apos;/g
];

// Extensions de fichiers à vérifier
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

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
  log(`🔍 ${message}`, 'cyan');
}

/**
 * Récupère tous les fichiers source du projet
 */
function getAllSourceFiles(dir = 'src') {
  const files = [];
  
  function walkDir(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (FILE_EXTENSIONS.includes(path.extname(item))) {
        files.push(fullPath);
      }
    }
  }
  
  walkDir(dir);
  return files;
}

/**
 * Vérifie l'intégrité d'un fichier
 */
function checkFileIntegrity(filePath) {
  const issues = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier les patterns de corruption
    for (const pattern of CORRUPTION_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        issues.push({
          type: 'corruption',
          pattern: pattern.source,
          matches: matches.length,
          description: `Pattern de corruption détecté: ${pattern.source}`
        });
      }
    }
    
    // Vérifier les guillemets non fermés
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const singleQuotes = (line.match(/'/g) || []).length;
      const doubleQuotes = (line.match(/"/g) || []).length;
      
      if (singleQuotes % 2 !== 0) {
        issues.push({
          type: 'syntax',
          line: i + 1,
          description: 'Guillemets simples non fermés'
        });
      }
      
      if (doubleQuotes % 2 !== 0) {
        issues.push({
          type: 'syntax',
          line: i + 1,
          description: 'Guillemets doubles non fermés'
        });
      }
    }
    
  } catch (error) {
    issues.push({
      type: 'error',
      description: `Impossible de lire le fichier: ${error.message}`
    });
  }
  
  return issues;
}

/**
 * Corrige un fichier corrompu
 */
function fixCorruptedFile(filePath) {
  try {
    logStep(`Correction de ${filePath}...`);
    
    // Essayer de restaurer depuis Git
    try {
      execSync(`git checkout HEAD -- "${filePath}"`, { stdio: 'pipe' });
      logSuccess(`Fichier restauré depuis Git: ${filePath}`);
      return true;
    } catch (gitError) {
      logWarning(`Restauration Git échouée pour ${filePath}, tentative de correction manuelle...`);
      
      // Correction manuelle
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Corriger les apostrophes corrompues
      content = content.replace(/'apos;/g, "'");
      content = content.replace(/&apos;apos;/g, "'");
      
      // Corriger les chaînes corrompues
      content = content.replace(/'apos;([^']+)'apos;/g, "'$1'");
      content = content.replace(/"apos;([^"]+)"apos;/g, '"$1"');
      
      // Corriger les imports
      content = content.replace(/import\s+.*\s+from\s+['"]apos;([^'"]+)apos;['"]/g, "import $1 from '$1'");
      content = content.replace(/from\s+['"]apos;([^'"]+)apos;['"]/g, "from '$1'");
      
      // Écrire le fichier corrigé
      fs.writeFileSync(filePath, content, 'utf8');
      logSuccess(`Fichier corrigé manuellement: ${filePath}`);
      return true;
    }
  } catch (error) {
    logError(`Erreur lors de la correction de ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Fonction principale
 */
function main() {
  log('🔍 DÉMARRAGE DE LA VÉRIFICATION D\'INTÉGRITÉ', 'bold');
  log('');
  
  const files = getAllSourceFiles();
  logInfo(`📁 Fichiers à vérifier: ${files.length}`);
  log('');
  
  let totalIssues = 0;
  let corruptedFiles = 0;
  const filesToFix = [];
  
  // Vérifier chaque fichier
  for (const filePath of files) {
    const issues = checkFileIntegrity(filePath);
    
    if (issues.length > 0) {
      corruptedFiles++;
      totalIssues += issues.length;
      filesToFix.push(filePath);
      
      logError(`Problèmes détectés dans ${filePath}:`);
      issues.forEach(issue => {
        if (issue.line) {
          log(`  Ligne ${issue.line}: ${issue.description}`, 'yellow');
        } else {
          log(`  ${issue.description}`, 'yellow');
        }
      });
      log('');
    }
  }
  
  // Résumé
  log('📊 RÉSUMÉ DE LA VÉRIFICATION', 'bold');
  log(`📁 Fichiers analysés: ${files.length}`);
  log(`🚨 Fichiers corrompus: ${corruptedFiles}`);
  log(`⚠️ Problèmes détectés: ${totalIssues}`);
  log('');
  
  if (filesToFix.length > 0) {
    log('🔧 CORRECTION AUTOMATIQUE', 'bold');
    log('');
    
    let fixed = 0;
    let failed = 0;
    
    for (const filePath of filesToFix) {
      const success = fixCorruptedFile(filePath);
      if (success) {
        fixed++;
      } else {
        failed++;
      }
    }
    
    log('');
    log('📊 RÉSUMÉ DE LA CORRECTION', 'bold');
    log(`✅ Fichiers corrigés: ${fixed}`);
    log(`❌ Échecs: ${failed}`);
    log('');
    
    if (failed > 0) {
      logError('Certains fichiers n\'ont pas pu être corrigés automatiquement.');
      logInfo('Considérez une restauration manuelle depuis Git.');
    }
  } else {
    logSuccess('Aucun fichier corrompu détecté !');
  }
  
  log('');
  log('🎯 VÉRIFICATION TERMINÉE', 'bold');
}

// Exécuter si appelé directement
if (require.main === module) {
  main();
}

module.exports = {
  checkFileIntegrity,
  fixCorruptedFile,
  getAllSourceFiles
};
