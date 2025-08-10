#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Analyse des dépendances...\n');

// Fonction pour analyser les dépendances
function analyzeDependencies() {
  try {
    // Lire package.json
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const { dependencies, devDependencies } = packageJson;
    
    console.log('📦 Dépendances de production:', Object.keys(dependencies).length);
    console.log('🔧 Dépendances de développement:', Object.keys(devDependencies).length);
    
    // Analyser les dépendances lourdes
    const heavyDeps = [
      '@fortawesome/fontawesome-svg-core',
      '@fortawesome/free-solid-svg-icons',
      '@fortawesome/free-regular-svg-icons',
      'stripe',
      'openai',
      'next-auth',
      '@prisma/client',
      'bullmq',
      'ioredis'
    ];
    
    console.log('\n📊 Dépendances lourdes détectées:');
    heavyDeps.forEach(dep => {
      if (dependencies[dep] || devDependencies[dep]) {
        console.log(`  - ${dep}`);
      }
    });
    
    return { dependencies, devDependencies, heavyDeps };
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error.message);
    return null;
  }
}

// Fonction pour suggérer des optimisations
function suggestOptimizations(deps) {
  console.log('\n💡 Suggestions d\'optimisation:');
  
  const suggestions = [
    {
      type: 'FontAwesome',
      description: 'Utiliser l\'import dynamique pour FontAwesome',
      code: `// Au lieu de: import { faHome } from '@fortawesome/free-solid-svg-icons'
// Utiliser: const faHome = await import('@fortawesome/free-solid-svg-icons').then(m => m.faHome)`
    },
    {
      type: 'Stripe',
      description: 'Charger Stripe côté client uniquement',
      code: `// Utiliser: import { loadStripe } from '@stripe/stripe-js'
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)`
    },
    {
      type: 'Prisma',
      description: 'Optimiser les requêtes Prisma',
      code: `// Utiliser select pour limiter les champs
const user = await prisma.user.findUnique({
  where: { id },
  select: { id: true, email: true, name: true }
})`
    },
    {
      type: 'NextAuth',
      description: 'Configurer les providers dynamiquement',
      code: `// Charger les providers selon l'environnement
const providers = process.env.NODE_ENV === 'production' 
  ? [GoogleProvider] 
  : [GoogleProvider, CredentialsProvider]`
    }
  ];
  
  suggestions.forEach(suggestion => {
    console.log(`\n🔧 ${suggestion.type}:`);
    console.log(`   ${suggestion.description}`);
    console.log(`   ${suggestion.code}`);
  });
}

// Fonction pour nettoyer les dépendances inutilisées
function cleanUnusedDependencies() {
  console.log('\n🧹 Nettoyage des dépendances inutilisées...');
  
  try {
    // Vérifier les dépendances inutilisées
    execSync('npx depcheck --json', { stdio: 'pipe' });
    console.log('✅ Analyse des dépendances inutilisées terminée');
  } catch (error) {
    console.log('ℹ️  Installer depcheck: npm install -g depcheck');
  }
}

// Fonction pour optimiser les imports
function optimizeImports() {
  console.log('\n⚡ Optimisation des imports...');
  
  const optimizations = [
    {
      file: 'src/lib/icons.ts',
      description: 'Imports FontAwesome optimisés',
      before: `import { faHome, faTasks, faUsers, ... } from '@fortawesome/free-solid-svg-icons'`,
      after: `// Imports dynamiques pour réduire la taille du bundle
const iconImports = {
  home: () => import('@fortawesome/free-solid-svg-icons').then(m => m.faHome),
  tasks: () => import('@fortawesome/free-solid-svg-icons').then(m => m.faTasks),
  // ...
}`
    },
    {
      file: 'src/lib/stripe.ts',
      description: 'Import Stripe optimisé',
      before: `import Stripe from 'stripe'`,
      after: `// Import conditionnel pour éviter le chargement côté client
let Stripe;
if (typeof window === 'undefined') {
  Stripe = require('stripe');
}`
    }
  ];
  
  optimizations.forEach(opt => {
    console.log(`\n📝 ${opt.file}:`);
    console.log(`   ${opt.description}`);
    console.log(`   Avant: ${opt.before}`);
    console.log(`   Après: ${opt.after}`);
  });
}

// Fonction pour générer un rapport
function generateReport(deps) {
  const report = {
    timestamp: new Date().toISOString(),
    totalDeps: Object.keys(deps.dependencies).length + Object.keys(deps.devDependencies).length,
    productionDeps: Object.keys(deps.dependencies).length,
    devDeps: Object.keys(deps.devDependencies).length,
    heavyDeps: deps.heavyDeps.filter(dep => 
      deps.dependencies[dep] || deps.devDependencies[dep]
    ),
    recommendations: [
      'Utiliser les imports dynamiques pour FontAwesome',
      'Charger Stripe côté client uniquement',
      'Optimiser les requêtes Prisma avec select',
      'Configurer NextAuth dynamiquement',
      'Implémenter le code splitting pour les pages lourdes',
      'Utiliser React.lazy pour les composants volumineux'
    ]
  };
  
  fs.writeFileSync('dependency-analysis-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Rapport généré: dependency-analysis-report.json');
}

// Fonction principale
function main() {
  console.log('🚀 Optimisation des dépendances Beriox AI\n');
  
  const deps = analyzeDependencies();
  if (!deps) return;
  
  suggestOptimizations(deps);
  cleanUnusedDependencies();
  optimizeImports();
  generateReport(deps);
  
  console.log('\n✅ Analyse terminée!');
  console.log('\n📋 Prochaines étapes:');
  console.log('1. Implémenter les imports dynamiques');
  console.log('2. Configurer le code splitting');
  console.log('3. Optimiser les images avec next/image');
  console.log('4. Mettre en place le cache Redis');
  console.log('5. Configurer un CDN pour les assets statiques');
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = {
  analyzeDependencies,
  suggestOptimizations,
  cleanUnusedDependencies,
  optimizeImports,
  generateReport
};
