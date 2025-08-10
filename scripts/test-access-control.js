#!/usr/bin/env node

/**
 * Test du système de contrôle d'accès
 * Beriox AI
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 Test du système de contrôle d\'accès...\n');

// Tests à effectuer
const tests = [
  {
    name: 'Fichier de contrôle d\'accès',
    file: 'src/lib/access-control.ts',
    check: (content) => {
      const checks = [
        content.includes('export interface UserPermissions'),
        content.includes('export interface RouteConfig'),
        content.includes('export const ROUTE_CONFIGS'),
        content.includes('export function hasRouteAccess'),
        content.includes('export function getVisibleRoutes'),
        content.includes('export function getAccessDeniedMessage')
      ];
      return checks.every(check => check);
    }
  },
  {
    name: 'Composant AccessGuard',
    file: 'src/components/AccessGuard.tsx',
    check: (content) => {
      const checks = [
        content.includes('export default function AccessGuard'),
        content.includes('hasRouteAccess'),
        content.includes('getAccessDeniedMessage'),
        content.includes('premiumOnly'),
        content.includes('superAdminOnly')
      ];
      return checks.every(check => check);
    }
  },
  {
    name: 'Navigation mise à jour',
    file: 'src/components/Navigation.tsx',
    check: (content) => {
      const checks = [
        content.includes('getVisibleRoutes'),
        content.includes('UserPermissions'),
        content.includes('fetchUserPermissions')
      ];
      return checks.every(check => check);
    }
  },
  {
    name: 'Menu mobile mis à jour',
    file: 'src/components/MobileMenu.tsx',
    check: (content) => {
      const checks = [
        content.includes('getVisibleRoutes'),
        content.includes('UserPermissions'),
        content.includes('fetchUserPermissions')
      ];
      return checks.every(check => check);
    }
  },
  {
    name: 'Page Time Tracking protégée',
    file: 'src/app/time-tracking/page.tsx',
    check: (content) => {
      const checks = [
        content.includes('AccessGuard'),
        content.includes('premiumOnly={true}')
      ];
      return checks.every(check => check);
    }
  },
  {
    name: 'Page Form Optimization protégée',
    file: 'src/app/form-optimization/page.tsx',
    check: (content) => {
      const checks = [
        content.includes('AccessGuard'),
        content.includes('premiumOnly={true}')
      ];
      return checks.every(check => check);
    }
  },
  {
    name: 'Page Competitors protégée',
    file: 'src/app/competitors/page.tsx',
    check: (content) => {
      const checks = [
        content.includes('AccessGuard'),
        content.includes('requiredPlan={[\'competitor-intelligence\', \'enterprise\']}')
      ];
      return checks.every(check => check);
    }
  },
  {
    name: 'API Super-Admin Users',
    file: 'src/app/api/super-admin/users/route.ts',
    check: (content) => {
      const checks = [
        content.includes('session?.user?.email !== \'info@beriox.ca\''),
        content.includes('withRateLimit'),
        content.includes('getServerSession')
      ];
      return checks.every(check => check);
    }
  },
  {
    name: 'API Super-Admin Role Update',
    file: 'src/app/api/super-admin/users/role/route.ts',
    check: (content) => {
      const checks = [
        content.includes('session?.user?.email !== \'info@beriox.ca\''),
        content.includes('withRateLimit'),
        content.includes('PUT'),
        content.includes('role')
      ];
      return checks.every(check => check);
    }
  }
];

// Fonction pour lire un fichier
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

// Exécuter les tests
let passedTests = 0;
let totalTests = tests.length;

tests.forEach((test, index) => {
  console.log(`📋 Test ${index + 1}/${totalTests}: ${test.name}`);
  
  const content = readFile(test.file);
  
  if (!content) {
    console.log(`   ❌ Fichier non trouvé: ${test.file}`);
    return;
  }
  
  const passed = test.check(content);
  
  if (passed) {
    console.log(`   ✅ Réussi`);
    passedTests++;
  } else {
    console.log(`   ❌ Échoué`);
  }
});

// Résumé
console.log(`\n📊 Résumé des tests:`);
console.log(`   ✅ Tests réussis: ${passedTests}/${totalTests}`);
console.log(`   ❌ Tests échoués: ${totalTests - passedTests}/${totalTests}`);

if (passedTests === totalTests) {
  console.log(`\n🎉 Tous les tests sont passés ! Le système de contrôle d'accès est correctement configuré.`);
} else {
  console.log(`\n⚠️  Certains tests ont échoué. Vérifiez la configuration du système de contrôle d'accès.`);
}

// Générer un rapport
const report = {
  timestamp: new Date().toISOString(),
  totalTests,
  passedTests,
  failedTests: totalTests - passedTests,
  successRate: (passedTests / totalTests) * 100,
  tests: tests.map((test, index) => {
    const content = readFile(test.file);
    return {
      name: test.name,
      file: test.file,
      passed: content ? test.check(content) : false,
      exists: !!content
    };
  })
};

fs.writeFileSync('access-control-test-report.json', JSON.stringify(report, null, 2));
console.log(`\n📄 Rapport généré: access-control-test-report.json`);

process.exit(passedTests === totalTests ? 0 : 1);
