#!/usr/bin/env node

/**
 * Analyseur de Performance - Beriox AI
 * 
 * Ce script analyse les performances de l'application et génère des recommandations
 * pour optimiser les Core Web Vitals et les métriques de performance.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  outputDir: './performance-reports',
  lighthouseConfig: {
    extends: 'lighthouse:default',
    settings: {
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      formFactor: 'desktop',
      throttling: {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0
      },
      screenEmulation: {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false
      },
      emulatedUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  }
};

class PerformanceAnalyzer {
  constructor() {
    this.reports = [];
    this.metrics = {};
    this.recommendations = [];
  }

  /**
   * Analyser les performances de l'application
   */
  async analyzePerformance() {
    console.log('🚀 Analyse de performance Beriox AI...\n');

    try {
      // 1. Vérifier que l'application est en cours d'exécution
      await this.checkAppRunning();

      // 2. Analyser avec Lighthouse
      await this.runLighthouseAnalysis();

      // 3. Analyser le bundle
      await this.analyzeBundle();

      // 4. Analyser les images
      await this.analyzeImages();

      // 5. Analyser les APIs
      await this.analyzeAPIs();

      // 6. Générer le rapport
      await this.generateReport();

      console.log('✅ Analyse de performance terminée !');
      console.log(`📊 Rapport généré: ${CONFIG.outputDir}/performance-report-${new Date().toISOString().split('T')[0]}.md`);

    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse:', error.message);
      process.exit(1);
    }
  }

  /**
   * Vérifier que l'application est en cours d'exécution
   */
  async checkAppRunning() {
    console.log('🔍 Vérification de l\'application...');
    
    try {
      const response = await fetch('http://localhost:3000/api/health');
      const data = await response.json();
      
      if (data.status === 'healthy') {
        console.log('✅ Application en cours d\'exécution');
        return true;
      } else {
        throw new Error('Application non disponible');
      }
    } catch (error) {
      throw new Error('L\'application doit être en cours d\'exécution sur http://localhost:3000');
    }
  }

  /**
   * Exécuter l'analyse Lighthouse
   */
  async runLighthouseAnalysis() {
    console.log('📊 Analyse Lighthouse...');
    
    const pages = [
      { name: 'Homepage', url: 'http://localhost:3000' },
      { name: 'Dashboard', url: 'http://localhost:3000/missions' },
      { name: 'Profile', url: 'http://localhost:3000/profile' },
      { name: 'Pricing', url: 'http://localhost:3000/pricing' }
    ];

    for (const page of pages) {
      console.log(`   - Analyse de ${page.name}...`);
      
      try {
        const outputPath = path.join(CONFIG.outputDir, `lighthouse-${page.name.toLowerCase()}.json`);
        
        // Exécuter Lighthouse
        execSync(`npx lighthouse ${page.url} --output=json --output-path=${outputPath} --chrome-flags="--headless --no-sandbox"`, {
          stdio: 'pipe'
        });

        // Lire le rapport
        const report = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
        
        this.reports.push({
          page: page.name,
          url: page.url,
          scores: {
            performance: Math.round(report.categories.performance.score * 100),
            accessibility: Math.round(report.categories.accessibility.score * 100),
            bestPractices: Math.round(report.categories['best-practices'].score * 100),
            seo: Math.round(report.categories.seo.score * 100)
          },
          metrics: {
            fcp: report.audits['first-contentful-paint'].numericValue,
            lcp: report.audits['largest-contentful-paint'].numericValue,
            fid: report.audits['max-potential-fid'].numericValue,
            cls: report.audits['cumulative-layout-shift'].numericValue,
            ttfb: report.audits['server-response-time'].numericValue
          },
          opportunities: report.audits['opportunities'] || []
        });

        console.log(`   ✅ ${page.name}: Performance ${Math.round(report.categories.performance.score * 100)}/100`);
        
      } catch (error) {
        console.log(`   ⚠️  Erreur pour ${page.name}: ${error.message}`);
      }
    }
  }

  /**
   * Analyser le bundle JavaScript
   */
  async analyzeBundle() {
    console.log('📦 Analyse du bundle...');
    
    try {
      // Exécuter l'analyse du bundle
      execSync('ANALYZE=true npm run build', {
        stdio: 'pipe',
        cwd: process.cwd()
      });

      console.log('✅ Analyse du bundle terminée');
      
    } catch (error) {
      console.log('⚠️  Impossible d\'analyser le bundle:', error.message);
    }
  }

  /**
   * Analyser les images
   */
  async analyzeImages() {
    console.log('🖼️  Analyse des images...');
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const publicDir = path.join(process.cwd(), 'public');
    
    if (fs.existsSync(publicDir)) {
      const images = this.findImages(publicDir, imageExtensions);
      
      this.metrics.images = {
        total: images.length,
        totalSize: 0,
        formats: {},
        largeImages: []
      };

      for (const image of images) {
        const stats = fs.statSync(image);
        const size = stats.size;
        const ext = path.extname(image).toLowerCase();
        
        this.metrics.images.totalSize += size;
        this.metrics.images.formats[ext] = (this.metrics.images.formats[ext] || 0) + 1;
        
        // Identifier les images trop grandes (> 500KB)
        if (size > 500 * 1024) {
          this.metrics.images.largeImages.push({
            path: image,
            size: size,
            sizeKB: Math.round(size / 1024)
          });
        }
      }

      console.log(`   - ${this.metrics.images.total} images trouvées`);
      console.log(`   - Taille totale: ${Math.round(this.metrics.images.totalSize / 1024 / 1024)} MB`);
      
      if (this.metrics.images.largeImages.length > 0) {
        console.log(`   ⚠️  ${this.metrics.images.largeImages.length} images > 500KB`);
      }
    }
  }

  /**
   * Analyser les APIs
   */
  async analyzeAPIs() {
    console.log('🔌 Analyse des APIs...');
    
    const apiEndpoints = [
      '/api/health',
      '/api/missions',
      '/api/user/stats',
      '/api/bots/recommendations'
    ];

    this.metrics.apis = {
      total: apiEndpoints.length,
      responseTimes: {},
      errors: []
    };

    for (const endpoint of apiEndpoints) {
      try {
        const start = Date.now();
        const response = await fetch(`http://localhost:3000${endpoint}`);
        const end = Date.now();
        
        this.metrics.apis.responseTimes[endpoint] = end - start;
        
        if (!response.ok) {
          this.metrics.apis.errors.push({
            endpoint,
            status: response.status,
            statusText: response.statusText
          });
        }
        
      } catch (error) {
        this.metrics.apis.errors.push({
          endpoint,
          error: error.message
        });
      }
    }

    const avgResponseTime = Object.values(this.metrics.apis.responseTimes).reduce((a, b) => a + b, 0) / this.metrics.apis.total;
    console.log(`   - Temps de réponse moyen: ${Math.round(avgResponseTime)}ms`);
    console.log(`   - Erreurs: ${this.metrics.apis.errors.length}`);
  }

  /**
   * Trouver toutes les images dans un répertoire
   */
  findImages(dir, extensions) {
    const images = [];
    
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        images.push(...this.findImages(filePath, extensions));
      } else if (extensions.includes(path.extname(file).toLowerCase())) {
        images.push(filePath);
      }
    }
    
    return images;
  }

  /**
   * Générer le rapport de performance
   */
  async generateReport() {
    console.log('📝 Génération du rapport...');
    
    // Créer le répertoire de sortie
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    const reportPath = path.join(CONFIG.outputDir, `performance-report-${new Date().toISOString().split('T')[0]}.md`);
    
    const report = this.generateMarkdownReport();
    
    fs.writeFileSync(reportPath, report);
    
    this.recommendations = this.generateRecommendations();
  }

  /**
   * Générer le rapport Markdown
   */
  generateMarkdownReport() {
    const date = new Date().toLocaleDateString('fr-FR');
    const time = new Date().toLocaleTimeString('fr-FR');

    let report = `# 📊 Rapport de Performance - Beriox AI

**Date:** ${date} à ${time}  
**Version:** 0.1.0  
**Environnement:** Development

---

## 🎯 Résumé Exécutif

`;

    // Scores moyens
    const avgScores = {
      performance: 0,
      accessibility: 0,
      bestPractices: 0,
      seo: 0
    };

    this.reports.forEach(r => {
      avgScores.performance += r.scores.performance;
      avgScores.accessibility += r.scores.accessibility;
      avgScores.bestPractices += r.scores.bestPractices;
      avgScores.seo += r.scores.seo;
    });

    const pageCount = this.reports.length;
    Object.keys(avgScores).forEach(key => {
      avgScores[key] = Math.round(avgScores[key] / pageCount);
    });

    report += `### Scores Moyens
- **Performance:** ${avgScores.performance}/100
- **Accessibilité:** ${avgScores.accessibility}/100
- **Bonnes Pratiques:** ${avgScores.bestPractices}/100
- **SEO:** ${avgScores.seo}/100

### Core Web Vitals
`;

    // Core Web Vitals
    const coreWebVitals = this.reports.reduce((acc, r) => {
      acc.fcp.push(r.metrics.fcp);
      acc.lcp.push(r.metrics.lcp);
      acc.fid.push(r.metrics.fid);
      acc.cls.push(r.metrics.cls);
      acc.ttfb.push(r.metrics.ttfb);
      return acc;
    }, { fcp: [], lcp: [], fid: [], cls: [], ttfb: [] });

    const avgMetrics = {
      fcp: Math.round(coreWebVitals.fcp.reduce((a, b) => a + b, 0) / coreWebVitals.fcp.length),
      lcp: Math.round(coreWebVitals.lcp.reduce((a, b) => a + b, 0) / coreWebVitals.lcp.length),
      fid: Math.round(coreWebVitals.fid.reduce((a, b) => a + b, 0) / coreWebVitals.fid.length),
      cls: (coreWebVitals.cls.reduce((a, b) => a + b, 0) / coreWebVitals.cls.length).toFixed(3),
      ttfb: Math.round(coreWebVitals.ttfb.reduce((a, b) => a + b, 0) / coreWebVitals.ttfb.length)
    };

    report += `- **FCP (First Contentful Paint):** ${avgMetrics.fcp}ms
- **LCP (Largest Contentful Paint):** ${avgMetrics.lcp}ms
- **FID (First Input Delay):** ${avgMetrics.fid}ms
- **CLS (Cumulative Layout Shift):** ${avgMetrics.cls}
- **TTFB (Time to First Byte):** ${avgMetrics.ttfb}ms

---

## 📄 Analyse par Page

`;

    // Détails par page
    this.reports.forEach(r => {
      report += `### ${r.page}

**URL:** ${r.url}

**Scores:**
- Performance: ${r.scores.performance}/100
- Accessibilité: ${r.scores.accessibility}/100
- Bonnes Pratiques: ${r.scores.bestPractices}/100
- SEO: ${r.scores.seo}/100

**Métriques:**
- FCP: ${Math.round(r.metrics.fcp)}ms
- LCP: ${Math.round(r.metrics.lcp)}ms
- FID: ${Math.round(r.metrics.fid)}ms
- CLS: ${r.metrics.cls.toFixed(3)}
- TTFB: ${Math.round(r.metrics.ttfb)}ms

`;

      if (r.opportunities && r.opportunities.length > 0) {
        report += `**Opportunités d'amélioration:**
`;
        r.opportunities.forEach(opp => {
          report += `- ${opp.title}: ${opp.description}\n`;
        });
        report += '\n';
      }
    });

    report += `---

## 🖼️ Analyse des Images

`;

    if (this.metrics.images) {
      report += `**Statistiques:**
- Total: ${this.metrics.images.total} images
- Taille totale: ${Math.round(this.metrics.images.totalSize / 1024 / 1024)} MB

**Formats:**
`;
      Object.entries(this.metrics.images.formats).forEach(([format, count]) => {
        report += `- ${format}: ${count} images\n`;
      });

      if (this.metrics.images.largeImages.length > 0) {
        report += `\n**Images volumineuses (> 500KB):**
`;
        this.metrics.images.largeImages.forEach(img => {
          report += `- ${img.path}: ${img.sizeKB} KB\n`;
        });
      }
    }

    report += `---

## 🔌 Analyse des APIs

`;

    if (this.metrics.apis) {
      const avgResponseTime = Object.values(this.metrics.apis.responseTimes).reduce((a, b) => a + b, 0) / this.metrics.apis.total;
      
      report += `**Statistiques:**
- Total: ${this.metrics.apis.total} endpoints
- Temps de réponse moyen: ${Math.round(avgResponseTime)}ms
- Erreurs: ${this.metrics.apis.errors.length}

**Temps de réponse par endpoint:**
`;
      Object.entries(this.metrics.apis.responseTimes).forEach(([endpoint, time]) => {
        report += `- ${endpoint}: ${time}ms\n`;
      });

      if (this.metrics.apis.errors.length > 0) {
        report += `\n**Erreurs:**
`;
        this.metrics.apis.errors.forEach(error => {
          report += `- ${error.endpoint}: ${error.status || error.error}\n`;
        });
      }
    }

    report += `---

## 🎯 Recommandations

`;

    this.recommendations.forEach((rec, index) => {
      report += `### ${index + 1}. ${rec.title}

**Priorité:** ${rec.priority}  
**Impact:** ${rec.impact}

${rec.description}

**Actions:**
`;
      rec.actions.forEach(action => {
        report += `- ${action}\n`;
      });
      report += '\n';
    });

    report += `---

## 📈 Métriques de Suivi

### Objectifs de Performance
- **LCP:** < 2.5s (actuel: ${avgMetrics.lcp}ms)
- **FID:** < 100ms (actuel: ${avgMetrics.fid}ms)
- **CLS:** < 0.1 (actuel: ${avgMetrics.cls})
- **TTFB:** < 600ms (actuel: ${avgMetrics.ttfb}ms)

### Objectifs Business
- **Taux de rebond:** < 30%
- **Temps de session:** > 5 minutes
- **Conversions:** > 2%

---

*Rapport généré automatiquement par Beriox AI Performance Analyzer*
`;

    return report;
  }

  /**
   * Générer les recommandations
   */
  generateRecommendations() {
    const recommendations = [];

    // Analyser les scores de performance
    const avgPerformance = this.reports.reduce((acc, r) => acc + r.scores.performance, 0) / this.reports.length;
    
    if (avgPerformance < 90) {
      recommendations.push({
        title: 'Optimiser les performances générales',
        priority: 'HAUTE',
        impact: 'Amélioration significative de l\'expérience utilisateur',
        description: 'Les scores de performance sont en dessous de 90/100, ce qui peut impacter l\'expérience utilisateur et le SEO.',
        actions: [
          'Optimiser les images avec next/image',
          'Implémenter le lazy loading',
          'Réduire la taille du bundle JavaScript',
          'Optimiser les requêtes de base de données'
        ]
      });
    }

    // Analyser les Core Web Vitals
    const avgLCP = this.reports.reduce((acc, r) => acc + r.metrics.lcp, 0) / this.reports.length;
    if (avgLCP > 2500) {
      recommendations.push({
        title: 'Améliorer le Largest Contentful Paint (LCP)',
        priority: 'HAUTE',
        impact: 'Amélioration de 20-30% de la perception de vitesse',
        description: 'Le LCP est supérieur à 2.5s, ce qui impacte négativement l\'expérience utilisateur.',
        actions: [
          'Optimiser les images hero',
          'Implémenter le preloading des ressources critiques',
          'Optimiser le rendu côté serveur',
          'Réduire le temps de réponse du serveur'
        ]
      });
    }

    // Analyser les images
    if (this.metrics.images && this.metrics.images.largeImages.length > 0) {
      recommendations.push({
        title: 'Optimiser les images volumineuses',
        priority: 'MOYENNE',
        impact: 'Réduction de 40-60% de la taille des images',
        description: `${this.metrics.images.largeImages.length} images dépassent 500KB, ce qui ralentit le chargement.`,
        actions: [
          'Convertir en formats WebP/AVIF',
          'Implémenter le responsive images',
          'Utiliser next/image avec optimisation automatique',
          'Compresser les images existantes'
        ]
      });
    }

    // Analyser les APIs
    if (this.metrics.apis) {
      const avgResponseTime = Object.values(this.metrics.apis.responseTimes).reduce((a, b) => a + b, 0) / this.metrics.apis.total;
      
      if (avgResponseTime > 500) {
        recommendations.push({
          title: 'Optimiser les temps de réponse des APIs',
          priority: 'MOYENNE',
          impact: 'Amélioration de 30-50% de la réactivité',
          description: `Le temps de réponse moyen des APIs est de ${Math.round(avgResponseTime)}ms, ce qui est trop élevé.`,
          actions: [
            'Optimiser les requêtes de base de données',
            'Implémenter le cache Redis',
            'Utiliser la pagination pour les grandes listes',
            'Optimiser les index de base de données'
          ]
        });
      }
    }

    return recommendations;
  }
}

// Exécution du script
async function main() {
  const analyzer = new PerformanceAnalyzer();
  await analyzer.analyzePerformance();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = PerformanceAnalyzer;
