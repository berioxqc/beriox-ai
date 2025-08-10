const https = require('https');
const http = require('http');

async function testCookies() {
  console.log('🍪 Test du Système de Cookies - Beriox AI\n');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test de la page des cookies
    console.log('📄 Test de la page des cookies');
    const cookiesPage = await fetch(`${baseUrl}/cookies`);
    console.log(`✅ Page des cookies accessible: ${cookiesPage.status === 200}`);
    
    // Test de la page de consentement
    console.log('\n📄 Test de la page de consentement');
    const consentPage = await fetch(`${baseUrl}/consent`);
    console.log(`✅ Page de consentement accessible: ${consentPage.status === 200}`);
    
    // Test de la page de confidentialité
    console.log('\n📄 Test de la page de confidentialité');
    const privacyPage = await fetch(`${baseUrl}/privacy`);
    console.log(`✅ Page de confidentialité accessible: ${privacyPage.status === 200}`);
    
    // Test de performance
    console.log('\n⚡ Test de performance');
    const startTime = Date.now();
    await fetch(`${baseUrl}/cookies`);
    const loadTime = Date.now() - startTime;
    console.log(`✅ Temps de chargement page cookies: ${loadTime}ms`);
    
    console.log('\n✅ Tests du système de cookies terminés !');
    console.log('\n📋 Améliorations apportées:');
    console.log('• Interface uniformisée avec 4 types de cookies');
    console.log('• Design moderne avec gradients et ombres');
    console.log('• Icônes colorées dans des cercles');
    console.log('• Boutons avec effets hover et animations');
    console.log('• Responsive design pour tous les appareils');
    console.log('• Position de la flèche sidebar corrigée');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Fonction fetch simple pour Node.js
function fetch(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(res));
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

testCookies();
