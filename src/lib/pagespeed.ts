// Service d'intégration avec l'API PageSpeed Insights de Google

export interface PageSpeedResult {
  url: string
  timestamp: string
  scores: {
    performance: number
    accessibility: number
    bestPractices: number
    seo: number
  }
  metrics: {
    firstContentfulPaint: number
    largestContentfulPaint: number
    firstInputDelay: number
    cumulativeLayoutShift: number
    speedIndex: number
    totalBlockingTime: number
  }
  opportunities: Array<{
    id: string
    title: string
    description: string
    savings: number
    impact: 'high' | 'medium' | 'low'
  }>
  diagnostics: Array<{
    id: string
    title: string
    description: string
    severity: 'error' | 'warning' | 'info'
  }>
  loadingExperience?: {
    overall_category: 'FAST' | 'AVERAGE' | 'SLOW'
    initial_url: string
  }
}

class PageSpeedService {
  private apiKey: string
  private baseUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
  constructor() {
    this.apiKey = process.env.GOOGLE_PAGESPEED_API_KEY || ''
    if (!this.apiKey) {
      console.warn('⚠️ Google PageSpeed API key not configured')
    }
  }

  /**
   * Analyse une URL avec PageSpeed Insights
   */
  async analyzeUrl(url: string, strategy: 'mobile' | 'desktop' = 'mobile'): Promise<PageSpeedResult | null> {
    if (!this.apiKey) {
      console.error('❌ PageSpeed API key not configured')
      return null
    }

    try {
      const params = new URLSearchParams({
        url: url,
        key: this.apiKey,
        strategy: strategy,
        category: ['PERFORMANCE', 'ACCESSIBILITY', 'BEST_PRACTICES', 'SEO'].join(','),
        locale: 'fr'
      })
      const response = await fetch(`${this.baseUrl}?${params}`)
      if (!response.ok) {
        throw new Error(`PageSpeed API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return this.formatResult(data)
    } catch (error) {
      console.error('❌ Error analyzing URL with PageSpeed:', error)
      return null
    }
  }

  /**
   * Analyse multiple URLs en batch
   */
  async analyzeBatch(urls: string[], strategy: 'mobile' | 'desktop' = 'mobile'): Promise<PageSpeedResult[]> {
    const results = await Promise.allSettled(
      urls.map(url => this.analyzeUrl(url, strategy))
    )
    return results
      .filter((result): result is PromiseFulfilledResult<PageSpeedResult | null> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value as PageSpeedResult)
  }

  /**
   * Formate les résultats de l'API en structure utilisable
   */
  private formatResult(data: any): PageSpeedResult {
    const lighthouse = data.lighthouseResult
    const categories = lighthouse.categories
    const audits = lighthouse.audits
    return {
      url: data.id,
      timestamp: new Date().toISOString(),
      scores: {
        performance: Math.round((categories.performance?.score || 0) * 100),
        accessibility: Math.round((categories.accessibility?.score || 0) * 100),
        bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
        seo: Math.round((categories.seo?.score || 0) * 100),
      },
      metrics: {
        firstContentfulPaint: audits['first-contentful-paint']?.numericValue || 0,
        largestContentfulPaint: audits['largest-contentful-paint']?.numericValue || 0,
        firstInputDelay: audits['max-potential-fid']?.numericValue || 0,
        cumulativeLayoutShift: audits['cumulative-layout-shift']?.numericValue || 0,
        speedIndex: audits['speed-index']?.numericValue || 0,
        totalBlockingTime: audits['total-blocking-time']?.numericValue || 0,
      },
      opportunities: this.extractOpportunities(audits),
      diagnostics: this.extractDiagnostics(audits),
      loadingExperience: data.loadingExperience
    }
  }

  /**
   * Extrait les opportunités d'amélioration
   */
  private extractOpportunities(audits: any): Array<{id: string, title: string, description: string, savings: number, impact: 'high' | 'medium' | 'low'}> {
    const opportunityAudits = [
      'render-blocking-resources',
      'unused-css-rules',
      'unused-javascript',
      'modern-image-formats',
      'offscreen-images',
      'minify-css',
      'minify-javascript',
      'enable-text-compression',
      'properly-size-images',
      'efficient-animated-content'
    ]
    return opportunityAudits
      .filter(auditId => audits[auditId] && audits[auditId].details?.overallSavingsMs > 0)
      .map(auditId => {
        const audit = audits[auditId]
        const savings = audit.details?.overallSavingsMs || 0
        return {
          id: auditId,
          title: audit.title,
          description: audit.description,
          savings: Math.round(savings),
          impact: savings > 1000 ? 'high' : savings > 500 ? 'medium' : 'low'
        }
      })
      .sort((a, b) => b.savings - a.savings)
      .slice(0, 10); // Top 10 opportunities
  }

  /**
   * Extrait les diagnostics et problèmes
   */
  private extractDiagnostics(audits: any): Array<{id: string, title: string, description: string, severity: 'error' | 'warning' | 'info'}> {
    const diagnosticAudits = [
      'uses-long-cache-ttl',
      'uses-optimized-images',
      'uses-webp-images',
      'uses-responsive-images',
      'dom-size',
      'critical-request-chains',
      'user-timings',
      'bootup-time',
      'mainthread-work-breakdown',
      'font-display'
    ]
    return diagnosticAudits
      .filter(auditId => audits[auditId])
      .map(auditId => {
        const audit = audits[auditId]
        const score = audit.score
        return {
          id: auditId,
          title: audit.title,
          description: audit.description,
          severity: score === null ? 'info' : score < 0.5 ? 'error' : score < 0.9 ? 'warning' : 'info'
        }
      })
      .filter(diagnostic => diagnostic.severity !== 'info' || Math.random() < 0.3) // Garder quelques infos
      .slice(0, 8); // Top 8 diagnostics
  }

  /**
   * Génère un rapport d'analyse lisible
   */
  generateReport(result: PageSpeedResult): string {
    const { scores, metrics, opportunities, diagnostics } = result
    const overallScore = Math.round((scores.performance + scores.accessibility + scores.bestPractices + scores.seo) / 4)
    return `# 🚀 Rapport PageSpeed - ${result.url}

**Date d'analyse :** ${new Date(result.timestamp).toLocaleDateString('fr-FR')}
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

## 🎯 Opportunités d'amélioration

${opportunities.length > 0 ? opportunities.map(opp => 
  `### ${opp.impact === 'high' ? '🔴' : opp.impact === 'medium' ? '🟡' : '🟢'} ${opp.title}
**Gain estimé :** ${opp.savings}ms
${opp.description}`
).join('\n\n') : '_Aucune opportunité majeure détectée._'}

## 🔍 Diagnostics

${diagnostics.length > 0 ? diagnostics.map(diag => 
  `### ${diag.severity === 'error' ? '❌' : diag.severity === 'warning' ? '⚠️' : 'ℹ️'} ${diag.title}
${diag.description}`
).join('\n\n') : '_Aucun diagnostic particulier._'}

---
*Analyse générée par SpeedBot - Beriox AI*`
  }

  /**
   * Retourne l'emoji correspondant au score
   */
  private getScoreEmoji(score: number): string {
    if (score >= 90) return '🟢'
    if (score >= 50) return '🟡'
    return '🔴'
  }
}

export const pageSpeedService = new PageSpeedService()