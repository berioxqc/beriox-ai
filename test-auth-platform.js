#!/usr/bin/env node

/**
 * Script de test pour vérifier la structure de la plateforme d'authentification
 * Beriox AI - Vérification complète de l'architecture d'authentification
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 Vérification de la plateforme d\'authentification Beriox AI\n');

// Configuration des tests
const tests = {
  structure: {
    name: 'Structure des dossiers',
    checks: [
      { path: 'src/app/auth', type: 'directory', required: true },
      { path: 'src/app/api/auth', type: 'directory', required: true },
      { path: 'src/lib/auth.ts', type: 'file', required: true },
      { path: 'src/lib/email.ts', type: 'file', required: true },
      { path: 'src/middleware.ts', type: 'file', required: true },
      { path: 'prisma/schema.prisma', type: 'file', required: true },
    ]
  },
  authPages: {
    name: 'Pages d\'authentification',
    checks: [
      { path: 'src/app/auth/signin/page.tsx', type: 'file', required: true },
      { path: 'src/app/auth/signup/page.tsx', type: 'file', required: true },
      { path: 'src/app/auth/forgot-password/page.tsx', type: 'file', required: true },
      { path: 'src/app/auth/reset-password/page.tsx', type: 'file', required: true },
      { path: 'src/app/auth/verify/page.tsx', type: 'file', required: true },
      { path: 'src/app/auth/error/page.tsx', type: 'file', required: true },
    ]
  },
  apiRoutes: {
    name: 'Routes API d\'authentification',
    checks: [
      { path: 'src/app/api/auth/[...nextauth]/route.ts', type: 'file', required: true },
      { path: 'src/app/api/auth/register/route.ts', type: 'file', required: true },
      { path: 'src/app/api/auth/verify/route.ts', type: 'file', required: true },
      { path: 'src/app/api/auth/forgot-password/route.ts', type: 'file', required: true },
      { path: 'src/app/api/auth/reset-password/route.ts', type: 'file', required: true },
    ]
  },
  components: {
    name: 'Composants d\'authentification',
    checks: [
      { path: 'src/components/SessionProvider.tsx', type: 'file', required: true },
      { path: 'src/components/AuthGuard.tsx', type: 'file', required: false },
    ]
  },
  database: {
    name: 'Schéma de base de données',
    checks: [
      { path: 'prisma/schema.prisma', type: 'file', required: true },
    ]
  }
};

// Fonction pour vérifier l'existence d'un fichier/dossier
function checkPath(filePath, type, required) {
  const fullPath = path.join(process.cwd(), filePath);
  const exists = fs.existsSync(fullPath);
  
  if (type === 'directory') {
    const isDirectory = exists && fs.statSync(fullPath).isDirectory();
    return { exists: isDirectory, type: 'directory' };
  } else {
    const isFile = exists && fs.statSync(fullPath).isFile();
    return { exists: isFile, type: 'file' };
  }
}

// Fonction pour analyser le contenu d'un fichier
function analyzeFile(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    return { content, size: content.length };
  } catch (error) {
    return { content: null, size: 0, error: error.message };
  }
}

// Fonction pour vérifier les dépendances dans package.json
function checkDependencies() {
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    const requiredDeps = [
      'next-auth',
      'bcryptjs',
      'nodemailer',
      '@prisma/client',
      '@auth/prisma-adapter'
    ];
    
    const missingDeps = requiredDeps.filter(dep => 
      !packageContent.dependencies?.[dep] && !packageContent.devDependencies?.[dep]
    );
    
    return { missing: missingDeps, allPresent: missingDeps.length === 0 };
  } catch (error) {
    return { missing: [], allPresent: false, error: error.message };
  }
}

// Fonction pour vérifier les variables d'environnement
function checkEnvironmentVariables() {
  const requiredVars = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'DATABASE_URL',
    'EMAIL_SERVER_USER',
    'EMAIL_SERVER_PASSWORD'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  return { missing: missingVars, allPresent: missingVars.length === 0 };
}

// Exécution des tests
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let warnings = 0;

console.log('📁 Vérification de la structure...\n');

// Tests de structure
Object.entries(tests).forEach(([testKey, test]) => {
  console.log(`\n🔍 ${test.name}:`);
  
  test.checks.forEach(check => {
    totalTests++;
    const result = checkPath(check.path, check.type, check.required);
    
    if (result.exists) {
      console.log(`  ✅ ${check.path} - ${check.type} présent`);
      passedTests++;
      
      // Analyse supplémentaire pour les fichiers importants
      if (check.type === 'file' && check.required) {
        const analysis = analyzeFile(check.path);
        if (analysis.content) {
          if (check.path.includes('auth.ts') && analysis.content.includes('NextAuth')) {
            console.log(`    📝 Configuration NextAuth détectée`);
          }
          if (check.path.includes('schema.prisma') && analysis.content.includes('model User')) {
            console.log(`    🗄️ Modèle User détecté dans le schéma`);
          }
          if (check.path.includes('email.ts') && analysis.content.includes('nodemailer')) {
            console.log(`    📧 Configuration email détectée`);
          }
        }
      }
    } else if (check.required) {
      console.log(`  ❌ ${check.path} - ${check.type} manquant (REQUIS)`);
      failedTests++;
    } else {
      console.log(`  ⚠️ ${check.path} - ${check.type} manquant (optionnel)`);
      warnings++;
    }
  });
});

// Vérification des dépendances
console.log('\n📦 Vérification des dépendances...');
const depsCheck = checkDependencies();
if (depsCheck.allPresent) {
  console.log('  ✅ Toutes les dépendances d\'authentification sont présentes');
  passedTests++;
} else {
  console.log('  ❌ Dépendances manquantes:', depsCheck.missing.join(', '));
  failedTests++;
}
totalTests++;

// Vérification des variables d'environnement
console.log('\n🔧 Vérification des variables d\'environnement...');
const envCheck = checkEnvironmentVariables();
if (envCheck.allPresent) {
  console.log('  ✅ Toutes les variables d\'environnement sont configurées');
  passedTests++;
} else {
  console.log('  ⚠️ Variables manquantes:', envCheck.missing.join(', '));
  warnings++;
}
totalTests++;

// Analyse du schéma de base de données
console.log('\n🗄️ Analyse du schéma de base de données...');
const schemaAnalysis = analyzeFile('prisma/schema.prisma');
if (schemaAnalysis.content) {
  const hasUserModel = schemaAnalysis.content.includes('model User');
  const hasPasswordField = schemaAnalysis.content.includes('password');
  const hasEmailVerified = schemaAnalysis.content.includes('emailVerified');
  const hasVerificationToken = schemaAnalysis.content.includes('model VerificationToken');
  
  if (hasUserModel) {
    console.log('  ✅ Modèle User présent');
    passedTests++;
  } else {
    console.log('  ❌ Modèle User manquant');
    failedTests++;
  }
  
  if (hasPasswordField) {
    console.log('  ✅ Champ password présent');
    passedTests++;
  } else {
    console.log('  ❌ Champ password manquant');
    failedTests++;
  }
  
  if (hasEmailVerified) {
    console.log('  ✅ Champ emailVerified présent');
    passedTests++;
  } else {
    console.log('  ❌ Champ emailVerified manquant');
    failedTests++;
  }
  
  if (hasVerificationToken) {
    console.log('  ✅ Modèle VerificationToken présent');
    passedTests++;
  } else {
    console.log('  ❌ Modèle VerificationToken manquant');
    failedTests++;
  }
  
  totalTests += 4;
} else {
  console.log('  ❌ Impossible de lire le schéma Prisma');
  failedTests++;
  totalTests++;
}

// Résumé final
console.log('\n' + '='.repeat(60));
console.log('📊 RÉSUMÉ DE LA VÉRIFICATION');
console.log('='.repeat(60));
console.log(`Tests totaux: ${totalTests}`);
console.log(`✅ Réussis: ${passedTests}`);
console.log(`❌ Échoués: ${failedTests}`);
console.log(`⚠️ Avertissements: ${warnings}`);
console.log(`📈 Taux de réussite: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (failedTests === 0) {
  console.log('\n🎉 La plateforme d\'authentification est bien structurée !');
  console.log('✅ Tous les composants essentiels sont en place.');
} else {
  console.log('\n⚠️ Des problèmes ont été détectés dans la structure.');
  console.log('🔧 Veuillez corriger les éléments manquants avant de continuer.');
}

if (warnings > 0) {
  console.log('\n💡 Recommandations:');
  console.log('- Configurez les variables d\'environnement manquantes');
  console.log('- Vérifiez que tous les composants optionnels sont implémentés si nécessaire');
}

console.log('\n🚀 Prochaine étape: Lancer le QA Bot d\'authentification');
console.log('   Commande: node -e "require(\'./src/lib/auth-qa-bot.ts\').runAuthQA(\'https://beriox-ai.vercel.app\')"');
