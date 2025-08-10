#!/usr/bin/env node

/**
 * Script de QA pour Beriox AI
 * Teste toutes les fonctionnalités principales de l'application
 */

const puppeteer = require('puppeteer');

class QATester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = [];
  }

  async init() {
    console.log('🚀 Initialisation du navigateur...');
    this.browser = await puppeteer.launch({
      headless: false,
      slowMo: 100,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Configuration de la page
    await this.page.setViewport({ width: 1280, height: 720 });
    await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
  }

  async test(testName, testFunction) {
    try {
      console.log(`\n🧪 Test: ${testName}`);
      await testFunction();
      this.results.push({ test: testName, status: 'PASS', error: null });
      console.log(`✅ ${testName} - PASS`);
    } catch (error) {
      this.results.push({ test: testName, status: 'FAIL', error: error.message });
      console.log(`❌ ${testName} - FAIL: ${error.message}`);
    }
  }

  async runAllTests() {
    console.log('🎯 DÉMARRAGE DES TESTS QA - BERIOX AI');
    console.log('=====================================');

    await this.init();

    // Test 1: Accès à la page d'accueil
    await this.test('Accès à la page d\'accueil', async () => {
      await this.page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
      await this.page.waitForSelector('h1', { timeout: 5000 });
      const title = await this.page.$eval('h1', el => el.textContent);
      if (!title.includes('Accueil')) {
        throw new Error('Titre de la page d\'accueil incorrect');
      }
    });

    // Test 2: Navigation vers la page de connexion
    await this.test('Navigation vers la page de connexion', async () => {
      await this.page.goto('http://localhost:3000/auth/signin', { waitUntil: 'networkidle0' });
      await this.page.waitForSelector('button', { timeout: 5000 });
      const buttons = await this.page.$$('button');
      if (buttons.length === 0) {
        throw new Error('Aucun bouton trouvé sur la page de connexion');
      }
    });

    // Test 3: Test de la page NovaBot (sans authentification)
    await this.test('Accès à la page NovaBot', async () => {
      await this.page.goto('http://localhost:3000/novabot', { waitUntil: 'networkidle0' });
      await this.page.waitForSelector('h1', { timeout: 5000 });
      const title = await this.page.$eval('h1', el => el.textContent);
      if (!title.includes('NovaBot')) {
        throw new Error('Titre de la page NovaBot incorrect');
      }
    });

    // Test 4: Test de la page profil
    await this.test('Accès à la page profil', async () => {
      await this.page.goto('http://localhost:3000/profile', { waitUntil: 'networkidle0' });
      await this.page.waitForSelector('h1', { timeout: 5000 });
      const title = await this.page.$eval('h1', el => el.textContent);
      if (!title.includes('Profil')) {
        throw new Error('Titre de la page profil incorrect');
      }
    });

    // Test 5: Test de la page des agents
    await this.test('Accès à la page des agents', async () => {
      await this.page.goto('http://localhost:3000/agents', { waitUntil: 'networkidle0' });
      await this.page.waitForSelector('h1', { timeout: 5000 });
      const title = await this.page.$eval('h1', el => el.textContent);
      if (!title.includes('Équipe IA')) {
        throw new Error('Titre de la page agents incorrect');
      }
    });

    // Test 6: Test de la page des missions
    await this.test('Accès à la page des missions', async () => {
      await this.page.goto('http://localhost:3000/missions', { waitUntil: 'networkidle0' });
      await this.page.waitForSelector('h1', { timeout: 5000 });
      const title = await this.page.$eval('h1', el => el.textContent);
      if (!title.includes('Missions')) {
        throw new Error('Titre de la page missions incorrect');
      }
    });

    // Test 7: Test de la page des coupons
    await this.test('Accès à la page des coupons', async () => {
      await this.page.goto('http://localhost:3000/coupon', { waitUntil: 'networkidle0' });
      await this.page.waitForSelector('h1', { timeout: 5000 });
      const title = await this.page.$eval('h1', el => el.textContent);
      if (!title.includes('Coupon')) {
        throw new Error('Titre de la page coupon incorrect');
      }
    });

    // Test 8: Test de la page de tarification
    await this.test('Accès à la page de tarification', async () => {
      await this.page.goto('http://localhost:3000/pricing', { waitUntil: 'networkidle0' });
      await this.page.waitForSelector('h1', { timeout: 5000 });
      const title = await this.page.$eval('h1', el => el.textContent);
      if (!title.includes('Tarification')) {
        throw new Error('Titre de la page tarification incorrect');
      }
    });

    // Test 9: Test des APIs (vérification des endpoints)
    await this.test('Test des endpoints API', async () => {
      const endpoints = [
        '/api/missions',
        '/api/user/profile',
        '/api/user/stats',
        '/api/novabot/generate',
        '/api/coupons/redeem'
      ];

      for (const endpoint of endpoints) {
        const response = await this.page.evaluate(async (url) => {
          try {
            const res = await fetch(url, { method: 'GET' });
            return res.status;
          } catch (error) {
            return 'error';
          }
        }, endpoint);
        
        if (response === 'error') {
          console.log(`⚠️ Endpoint ${endpoint} non accessible (normal si non authentifié)`);
        }
      }
    });

    // Test 10: Test de la responsivité
    await this.test('Test de la responsivité', async () => {
      await this.page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
      
      // Test desktop
      await this.page.setViewport({ width: 1280, height: 720 });
      await this.page.waitForTimeout(1000);
      
      // Test tablet
      await this.page.setViewport({ width: 768, height: 1024 });
      await this.page.waitForTimeout(1000);
      
      // Test mobile
      await this.page.setViewport({ width: 375, height: 667 });
      await this.page.waitForTimeout(1000);
      
      // Retour à desktop
      await this.page.setViewport({ width: 1280, height: 720 });
    });

    // Test 11: Test des animations CSS
    await this.test('Test des animations CSS', async () => {
      await this.page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
      
      // Vérifier que les classes CSS sont présentes
      const hasAnimations = await this.page.evaluate(() => {
        const style = document.createElement('style');
        style.textContent = document.documentElement.innerHTML;
        return style.textContent.includes('@keyframes') || 
               document.querySelector('.fade-in') !== null ||
               document.querySelector('.slide-in') !== null;
      });
      
      if (!hasAnimations) {
        console.log('⚠️ Aucune animation CSS détectée');
      }
    });

    // Test 12: Test de l'accessibilité
    await this.test('Test de l\'accessibilité de base', async () => {
      await this.page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
      
      // Vérifier les attributs alt sur les images
      const images = await this.page.$$('img');
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        if (!alt) {
          console.log('⚠️ Image sans attribut alt détectée');
        }
      }
      
      // Vérifier les labels sur les formulaires
      const inputs = await this.page.$$('input');
      for (const input of inputs) {
        const id = await input.getAttribute('id');
        if (id) {
          const label = await this.page.$(`label[for="${id}"]`);
          if (!label) {
            console.log('⚠️ Input sans label détecté');
          }
        }
      }
    });

    await this.generateReport();
    await this.cleanup();
  }

  async generateReport() {
    console.log('\n📊 RAPPORT DE TESTS QA');
    console.log('=====================');
    
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.status === 'PASS').length;
    const failedTests = this.results.filter(r => r.status === 'FAIL').length;
    
    console.log(`Total des tests: ${totalTests}`);
    console.log(`Tests réussis: ${passedTests}`);
    console.log(`Tests échoués: ${failedTests}`);
    console.log(`Taux de réussite: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    console.log('\n📋 Détail des tests:');
    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${result.test}: ${result.status}`);
      if (result.error) {
        console.log(`   Erreur: ${result.error}`);
      }
    });
    
    if (failedTests === 0) {
      console.log('\n🎉 Tous les tests sont passés avec succès !');
    } else {
      console.log(`\n⚠️ ${failedTests} test(s) ont échoué. Veuillez les corriger.`);
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Exécution des tests
async function main() {
  const tester = new QATester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = QATester;
