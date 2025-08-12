#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Démarrage du mode développement (linter ignoré)...\n');

// Fonction pour créer un fichier .eslintrc temporaire qui ignore les erreurs
function createTempEslintConfig() {
  const tempConfig = {
    extends: ['next/core-web-vitals'],
    rules: {
      // Désactiver temporairement les règles problématiques
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react/no-unescaped-entities': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/rules-of-hooks': 'off',
      '@next/next/no-html-link-for-pages': 'off',
      'prefer-const': 'off',
      '@typescript-eslint/no-require-imports': 'off'
    }
  };

  const configPath = path.join(process.cwd(), '.eslintrc.temp.json');
  fs.writeFileSync(configPath, JSON.stringify(tempConfig, null, 2));
  console.log('✅ Configuration ESLint temporaire créée');
  return configPath;
}

// Fonction pour nettoyer la configuration temporaire
function cleanupTempConfig(configPath) {
  if (fs.existsSync(configPath)) {
    fs.unlinkSync(configPath);
    console.log('🧹 Configuration ESLint temporaire nettoyée');
  }
}

// Fonction pour démarrer le serveur de développement
function startDevServer() {
  console.log('🌐 Démarrage du serveur de développement...\n');
  
  const devProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });

  devProcess.on('close', (code) => {
    console.log(`\n📴 Serveur de développement arrêté (code: ${code})`);
  });

  return devProcess;
}

// Fonction principale
async function main() {
  const tempConfigPath = createTempEslintConfig();
  
  // Gestion de l'arrêt propre
  process.on('SIGINT', () => {
    console.log('\n🛑 Arrêt en cours...');
    cleanupTempConfig(tempConfigPath);
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Arrêt en cours...');
    cleanupTempConfig(tempConfigPath);
    process.exit(0);
  });

  // Démarrer le serveur
  const devProcess = startDevServer();

  // Attendre que le processus se termine
  devProcess.on('exit', () => {
    cleanupTempConfig(tempConfigPath);
  });
}

// Exécuter le script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });
}

module.exports = { main };
