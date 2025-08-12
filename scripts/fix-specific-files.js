#!/usr/bin/env node

// 🔧 Script de Correction Spécifique - Beriox AI
// Corrige les fichiers problématiques identifiés

const fs = require('fs');
const path = require('path');

// Fichiers à corriger (mis à jour avec tous les fichiers problématiques)
const FILES_TO_FIX = [
  'src/components/AccessGuard.tsx',
  'src/components/AdminGuard.tsx',
  'src/components/AuthGuard.tsx',
  'src/components/FormOptimizer.tsx',
  'src/components/Layout.tsx',
  'src/components/Breadcrumb.tsx',
  'src/components/Navigation.tsx',
  'src/components/Sidebar.tsx',
  'src/components/TimeTrackingDashboard.tsx',
  'src/components/TrialBanner.tsx'
];

function fixFile(filePath) {
  console.log(`🔧 Correction de ${filePath}...`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Corriger les apostrophes corrompues dans les chaînes
    content = content.replace(/'apos;([^']+)'apos;/g, "'$1'");
    content = content.replace(/"apos;([^"]+)"apos;/g, '"$1"');
    
    // Corriger les imports
    content = content.replace(/import\s+.*\s+from\s+['"]apos;([^'"]+)apos;['"]/g, "import $1 from '$1'");
    content = content.replace(/from\s+['"]apos;([^'"]+)apos;['"]/g, "from '$1'");
    
    // Corriger les chaînes simples
    content = content.replace(/'apos;/g, "'");
    content = content.replace(/&apos;apos;/g, "'");
    
    // Corriger les commentaires
    content = content.replace(/\/\/.*'apos;/g, (match) => {
      return match.replace(/'apos;/g, "'");
    });
    
    // Corriger les chaînes dans les expressions JSX
    content = content.replace(/\{([^}]*?)'apos;([^}]*?)\}/g, (match, before, after) => {
      return `{${before}'${after}}`;
    });
    
    // Corriger les chaînes dans les attributs JSX
    content = content.replace(/=['"]apos;([^'"]+)apos;['"]/g, "='$1'");
    
    // Écrire le fichier corrigé
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${filePath} corrigé`);
    
  } catch (error) {
    console.error(`❌ Erreur lors de la correction de ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🔧 DÉMARRAGE DE LA CORRECTION SPÉCIFIQUE');
  console.log('');
  
  for (const filePath of FILES_TO_FIX) {
    if (fs.existsSync(filePath)) {
      fixFile(filePath);
    } else {
      console.log(`⚠️ Fichier non trouvé: ${filePath}`);
    }
  }
  
  console.log('');
  console.log('🎯 CORRECTION SPÉCIFIQUE TERMINÉE');
}

main();
