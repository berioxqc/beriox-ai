#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la configuration Google OAuth...\n');

// Vérifier les variables d'environnement
const envPath = path.join(process.cwd(), '.env.local');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.log('⚠️  Fichier .env.local non trouvé');
}

// Extraire les variables importantes
const googleClientId = envContent.match(/GOOGLE_CLIENT_ID=(.+)/)?.[1];
const googleClientSecret = envContent.match(/GOOGLE_CLIENT_SECRET=(.+)/)?.[1];
const nextAuthUrl = envContent.match(/NEXTAUTH_URL=(.+)/)?.[1];
const nextAuthSecret = envContent.match(/NEXTAUTH_SECRET=(.+)/)?.[1];

console.log('📋 Configuration actuelle:');
console.log(`✅ GOOGLE_CLIENT_ID: ${googleClientId ? '✅ Configuré' : '❌ Manquant'}`);
console.log(`✅ GOOGLE_CLIENT_SECRET: ${googleClientSecret ? '✅ Configuré' : '❌ Manquant'}`);
console.log(`✅ NEXTAUTH_URL: ${nextAuthUrl || '❌ Manquant'}`);
console.log(`✅ NEXTAUTH_SECRET: ${nextAuthSecret ? '✅ Configuré' : '❌ Manquant'}`);

// URLs de redirection recommandées pour Google Console
console.log('\n🌐 URLs de redirection à configurer dans Google Console:');
console.log('📝 Allez sur: https://console.cloud.google.com/apis/credentials');
console.log('📝 Sélectionnez votre projet et cliquez sur votre OAuth 2.0 Client ID');
console.log('📝 Dans "Authorized redirect URIs", ajoutez:');

const baseUrls = [
  'http://localhost:3000',
  'https://beriox-4quln7u9o-beriox.vercel.app',
  'https://beriox-gkif60yz0-beriox.vercel.app'
];

baseUrls.forEach(baseUrl => {
  console.log(`   ${baseUrl}/api/auth/callback/google`);
});

console.log('\n🔧 URLs JavaScript autorisées:');
baseUrls.forEach(baseUrl => {
  console.log(`   ${baseUrl}`);
});

console.log('\n📝 URLs de déconnexion autorisées:');
baseUrls.forEach(baseUrl => {
  console.log(`   ${baseUrl}/auth/signout`);
});

console.log('\n💡 Conseils:');
console.log('1. Assurez-vous que NEXTAUTH_URL correspond à votre domaine de production');
console.log('2. Vérifiez que toutes les URLs de redirection sont ajoutées dans Google Console');
console.log('3. Le callback Google doit être: /api/auth/callback/google');
console.log('4. En développement, utilisez: http://localhost:3000');
console.log('5. En production, utilisez votre domaine Vercel');

// Vérifier la configuration NextAuth
console.log('\n🔍 Vérification de la configuration NextAuth...');
const authPath = path.join(process.cwd(), 'src/lib/auth.ts');
try {
  const authContent = fs.readFileSync(authPath, 'utf8');
  
  if (authContent.includes('GoogleProvider')) {
    console.log('✅ GoogleProvider configuré dans auth.ts');
  } else {
    console.log('❌ GoogleProvider manquant dans auth.ts');
  }
  
  if (authContent.includes('callback/google')) {
    console.log('✅ Callback Google configuré');
  } else {
    console.log('❌ Callback Google manquant');
  }
  
} catch (error) {
  console.log('❌ Impossible de lire auth.ts');
}

console.log('\n🎯 Prochaines étapes:');
console.log('1. Vérifiez la configuration dans Google Console');
console.log('2. Testez la connexion en local: npm run dev');
console.log('3. Déployez et testez en production');
console.log('4. Vérifiez les logs Vercel pour les erreurs');
