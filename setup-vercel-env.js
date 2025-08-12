#!/usr/bin/env node

const { execSync } = require('child_process');

// Variables d'environnement à configurer
const envVars = {
  // Authentification (OBLIGATOIRES)
  NEXTAUTH_SECRET: 'CxHw8OdMSG0lJG5pKhlLlb6xAlbFuGGsMQDCZz5LL9M=',
  NEXTAUTH_URL: 'https://beriox-4ttsa32vo-beriox.vercel.app',
  
  // Base de données (utilisez SQLite pour commencer)
  DATABASE_URL: 'file:./dev.db',
  
  // Google OAuth (à remplacer par vos vraies clés)
  GOOGLE_CLIENT_ID: 'VOTRE_GOOGLE_CLIENT_ID',
  GOOGLE_CLIENT_SECRET: 'VOTRE_GOOGLE_CLIENT_SECRET',
  
  // OpenAI (optionnel)
  OPENAI_API_KEY: 'VOTRE_OPENAI_API_KEY',
  
  // Stripe (optionnel)
  STRIPE_PUBLISHABLE_KEY: 'pk_test_VOTRE_CLE_STRIPE',
  STRIPE_SECRET_KEY: 'sk_test_VOTRE_CLE_STRIPE',
  
  // Email (optionnel)
  EMAIL_PROVIDER: 'resend',
  RESEND_API_KEY: 'VOTRE_CLE_RESEND',
  EMAIL_DEFAULT_TO: 'admin@beriox.ai'
};

console.log('🚀 Configuration automatique des variables Vercel...\n');

async function setupVercelEnv() {
  for (const [key, value] of Object.entries(envVars)) {
    try {
      console.log(`📝 Configuration de ${key}...`);
      
      // Utiliser echo pour passer la valeur à vercel env add
      const command = `echo "${value}" | npx vercel env add ${key} production preview development`;
      
      execSync(command, { 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      console.log(`✅ ${key} configuré avec succès`);
    } catch (error) {
      console.log(`⚠️  ${key} déjà configuré ou erreur: ${error.message}`);
    }
  }
  
  console.log('\n🎉 Configuration terminée !');
  console.log('\n📋 Prochaines étapes :');
  console.log('1. Configurez vos vraies clés Google OAuth');
  console.log('2. Ajoutez votre clé OpenAI si nécessaire');
  console.log('3. Redéployez l\'application : npx vercel --prod');
}

setupVercelEnv().catch(console.error);
