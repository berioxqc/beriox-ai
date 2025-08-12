#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnostic des problèmes d\'authentification Vercel...\n');

// Vérifier la configuration actuelle
console.log('📋 Configuration actuelle:');

// 1. Vérifier vercel.json
const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
if (fs.existsSync(vercelConfigPath)) {
  const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
  console.log('✅ vercel.json trouvé');
  console.log('   - Version:', vercelConfig.version);
  console.log('   - Builds:', vercelConfig.builds?.length || 0);
  console.log('   - Headers:', vercelConfig.headers?.length || 0);
  console.log('   - Redirects:', vercelConfig.redirects?.length || 0);
  console.log('   - Rewrites:', vercelConfig.rewrites?.length || 0);
} else {
  console.log('❌ vercel.json manquant');
}

// 2. Vérifier les variables d'environnement
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasGoogleAuth = envContent.includes('GOOGLE_CLIENT_ID') && envContent.includes('GOOGLE_CLIENT_SECRET');
  const hasNextAuth = envContent.includes('NEXTAUTH_URL') && envContent.includes('NEXTAUTH_SECRET');
  
  console.log('✅ .env.local trouvé');
  console.log('   - Google OAuth configuré:', hasGoogleAuth ? '✅' : '❌');
  console.log('   - NextAuth configuré:', hasNextAuth ? '✅' : '❌');
} else {
  console.log('❌ .env.local manquant');
}

// 3. Vérifier la configuration NextAuth
const authPath = path.join(process.cwd(), 'src/lib/auth.ts');
if (fs.existsSync(authPath)) {
  const authContent = fs.readFileSync(authPath, 'utf8');
  const hasGoogleProvider = authContent.includes('GoogleProvider');
  const hasCallback = authContent.includes('callback/google');
  
  console.log('✅ auth.ts trouvé');
  console.log('   - GoogleProvider:', hasGoogleProvider ? '✅' : '❌');
  console.log('   - Callback Google:', hasCallback ? '✅' : '❌');
} else {
  console.log('❌ auth.ts manquant');
}

console.log('\n🔧 Solutions possibles:');

console.log('\n1. **Désactiver la protection Vercel**');
console.log('   Allez sur: https://vercel.com/dashboard');
console.log('   Sélectionnez votre projet → Settings → Security');
console.log('   Désactivez "Vercel Authentication" ou "Password Protection"');

console.log('\n2. **Configurer un domaine personnalisé**');
console.log('   Les domaines .vercel.app peuvent avoir une protection automatique');
console.log('   Ajoutez un domaine personnalisé dans Vercel Dashboard');

console.log('\n3. **Vérifier les paramètres de déploiement**');
console.log('   Allez sur: https://vercel.com/dashboard');
console.log('   Sélectionnez votre projet → Settings → General');
console.log('   Vérifiez "Password Protection" et "Vercel Authentication"');

console.log('\n4. **Tester avec un domaine différent**');
console.log('   Essayez d\'accéder via:');
console.log('   - https://votre-domaine-personnalise.com');
console.log('   - http://localhost:3000 (en local)');

console.log('\n5. **Vérifier les logs de déploiement**');
console.log('   Allez sur: https://vercel.com/dashboard');
console.log('   Sélectionnez votre projet → Deployments');
console.log('   Cliquez sur le dernier déploiement → Functions');
console.log('   Vérifiez les logs pour les erreurs d\'authentification');

console.log('\n6. **Configuration alternative**');
console.log('   Si le problème persiste, essayez:');
console.log('   - Désactiver temporairement le middleware');
console.log('   - Utiliser une route de test sans authentification');
console.log('   - Vérifier les variables d\'environnement Vercel');

console.log('\n🎯 Prochaines étapes recommandées:');
console.log('1. Vérifiez les paramètres de sécurité dans Vercel Dashboard');
console.log('2. Testez l\'application en local: npm run dev');
console.log('3. Configurez un domaine personnalisé si nécessaire');
console.log('4. Vérifiez les logs de déploiement pour plus de détails');

// Créer un fichier de test pour vérifier l'authentification
const testAuthPath = path.join(process.cwd(), 'src/app/api/auth/debug/route.ts');
const testAuthContent = `import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Route d\'authentification accessible',
    timestamp: new Date().toISOString(),
    headers: {
      host: request.headers.get('host'),
      origin: request.headers.get('origin'),
      userAgent: request.headers.get('user-agent')?.substring(0, 100)
    },
    env: {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET
    }
  })
}
`;

if (!fs.existsSync(path.dirname(testAuthPath))) {
  fs.mkdirSync(path.dirname(testAuthPath), { recursive: true });
}

fs.writeFileSync(testAuthPath, testAuthContent);
console.log('\n✅ Route de test créée: /api/auth/debug');

console.log('\n📝 Pour tester:');
console.log('curl https://beriox-p1ubwg0w2-beriox.vercel.app/api/auth/debug');
console.log('ou visitez: https://beriox-p1ubwg0w2-beriox.vercel.app/api/auth/debug');
