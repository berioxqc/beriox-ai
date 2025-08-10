#!/usr/bin/env node

/**
 * Script d'audit de sécurité pour Beriox AI
 * Vérifie les vulnérabilités potentielles et les bonnes pratiques de sécurité
 */

const fs = require('fs');
const path = require('path');

class SecurityAuditor {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.recommendations = [];
  }

  addIssue(severity, category, message, file = null, line = null) {
    this.issues.push({
      severity,
      category,
      message,
      file,
      line,
      timestamp: new Date().toISOString()
    });
  }

  addWarning(category, message, file = null) {
    this.warnings.push({
      category,
      message,
      file,
      timestamp: new Date().toISOString()
    });
  }

  addRecommendation(category, message) {
    this.recommendations.push({
      category,
      message,
      timestamp: new Date().toISOString()
    });
  }

  async auditEnvironmentVariables() {
    console.log('🔍 Audit des variables d\'environnement...');
    
    const envFile = path.join(process.cwd(), '.env');
    const envExampleFile = path.join(process.cwd(), '.env.example');
    
    // Vérifier si .env existe
    if (fs.existsSync(envFile)) {
      const envContent = fs.readFileSync(envFile, 'utf8');
      
      // Vérifier les clés sensibles
      const sensitiveKeys = [
        'OPENAI_API_KEY',
        'DATABASE_URL',
        'NEXTAUTH_SECRET',
        'STRIPE_SECRET_KEY',
        'GOOGLE_CLIENT_SECRET'
      ];
      
      sensitiveKeys.forEach(key => {
        if (envContent.includes(key)) {
          if (envContent.includes(`${key}=`)) {
            this.addIssue('HIGH', 'ENV', `Variable d'environnement ${key} trouvée dans .env`);
          }
        }
      });
      
      // Vérifier les valeurs par défaut dangereuses
      if (envContent.includes('password') || envContent.includes('secret')) {
        this.addWarning('ENV', 'Mots-clés sensibles détectés dans .env');
      }
    } else {
      this.addIssue('MEDIUM', 'ENV', 'Fichier .env manquant');
    }
    
    // Vérifier .env.example
    if (fs.existsSync(envExampleFile)) {
      this.addRecommendation('ENV', 'Fichier .env.example présent - bonne pratique');
    } else {
      this.addIssue('LOW', 'ENV', 'Fichier .env.example manquant');
    }
  }

  async auditDependencies() {
    console.log('📦 Audit des dépendances...');
    
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Vérifier les dépendances de développement en production
      if (packageJson.dependencies) {
        const devDepsInProd = [
          'puppeteer',
          'jest',
          'cypress',
          'eslint',
          'prettier'
        ];
        
        devDepsInProd.forEach(dep => {
          if (packageJson.dependencies[dep]) {
            this.addWarning('DEPS', `Dépendance de développement ${dep} en production`);
          }
        });
      }
      
      // Vérifier les versions des dépendances critiques
      const criticalDeps = {
        'next': '14.0.0',
        'react': '18.0.0',
        'prisma': '5.0.0'
      };
      
      Object.entries(criticalDeps).forEach(([dep, minVersion]) => {
        if (packageJson.dependencies[dep]) {
          const version = packageJson.dependencies[dep];
          if (version.startsWith('^') || version.startsWith('~')) {
            this.addWarning('DEPS', `Version de ${dep} utilise un range - risque de vulnérabilités`);
          }
        }
      });
    }
  }

  async auditCodeSecurity() {
    console.log('🔒 Audit de la sécurité du code...');
    
    const srcPath = path.join(process.cwd(), 'src');
    if (fs.existsSync(srcPath)) {
      await this.scanDirectory(srcPath);
    }
  }

  async scanDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        await this.scanDirectory(filePath);
      } else if (stat.isFile() && this.isCodeFile(file)) {
        await this.scanFile(filePath);
      }
    }
  }

  isCodeFile(filename) {
    const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json'];
    return codeExtensions.some(ext => filename.endsWith(ext));
  }

  async scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Vérifier les patterns dangereux
    const dangerousPatterns = [
      {
        pattern: /eval\s*\(/,
        message: 'Usage de eval() détecté - risque de sécurité',
        severity: 'HIGH'
      },
      {
        pattern: /innerHTML\s*=/,
        message: 'Usage de innerHTML détecté - risque XSS',
        severity: 'MEDIUM'
      },
      {
        pattern: /document\.write\s*\(/,
        message: 'Usage de document.write() détecté - risque XSS',
        severity: 'MEDIUM'
      },
      {
        pattern: /localStorage\s*\[/,
        message: 'Usage de localStorage avec clés dynamiques',
        severity: 'LOW'
      },
      {
        pattern: /console\.log\s*\(/,
        message: 'Console.log détecté - à retirer en production',
        severity: 'LOW'
      }
    ];
    
    dangerousPatterns.forEach(({ pattern, message, severity }) => {
      const matches = content.match(pattern);
      if (matches) {
        this.addIssue(severity, 'CODE', message, relativePath);
      }
    });
    
    // Vérifier les bonnes pratiques
    const goodPatterns = [
      {
        pattern: /getServerSession/,
        message: 'getServerSession utilisé - bonne pratique'
      },
      {
        pattern: /prisma\..*\.findUnique/,
        message: 'Prisma findUnique utilisé - bonne pratique'
      },
      {
        pattern: /NextResponse\.json/,
        message: 'NextResponse.json utilisé - bonne pratique'
      }
    ];
    
    goodPatterns.forEach(({ pattern, message }) => {
      if (content.match(pattern)) {
        this.addRecommendation('CODE', message);
      }
    });
  }

  async auditAPISecurity() {
    console.log('🌐 Audit de la sécurité des APIs...');
    
    const apiPath = path.join(process.cwd(), 'src/app/api');
    if (fs.existsSync(apiPath)) {
      await this.scanAPIDirectory(apiPath);
    }
  }

  async scanAPIDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        await this.scanAPIDirectory(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        await this.scanAPIFile(filePath);
      }
    }
  }

  async scanAPIFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Vérifier l'authentification
    if (!content.includes('getServerSession') && !content.includes('authOptions')) {
      this.addIssue('HIGH', 'API', 'Route API sans authentification', relativePath);
    }
    
    // Vérifier la validation des données
    if (content.includes('req.json()') && !content.includes('zod') && !content.includes('validation')) {
      this.addWarning('API', 'Données JSON non validées', relativePath);
    }
    
    // Vérifier les erreurs SQL
    if (content.includes('prisma.') && !content.includes('try') && !content.includes('catch')) {
      this.addWarning('API', 'Opérations Prisma sans gestion d\'erreur', relativePath);
    }
    
    // Vérifier les bonnes pratiques
    if (content.includes('NextResponse.json')) {
      this.addRecommendation('API', 'NextResponse.json utilisé correctement');
    }
    
    if (content.includes('getServerSession')) {
      this.addRecommendation('API', 'Authentification côté serveur utilisée');
    }
  }

  async auditDatabaseSecurity() {
    console.log('🗄️ Audit de la sécurité de la base de données...');
    
    const prismaPath = path.join(process.cwd(), 'prisma/schema.prisma');
    if (fs.existsSync(prismaPath)) {
      const content = fs.readFileSync(prismaPath, 'utf8');
      
      // Vérifier les relations
      if (content.includes('@relation')) {
        this.addRecommendation('DB', 'Relations Prisma définies');
      }
      
      // Vérifier les contraintes
      if (content.includes('@unique') || content.includes('@id')) {
        this.addRecommendation('DB', 'Contraintes de base de données définies');
      }
      
      // Vérifier les types de données
      if (content.includes('String') && !content.includes('@db.Text')) {
        this.addWarning('DB', 'Considérer @db.Text pour les champs longs');
      }
    }
  }

  async auditAuthentication() {
    console.log('🔐 Audit de l\'authentification...');
    
    const authPath = path.join(process.cwd(), 'src/app/api/auth');
    if (fs.existsSync(authPath)) {
      const files = fs.readdirSync(authPath);
      
      if (files.some(f => f.includes('nextauth'))) {
        this.addRecommendation('AUTH', 'NextAuth.js configuré');
        
        // Vérifier la configuration NextAuth
        const nextAuthFile = path.join(authPath, files.find(f => f.includes('nextauth')));
        if (nextAuthFile && fs.existsSync(nextAuthFile) && fs.statSync(nextAuthFile).isFile()) {
          const content = fs.readFileSync(nextAuthFile, 'utf8');
          
          if (content.includes('providers')) {
            this.addRecommendation('AUTH', 'Fournisseurs d\'authentification configurés');
          }
          
          if (content.includes('callbacks')) {
            this.addRecommendation('AUTH', 'Callbacks NextAuth configurés');
          }
        }
      }
    }
  }

  async generateReport() {
    console.log('\n📊 RAPPORT D\'AUDIT DE SÉCURITÉ');
    console.log('==============================');
    
    const totalIssues = this.issues.length;
    const highIssues = this.issues.filter(i => i.severity === 'HIGH').length;
    const mediumIssues = this.issues.filter(i => i.severity === 'MEDIUM').length;
    const lowIssues = this.issues.filter(i => i.severity === 'LOW').length;
    
    console.log(`\n🚨 Problèmes de sécurité:`);
    console.log(`   Critique: ${highIssues}`);
    console.log(`   Moyen: ${mediumIssues}`);
    console.log(`   Faible: ${lowIssues}`);
    console.log(`   Total: ${totalIssues}`);
    
    if (highIssues > 0) {
      console.log('\n❌ PROBLÈMES CRITIQUES:');
      this.issues.filter(i => i.severity === 'HIGH').forEach(issue => {
        console.log(`   - ${issue.message} ${issue.file ? `(${issue.file})` : ''}`);
      });
    }
    
    if (mediumIssues > 0) {
      console.log('\n⚠️ PROBLÈMES MOYENS:');
      this.issues.filter(i => i.severity === 'MEDIUM').forEach(issue => {
        console.log(`   - ${issue.message} ${issue.file ? `(${issue.file})` : ''}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️ AVERTISSEMENTS:');
      this.warnings.forEach(warning => {
        console.log(`   - ${warning.message} ${warning.file ? `(${warning.file})` : ''}`);
      });
    }
    
    if (this.recommendations.length > 0) {
      console.log('\n✅ BONNES PRATIQUES DÉTECTÉES:');
      this.recommendations.forEach(rec => {
        console.log(`   - ${rec.message}`);
      });
    }
    
    // Score de sécurité
    const maxScore = 100;
    let score = maxScore;
    score -= highIssues * 20;
    score -= mediumIssues * 10;
    score -= lowIssues * 5;
    score = Math.max(0, score);
    
    console.log(`\n🎯 Score de sécurité: ${score}/${maxScore}`);
    
    if (score >= 80) {
      console.log('🟢 Excellent niveau de sécurité');
    } else if (score >= 60) {
      console.log('🟡 Niveau de sécurité acceptable');
    } else {
      console.log('🔴 Niveau de sécurité insuffisant');
    }
    
    if (highIssues === 0) {
      console.log('\n🎉 Aucun problème critique détecté !');
    } else {
      console.log(`\n🚨 ${highIssues} problème(s) critique(s) à corriger en priorité.`);
    }
  }

  async runAudit() {
    console.log('🔍 DÉMARRAGE DE L\'AUDIT DE SÉCURITÉ - BERIOX AI');
    console.log('===============================================');
    
    await this.auditEnvironmentVariables();
    await this.auditDependencies();
    await this.auditCodeSecurity();
    await this.auditAPISecurity();
    await this.auditDatabaseSecurity();
    await this.auditAuthentication();
    
    await this.generateReport();
  }
}

// Exécution de l'audit
async function main() {
  const auditor = new SecurityAuditor();
  await auditor.runAudit();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = SecurityAuditor;
