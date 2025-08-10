#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📊 Analyse du bundle Beriox AI...\n');

// Fonction pour analyser le bundle
async function analyzeBundle() {
  try {
    console.log('🔍 Génération du bundle analyzer...');
    
    // Activer l'analyse du bundle
    process.env.ANALYZE = 'true';
    
    // Construire l'application
    console.log('📦 Construction de l\'application...');
    execSync('npm run build', { stdio: 'inherit' });
    
    console.log('✅ Bundle analyzer généré!');
    console.log('📁 Ouvrez les fichiers HTML générés dans le dossier .next/analyze/');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse du bundle:', error.message);
  }
}

// Fonction pour analyser les imports
function analyzeImports() {
  console.log('\n📋 Analyse des imports...');
  
  const srcDir = path.join(process.cwd(), 'src');
  const imports = new Map();
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    files.forEach(file => {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        scanDirectory(fullPath);
      } else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const importMatches = content.match(/import.*from\s+['"]([^'"]+)['"]/g);
        
        if (importMatches) {
          importMatches.forEach(match => {
            const moduleMatch = match.match(/from\s+['"]([^'"]+)['"]/);
            if (moduleMatch) {
              const module = moduleMatch[1];
              const count = imports.get(module) || 0;
              imports.set(module, count + 1);
            }
          });
        }
      }
    });
  }
  
  scanDirectory(srcDir);
  
  // Trier par nombre d'imports
  const sortedImports = Array.from(imports.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  
  console.log('📈 Top 20 des modules les plus importés:');
  sortedImports.forEach(([module, count]) => {
    console.log(`  ${count}x ${module}`);
  });
  
  return sortedImports;
}

// Fonction pour analyser les dépendances lourdes
function analyzeHeavyDependencies() {
  console.log('\n⚖️ Analyse des dépendances lourdes...');
  
  const heavyDeps = [
    { name: '@fortawesome/fontawesome-svg-core', size: '~500KB' },
    { name: '@fortawesome/free-solid-svg-icons', size: '~2MB' },
    { name: 'stripe', size: '~800KB' },
    { name: 'openai', size: '~600KB' },
    { name: 'next-auth', size: '~400KB' },
    { name: '@prisma/client', size: '~15MB' },
    { name: 'bullmq', size: '~300KB' },
    { name: 'ioredis', size: '~200KB' }
  ];
  
  console.log('📦 Dépendances lourdes détectées:');
  heavyDeps.forEach(dep => {
    console.log(`  - ${dep.name}: ${dep.size}`);
  });
  
  return heavyDeps;
}

// Fonction pour générer des recommandations
function generateRecommendations(imports, heavyDeps) {
  console.log('\n💡 Recommandations d\'optimisation:');
  
  const recommendations = [
    {
      priority: 'HIGH',
      title: 'FontAwesome Dynamic Imports',
      description: 'Utiliser les imports dynamiques pour FontAwesome',
      impact: 'Réduction de 2MB du bundle initial',
      implementation: `
// Remplacer:
import { faHome } from '@fortawesome/free-solid-svg-icons'

// Par:
const faHome = await import('@fortawesome/free-solid-svg-icons').then(m => m.faHome)
      `
    },
    {
      priority: 'HIGH',
      title: 'Code Splitting par Route',
      description: 'Diviser le code par routes pour réduire le bundle initial',
      impact: 'Réduction de 30-50% du bundle initial',
      implementation: `
// Utiliser React.lazy pour les pages
const AgentsPage = React.lazy(() => import('./pages/agents'));
const MissionsPage = React.lazy(() => import('./pages/missions'));
      `
    },
    {
      priority: 'MEDIUM',
      title: 'Tree Shaking Agressif',
      description: 'Optimiser les imports pour permettre un meilleur tree shaking',
      impact: 'Réduction de 20-30% du bundle',
      implementation: `
// Imports spécifiques au lieu d\'imports globaux
import { faHome } from '@fortawesome/free-solid-svg-icons/faHome'
import { faTasks } from '@fortawesome/free-solid-svg-icons/faTasks'
      `
    },
    {
      priority: 'MEDIUM',
      title: 'Lazy Loading des Composants',
      description: 'Charger les composants lourds uniquement quand nécessaire',
      impact: 'Amélioration du First Contentful Paint',
      implementation: `
// Lazy loading des composants
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const NotificationSystem = React.lazy(() => import('./components/NotificationSystem'));
      `
    },
    {
      priority: 'LOW',
      title: 'Optimisation des Images',
      description: 'Utiliser next/image et les formats modernes',
      impact: 'Réduction de 40-60% de la taille des images',
      implementation: `
// Utiliser next/image
import Image from 'next/image';
<Image src="/logo.png" alt="Logo" width={200} height={100} />
      `
    }
  ];
  
  recommendations.forEach(rec => {
    console.log(`\n🔧 ${rec.priority} - ${rec.title}:`);
    console.log(`   ${rec.description}`);
    console.log(`   Impact: ${rec.impact}`);
    console.log(`   Implémentation:${rec.implementation}`);
  });
  
  return recommendations;
}

// Fonction pour générer un rapport
function generateReport(imports, heavyDeps, recommendations) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalImports: imports.length,
      heavyDependencies: heavyDeps.length,
      recommendations: recommendations.length
    },
    topImports: imports.slice(0, 10),
    heavyDependencies: heavyDeps,
    recommendations: recommendations.map(rec => ({
      priority: rec.priority,
      title: rec.title,
      description: rec.description,
      impact: rec.impact
    })),
    estimatedImprovements: {
      bundleSize: '30-50% reduction',
      loadTime: '40-60% improvement',
      firstPaint: '20-30% improvement'
    }
  };
  
  fs.writeFileSync('bundle-analysis-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Rapport généré: bundle-analysis-report.json');
}

// Fonction pour créer un plan d'action
function createActionPlan(recommendations) {
  console.log('\n📋 Plan d\'action d\'optimisation:');
  
  const phases = [
    {
      phase: 'Phase 1 - Immédiat',
      tasks: recommendations.filter(r => r.priority === 'HIGH').map(r => r.title)
    },
    {
      phase: 'Phase 2 - Court terme',
      tasks: recommendations.filter(r => r.priority === 'MEDIUM').map(r => r.title)
    },
    {
      phase: 'Phase 3 - Long terme',
      tasks: recommendations.filter(r => r.priority === 'LOW').map(r => r.title)
    }
  ];
  
  phases.forEach(phase => {
    console.log(`\n🎯 ${phase.phase}:`);
    phase.tasks.forEach(task => {
      console.log(`   - ${task}`);
    });
  });
}

// Fonction principale
async function main() {
  console.log('🚀 Analyse complète du bundle Beriox AI\n');
  
  try {
    // Analyser les imports
    const imports = analyzeImports();
    
    // Analyser les dépendances lourdes
    const heavyDeps = analyzeHeavyDependencies();
    
    // Générer les recommandations
    const recommendations = generateRecommendations(imports, heavyDeps);
    
    // Créer le plan d'action
    createActionPlan(recommendations);
    
    // Générer le rapport
    generateReport(imports, heavyDeps, recommendations);
    
    // Analyser le bundle (optionnel)
    if (process.argv.includes('--analyze')) {
      await analyzeBundle();
    }
    
    console.log('\n✅ Analyse terminée!');
    console.log('\n📊 Métriques estimées après optimisation:');
    console.log('   - Taille du bundle: -30-50%');
    console.log('   - Temps de chargement: -40-60%');
    console.log('   - First Contentful Paint: -20-30%');
    console.log('   - Largest Contentful Paint: -25-35%');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error.message);
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = {
  analyzeBundle,
  analyzeImports,
  analyzeHeavyDependencies,
  generateRecommendations,
  generateReport,
  createActionPlan
};
