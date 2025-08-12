// Service d'analyse de sécurité web avec Mozilla Observatory et SSL Labs

export interface SecurityResult {
  url: string
  timestamp: string
  overallScore: number
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  ssl: {
    grade: string
    score: number
    issues: Array<{
      severity: 'critical' | 'high' | 'medium' | 'low'
      title: string
      description: string
    }>
  }
  headers: {
    score: number
    missing: string[]
    present: string[]
    recommendations: Array<{
      header: string
      description: string
      priority: 'high' | 'medium' | 'low'
    }>
  }
  vulnerabilities: Array<{
    id: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    title: string
    description: string
    fix: string
  }>
}

class SecurityService {
  private observatoryBaseUrl = 'https://http-observatory.security.mozilla.org/api/v1'
  private sslLabsBaseUrl = 'https://api.ssllabs.com/api/v3'
  /**
   * Analyse complète de sécurité d'un site
   */
  async analyzeSecurity(url: string): Promise<SecurityResult | null> {
    try {
      const domain = this.extractDomain(url)
      // Lancer les analyses en parallèle
      const [observatoryResult, sslResult] = await Promise.allSettled([
        this.analyzeWithObservatory(domain),
        this.analyzeSSL(domain)
      ])
      const observatory = observatoryResult.status === 'fulfilled' ? observatoryResult.value : null
      const ssl = sslResult.status === 'fulfilled' ? sslResult.value : null
      if (!observatory && !ssl) {
        throw new Error('Aucune analyse n\'a pu être effectuée')
      }

      return this.combineResults(url, observatory, ssl)
    } catch (error) {
      console.error('❌ Error analyzing security:', error)
      return null
    }
  }

  /**
   * Analyse avec Mozilla Observatory
   */
  private async analyzeWithObservatory(domain: string): Promise<any> {
    try {
      // Démarrer l'analyse
      const scanResponse = await fetch(`${this.observatoryBaseUrl}/analyze?host=${domain}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      if (!scanResponse.ok) {
        throw new Error(`Observatory scan failed: ${scanResponse.status}`)
      }

      const scanData = await scanResponse.json()
      // Attendre les résultats (avec polling)
      let attempts = 0
      const maxAttempts = 30; // 5 minutes max
      
      while (attempts < maxAttempts) {
        const resultResponse = await fetch(`${this.observatoryBaseUrl}/analyze?host=${domain}`)
        const resultData = await resultResponse.json()
        if (resultData.state === 'FINISHED') {
          return resultData
        }
        
        if (resultData.state === 'FAILED') {
          throw new Error('Observatory analysis failed')
        }
        
        await new Promise(resolve => setTimeout(resolve, 10000)); // Attendre 10s
        attempts++
      }
      
      throw new Error('Observatory analysis timeout')
    } catch (error) {
      console.error('❌ Observatory analysis error:', error)
      throw error
    }
  }

  /**
   * Analyse SSL avec SSL Labs
   */
  private async analyzeSSL(domain: string): Promise<any> {
    try {
      // Démarrer l'analyse SSL
      const scanResponse = await fetch(
        `${this.sslLabsBaseUrl}/analyze?host=${domain}&publish=off&startNew=on&all=done`
      )
      if (!scanResponse.ok) {
        throw new Error(`SSL Labs scan failed: ${scanResponse.status}`)
      }

      const scanData = await scanResponse.json()
      // Polling pour les résultats
      let attempts = 0
      const maxAttempts = 60; // 10 minutes max
      
      while (attempts < maxAttempts) {
        const resultResponse = await fetch(`${this.sslLabsBaseUrl}/analyze?host=${domain}`)
        const resultData = await resultResponse.json()
        if (resultData.status === 'READY') {
          return resultData
        }
        
        if (resultData.status === 'ERROR') {
          throw new Error('SSL Labs analysis failed')
        }
        
        await new Promise(resolve => setTimeout(resolve, 10000)); // Attendre 10s
        attempts++
      }
      
      throw new Error('SSL Labs analysis timeout')
    } catch (error) {
      console.error('❌ SSL Labs analysis error:', error)
      throw error
    }
  }

  /**
   * Combine les résultats des deux analyses
   */
  private combineResults(url: string, observatory: any, ssl: any): SecurityResult {
    const observatoryScore = observatory?.score || 0
    const sslScore = ssl?.endpoints?.[0]?.grade ? this.gradeToScore(ssl.endpoints[0].grade) : 0
    const overallScore = Math.round((observatoryScore + sslScore) / 2)
    return {
      url,
      timestamp: new Date().toISOString(),
      overallScore,
      grade: this.scoreToGrade(overallScore),
      ssl: this.formatSSLResults(ssl),
      headers: this.formatHeaderResults(observatory),
      vulnerabilities: this.extractVulnerabilities(observatory, ssl)
    }
  }

  /**
   * Formate les résultats SSL
   */
  private formatSSLResults(ssl: any): SecurityResult['ssl'] {
    if (!ssl || !ssl.endpoints || ssl.endpoints.length === 0) {
      return {
        grade: 'F',
        score: 0,
        issues: [{ severity: 'critical', title: 'SSL non configuré', description: 'Aucun certificat SSL détecté' }]
      }
    }

    const endpoint = ssl.endpoints[0]
    const issues: Array<{severity: 'critical' | 'high' | 'medium' | 'low', title: string, description: string}> = []
    // Analyser les problèmes SSL
    if (endpoint.details?.cert?.issues) {
      endpoint.details.cert.issues.forEach((issue: any) => {
        issues.push({
          severity: this.mapSSLSeverity(issue.severity),
          title: issue.name,
          description: issue.description
        })
      })
    }

    return {
      grade: endpoint.grade || 'F',
      score: this.gradeToScore(endpoint.grade),
      issues
    }
  }

  /**
   * Formate les résultats d'en-têtes de sécurité
   */
  private formatHeaderResults(observatory: any): SecurityResult['headers'] {
    if (!observatory) {
      return { score: 0, missing: [], present: [], recommendations: [] }
    }

    const recommendations = [
      {
        header: 'Content-Security-Policy',
        description: 'Protège contre les attaques XSS et injection de code',
        priority: 'high' as const
      },
      {
        header: 'Strict-Transport-Security',
        description: 'Force l\'utilisation de HTTPS',
        priority: 'high' as const
      },
      {
        header: 'X-Frame-Options',
        description: 'Protège contre le clickjacking',
        priority: 'medium' as const
      },
      {
        header: 'X-Content-Type-Options',
        description: 'Empêche le MIME type sniffing',
        priority: 'medium' as const
      }
    ]
    return {
      score: observatory.score || 0,
      missing: observatory.tests_failed || [],
      present: observatory.tests_passed || [],
      recommendations
    }
  }

  /**
   * Extrait les vulnérabilités détectées
   */
  private extractVulnerabilities(observatory: any, ssl: any): SecurityResult['vulnerabilities'] {
    const vulnerabilities: SecurityResult['vulnerabilities'] = []
    // Vulnérabilités Observatory
    if (observatory?.tests_failed) {
      observatory.tests_failed.forEach((test: string) => {
        vulnerabilities.push({
          id: `obs-${test}`,
          severity: 'medium',
          title: `En-tête manquant: ${test}`,
          description: `L'en-tête de sécurité ${test} n'est pas configuré`,
          fix: `Configurer l'en-tête ${test} sur votre serveur web`
        })
      })
    }

    // Vulnérabilités SSL
    if (ssl?.endpoints?.[0]?.details?.vulnerabilities) {
      ssl.endpoints[0].details.vulnerabilities.forEach((vuln: any) => {
        vulnerabilities.push({
          id: `ssl-${vuln.id}`,
          severity: this.mapSSLSeverity(vuln.severity),
          title: vuln.name,
          description: vuln.description,
          fix: vuln.fix || 'Mettre à jour la configuration SSL'
        })
      })
    }

    return vulnerabilities.slice(0, 10); // Top 10 vulnérabilités
  }

  /**
   * Génère un rapport de sécurité lisible
   */
  generateSecurityReport(result: SecurityResult): string {
    const { overallScore, grade, ssl, headers, vulnerabilities } = result
    return `# 🔒 Rapport de Sécurité - ${result.url}

**Date d'analyse :** ${new Date(result.timestamp).toLocaleDateString('fr-FR')}
**Score global :** ${overallScore}/100 (Grade ${grade}) ${this.getSecurityEmoji(grade)}

## 🛡️ Certificat SSL

**Grade SSL :** ${ssl.grade} (${ssl.score}/100)

${ssl.issues.length > 0 ? `### ⚠️ Problèmes SSL détectés
${ssl.issues.map(issue => 
  `- **${this.getSeverityEmoji(issue.severity)} ${issue.title}**  
  ${issue.description}`
).join('\n')}` : '✅ Aucun problème SSL majeur détecté'}

## 🔐 En-têtes de Sécurité

**Score en-têtes :** ${headers.score}/100

### 📋 Recommandations prioritaires
${headers.recommendations.map(rec => 
  `- **${rec.priority === 'high' ? '🔴' : '🟡'} ${rec.header}**  
  ${rec.description}`
).join('\n')}

## 🚨 Vulnérabilités Détectées

${vulnerabilities.length > 0 ? vulnerabilities.map(vuln => 
  `### ${this.getSeverityEmoji(vuln.severity)} ${vuln.title}
**Sévérité :** ${vuln.severity.toUpperCase()}  
**Description :** ${vuln.description}  
**Solution :** ${vuln.fix}
`
).join('\n') : '✅ Aucune vulnérabilité critique détectée'}

## 📋 Plan d'Action Recommandé

### 🔴 Actions Critiques (À faire immédiatement)
${vulnerabilities.filter(v => v.severity === 'critical').map(v => `- ${v.title}`).join('\n') || '- Aucune action critique requise'}

### 🟡 Actions Importantes (Cette semaine)
${vulnerabilities.filter(v => v.severity === 'high').map(v => `- ${v.title}`).join('\n') || '- Configurer les en-têtes de sécurité manquants'}

### 🟢 Améliorations (Ce mois-ci)
${vulnerabilities.filter(v => v.severity === 'medium').map(v => `- ${v.title}`).join('\n') || '- Optimiser la configuration SSL'}

---
*Analyse générée par SecurityBot - Beriox AI*`
  }

  // Méthodes utilitaires
  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname
    } catch {
      return url.replace(/^https?:\/\//, '').split('/')[0]
    }
  }

  private gradeToScore(grade: string): number {
    const gradeMap: Record<string, number> = {
      'A+': 100, 'A': 90, 'A-': 85,
      'B+': 80, 'B': 70, 'B-': 65,
      'C+': 60, 'C': 50, 'C-': 45,
      'D': 30, 'E': 20, 'F': 0
    }
    return gradeMap[grade] || 0
  }

  private scoreToGrade(score: number): SecurityResult['grade'] {
    if (score >= 95) return 'A+'
    if (score >= 85) return 'A'
    if (score >= 75) return 'B'
    if (score >= 65) return 'C'
    if (score >= 50) return 'D'
    if (score >= 35) return 'E'
    return 'F'
  }

  private mapSSLSeverity(severity: number | string): 'critical' | 'high' | 'medium' | 'low' {
    if (typeof severity === 'number') {
      if (severity >= 4) return 'critical'
      if (severity >= 3) return 'high'
      if (severity >= 2) return 'medium'
      return 'low'
    }
    return severity as any || 'medium'
  }

  private getSecurityEmoji(grade: string): string {
    if (['A+', 'A'].includes(grade)) return '🟢'
    if (['B', 'C'].includes(grade)) return '🟡'
    return '🔴'
  }

  private getSeverityEmoji(severity: string): string {
    switch (severity) {
      case 'critical': return '🚨'
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return 'ℹ️'
    }
  }
}

export const securityService = new SecurityService()