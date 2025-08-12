// Service d'apos;intégration avec l'apos;API PageSpeed Insights de Google

export interface PageSpeedResult {
  url: string;
  timestamp: string;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  metrics: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
    speedIndex: number;
    totalBlockingTime: number;
  };
  opportunities: Array<{
    id: string;
    title: string;
    description: string;
    savings: number;
    impact: 'apos;high'apos; | 'apos;medium'apos; | 'apos;low'apos;;
  }>;
  diagnostics: Array<{
    id: string;
    title: string;
    description: string;
    severity: 'apos;error'apos; | 'apos;warning'apos; | 'apos;info'apos;;
  }>;
  loadingExperience?: {
    overall_category: 'apos;FAST'apos; | 'apos;AVERAGE'apos; | 'apos;SLOW'apos;;
    initial_url: string;
  };
}

class PageSpeedService {
  private apiKey: string;
  private baseUrl = 'apos;https://www.googleapis.com/pagespeedonline/v5/runPagespeed'apos;;

  constructor() {
    this.apiKey = process.env.GOOGLE_PAGESPEED_API_KEY || 'apos;'apos;;
    if (!this.apiKey) {
      console.warn('apos;⚠️ Google PageSpeed API key not configured'apos;);
    }
  }

  /**
   * Analyse une URL avec PageSpeed Insights
   */
  async analyzeUrl(url: string, strategy: 'apos;mobile'apos; | 'apos;desktop'apos; = 'apos;mobile'apos;): Promise<PageSpeedResult | null> {
    if (!this.apiKey) {
      console.error('apos;❌ PageSpeed API key not configured'apos;);
      return null;
    }

    try {
      const params = new URLSearchParams({
        url: url,
        key: this.apiKey,
        strategy: strategy,
        category: ['apos;PERFORMANCE'apos;, 'apos;ACCESSIBILITY'apos;, 'apos;BEST_PRACTICES'apos;, 'apos;SEO'apos;].join('apos;,'apos;),
        locale: 'apos;fr'apos;
      });

      const response = await fetch(`${this.baseUrl}?${params}`);
      
      if (!response.ok) {
        throw new Error(`PageSpeed API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.formatResult(data);

    } catch (error) {
      console.error('apos;❌ Error analyzing URL with PageSpeed:'apos;, error);
      return null;
    }
  }

  /**
   * Analyse multiple URLs en batch
   */
  async analyzeBatch(urls: string[], strategy: 'apos;mobile'apos; | 'apos;desktop'apos; = 'apos;mobile'apos;): Promise<PageSpeedResult[]> {
    const results = await Promise.allSettled(
      urls.map(url => this.analyzeUrl(url, strategy))
    );

    return results
      .filter((result): result is PromiseFulfilledResult<PageSpeedResult | null> => 
        result.status === 'apos;fulfilled'apos; && result.value !== null
      )
      .map(result => result.value as PageSpeedResult);
  }

  /**
   * Formate les résultats de l'apos;API en structure utilisable
   */
  private formatResult(data: any): PageSpeedResult {
    const lighthouse = data.lighthouseResult;
    const categories = lighthouse.categories;
    const audits = lighthouse.audits;

    return {
      url: data.id,
      timestamp: new Date().toISOString(),
      scores: {
        performance: Math.round((categories.performance?.score || 0) * 100),
        accessibility: Math.round((categories.accessibility?.score || 0) * 100),
        bestPractices: Math.round((categories['apos;best-practices'apos;]?.score || 0) * 100),
        seo: Math.round((categories.seo?.score || 0) * 100),
      },
      metrics: {
        firstContentfulPaint: audits['apos;first-contentful-paint'apos;]?.numericValue || 0,
        largestContentfulPaint: audits['apos;largest-contentful-paint'apos;]?.numericValue || 0,
        firstInputDelay: audits['apos;max-potential-fid'apos;]?.numericValue || 0,
        cumulativeLayoutShift: audits['apos;cumulative-layout-shift'apos;]?.numericValue || 0,
        speedIndex: audits['apos;speed-index'apos;]?.numericValue || 0,
        totalBlockingTime: audits['apos;total-blocking-time'apos;]?.numericValue || 0,
      },
      opportunities: this.extractOpportunities(audits),
      diagnostics: this.extractDiagnostics(audits),
      loadingExperience: data.loadingExperience
    };
  }

  /**
   * Extrait les opportunités d'apos;amélioration
   */
  private extractOpportunities(audits: any): Array<{id: string, title: string, description: string, savings: number, impact: 'apos;high'apos; | 'apos;medium'apos; | 'apos;low'apos;}> {
    const opportunityAudits = [
      'apos;render-blocking-resources'apos;,
      'apos;unused-css-rules'apos;,
      'apos;unused-javascript'apos;,
      'apos;modern-image-formats'apos;,
      'apos;offscreen-images'apos;,
      'apos;minify-css'apos;,
      'apos;minify-javascript'apos;,
      'apos;enable-text-compression'apos;,
      'apos;properly-size-images'apos;,
      'apos;efficient-animated-content'apos;
    ];

    return opportunityAudits
      .filter(auditId => audits[auditId] && audits[auditId].details?.overallSavingsMs > 0)
      .map(auditId => {
        const audit = audits[auditId];
        const savings = audit.details?.overallSavingsMs || 0;
        return {
          id: auditId,
          title: audit.title,
          description: audit.description,
          savings: Math.round(savings),
          impact: savings > 1000 ? 'apos;high'apos; : savings > 500 ? 'apos;medium'apos; : 'apos;low'apos;
        };
      })
      .sort((a, b) => b.savings - a.savings)
      .slice(0, 10); // Top 10 opportunities
  }

  /**
   * Extrait les diagnostics et problèmes
   */
  private extractDiagnostics(audits: any): Array<{id: string, title: string, description: string, severity: 'apos;error'apos; | 'apos;warning'apos; | 'apos;info'apos;}> {
    const diagnosticAudits = [
      'apos;uses-long-cache-ttl'apos;,
      'apos;uses-optimized-images'apos;,
      'apos;uses-webp-images'apos;,
      'apos;uses-responsive-images'apos;,
      'apos;dom-size'apos;,
      'apos;critical-request-chains'apos;,
      'apos;user-timings'apos;,
      'apos;bootup-time'apos;,
      'apos;mainthread-work-breakdown'apos;,
      'apos;font-display'apos;
    ];

    return diagnosticAudits
      .filter(auditId => audits[auditId])
      .map(auditId => {
        const audit = audits[auditId];
        const score = audit.score;
        return {
          id: auditId,
          title: audit.title,
          description: audit.description,
          severity: score === null ? 'apos;info'apos; : score < 0.5 ? 'apos;error'apos; : score < 0.9 ? 'apos;warning'apos; : 'apos;info'apos;
        };
      })
      .filter(diagnostic => diagnostic.severity !== 'apos;info'apos; || Math.random() < 0.3) // Garder quelques infos
      .slice(0, 8); // Top 8 diagnostics
  }

  /**
   * Génère un rapport d'apos;analyse lisible
   */
  generateReport(result: PageSpeedResult): string {
    const { scores, metrics, opportunities, diagnostics } = result;
    const overallScore = Math.round((scores.performance + scores.accessibility + scores.bestPractices + scores.seo) / 4);

    return `# 🚀 Rapport PageSpeed - ${result.url}

**Date d'apos;analyse :** ${new Date(result.timestamp).toLocaleDateString('apos;fr-FR'apos;)}
**Score global :** ${overallScore}/100 ${this.getScoreEmoji(overallScore)}

## 📊 Scores par catégorie

- **Performance :** ${scores.performance}/100 ${this.getScoreEmoji(scores.performance)}
- **Accessibilité :** ${scores.accessibility}/100 ${this.getScoreEmoji(scores.accessibility)}
- **Bonnes pratiques :** ${scores.bestPractices}/100 ${this.getScoreEmoji(scores.bestPractices)}
- **SEO :** ${scores.seo}/100 ${this.getScoreEmoji(scores.seo)}

## ⚡ Métriques Core Web Vitals

- **First Contentful Paint :** ${Math.round(metrics.firstContentfulPaint)}ms
- **Largest Contentful Paint :** ${Math.round(metrics.largestContentfulPaint)}ms
- **First Input Delay :** ${Math.round(metrics.firstInputDelay)}ms
- **Cumulative Layout Shift :** ${metrics.cumulativeLayoutShift.toFixed(3)}
- **Speed Index :** ${Math.round(metrics.speedIndex)}ms
- **Total Blocking Time :** ${Math.round(metrics.totalBlockingTime)}ms

## 🎯 Opportunités d'apos;amélioration

${opportunities.length > 0 ? opportunities.map(opp => 
  `### ${opp.impact === 'apos;high'apos; ? 'apos;🔴'apos; : opp.impact === 'apos;medium'apos; ? 'apos;🟡'apos; : 'apos;🟢'apos;} ${opp.title}
**Gain estimé :** ${opp.savings}ms
${opp.description}`
).join('apos;\n\n'apos;) : 'apos;_Aucune opportunité majeure détectée._'apos;}

## 🔍 Diagnostics

${diagnostics.length > 0 ? diagnostics.map(diag => 
  `### ${diag.severity === 'apos;error'apos; ? 'apos;❌'apos; : diag.severity === 'apos;warning'apos; ? 'apos;⚠️'apos; : 'apos;ℹ️'apos;} ${diag.title}
${diag.description}`
).join('apos;\n\n'apos;) : 'apos;_Aucun diagnostic particulier._'apos;}

---
*Analyse générée par SpeedBot - Beriox AI*`;
  }

  /**
   * Retourne l'apos;emoji correspondant au score
   */
  private getScoreEmoji(score: number): string {
    if (score >= 90) return 'apos;🟢'apos;;
    if (score >= 50) return 'apos;🟡'apos;;
    return 'apos;🔴'apos;;
  }
}

export const pageSpeedService = new PageSpeedService();
