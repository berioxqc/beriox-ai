// Service d'apos;analyse de sécurité web avec Mozilla Observatory et SSL Labs

export interface SecurityResult {
  url: string;
  timestamp: string;
  overallScore: number;
  grade: 'apos;A+'apos; | 'apos;A'apos; | 'apos;B'apos; | 'apos;C'apos; | 'apos;D'apos; | 'apos;E'apos; | 'apos;F'apos;;
  ssl: {
    grade: string;
    score: number;
    issues: Array<{
      severity: 'apos;critical'apos; | 'apos;high'apos; | 'apos;medium'apos; | 'apos;low'apos;;
      title: string;
      description: string;
    }>;
  };
  headers: {
    score: number;
    missing: string[];
    present: string[];
    recommendations: Array<{
      header: string;
      description: string;
      priority: 'apos;high'apos; | 'apos;medium'apos; | 'apos;low'apos;;
    }>;
  };
  vulnerabilities: Array<{
    id: string;
    severity: 'apos;critical'apos; | 'apos;high'apos; | 'apos;medium'apos; | 'apos;low'apos;;
    title: string;
    description: string;
    fix: string;
  }>;
}

class SecurityService {
  private observatoryBaseUrl = 'apos;https://http-observatory.security.mozilla.org/api/v1'apos;;
  private sslLabsBaseUrl = 'apos;https://api.ssllabs.com/api/v3'apos;;

  /**
   * Analyse complète de sécurité d'apos;un site
   */
  async analyzeSecurity(url: string): Promise<SecurityResult | null> {
    try {
      const domain = this.extractDomain(url);
      
      // Lancer les analyses en parallèle
      const [observatoryResult, sslResult] = await Promise.allSettled([
        this.analyzeWithObservatory(domain),
        this.analyzeSSL(domain)
      ]);

      const observatory = observatoryResult.status === 'apos;fulfilled'apos; ? observatoryResult.value : null;
      const ssl = sslResult.status === 'apos;fulfilled'apos; ? sslResult.value : null;

      if (!observatory && !ssl) {
        throw new Error('apos;Aucune analyse n\'apos;a pu être effectuée'apos;);
      }

      return this.combineResults(url, observatory, ssl);

    } catch (error) {
      console.error('apos;❌ Error analyzing security:'apos;, error);
      return null;
    }
  }

  /**
   * Analyse avec Mozilla Observatory
   */
  private async analyzeWithObservatory(domain: string): Promise<any> {
    try {
      // Démarrer l'apos;analyse
      const scanResponse = await fetch(`${this.observatoryBaseUrl}/analyze?host=${domain}`, {
        method: 'apos;POST'apos;,
        headers: { 'apos;Content-Type'apos;: 'apos;application/json'apos; }
      });

      if (!scanResponse.ok) {
        throw new Error(`Observatory scan failed: ${scanResponse.status}`);
      }

      const scanData = await scanResponse.json();
      
      // Attendre les résultats (avec polling)
      let attempts = 0;
      const maxAttempts = 30; // 5 minutes max
      
      while (attempts < maxAttempts) {
        const resultResponse = await fetch(`${this.observatoryBaseUrl}/analyze?host=${domain}`);
        const resultData = await resultResponse.json();
        
        if (resultData.state === 'apos;FINISHED'apos;) {
          return resultData;
        }
        
        if (resultData.state === 'apos;FAILED'apos;) {
          throw new Error('apos;Observatory analysis failed'apos;);
        }
        
        await new Promise(resolve => setTimeout(resolve, 10000)); // Attendre 10s
        attempts++;
      }
      
      throw new Error('apos;Observatory analysis timeout'apos;);

    } catch (error) {
      console.error('apos;❌ Observatory analysis error:'apos;, error);
      throw error;
    }
  }

  /**
   * Analyse SSL avec SSL Labs
   */
  private async analyzeSSL(domain: string): Promise<any> {
    try {
      // Démarrer l'apos;analyse SSL
      const scanResponse = await fetch(
        `${this.sslLabsBaseUrl}/analyze?host=${domain}&publish=off&startNew=on&all=done`
      );

      if (!scanResponse.ok) {
        throw new Error(`SSL Labs scan failed: ${scanResponse.status}`);
      }

      const scanData = await scanResponse.json();
      
      // Polling pour les résultats
      let attempts = 0;
      const maxAttempts = 60; // 10 minutes max
      
      while (attempts < maxAttempts) {
        const resultResponse = await fetch(`${this.sslLabsBaseUrl}/analyze?host=${domain}`);
        const resultData = await resultResponse.json();
        
        if (resultData.status === 'apos;READY'apos;) {
          return resultData;
        }
        
        if (resultData.status === 'apos;ERROR'apos;) {
          throw new Error('apos;SSL Labs analysis failed'apos;);
        }
        
        await new Promise(resolve => setTimeout(resolve, 10000)); // Attendre 10s
        attempts++;
      }
      
      throw new Error('apos;SSL Labs analysis timeout'apos;);

    } catch (error) {
      console.error('apos;❌ SSL Labs analysis error:'apos;, error);
      throw error;
    }
  }

  /**
   * Combine les résultats des deux analyses
   */
  private combineResults(url: string, observatory: any, ssl: any): SecurityResult {
    const observatoryScore = observatory?.score || 0;
    const sslScore = ssl?.endpoints?.[0]?.grade ? this.gradeToScore(ssl.endpoints[0].grade) : 0;
    
    const overallScore = Math.round((observatoryScore + sslScore) / 2);

    return {
      url,
      timestamp: new Date().toISOString(),
      overallScore,
      grade: this.scoreToGrade(overallScore),
      ssl: this.formatSSLResults(ssl),
      headers: this.formatHeaderResults(observatory),
      vulnerabilities: this.extractVulnerabilities(observatory, ssl)
    };
  }

  /**
   * Formate les résultats SSL
   */
  private formatSSLResults(ssl: any): SecurityResult['apos;ssl'apos;] {
    if (!ssl || !ssl.endpoints || ssl.endpoints.length === 0) {
      return {
        grade: 'apos;F'apos;,
        score: 0,
        issues: [{ severity: 'apos;critical'apos;, title: 'apos;SSL non configuré'apos;, description: 'apos;Aucun certificat SSL détecté'apos; }]
      };
    }

    const endpoint = ssl.endpoints[0];
    const issues: Array<{severity: 'apos;critical'apos; | 'apos;high'apos; | 'apos;medium'apos; | 'apos;low'apos;, title: string, description: string}> = [];

    // Analyser les problèmes SSL
    if (endpoint.details?.cert?.issues) {
      endpoint.details.cert.issues.forEach((issue: any) => {
        issues.push({
          severity: this.mapSSLSeverity(issue.severity),
          title: issue.name,
          description: issue.description
        });
      });
    }

    return {
      grade: endpoint.grade || 'apos;F'apos;,
      score: this.gradeToScore(endpoint.grade),
      issues
    };
  }

  /**
   * Formate les résultats d'apos;en-têtes de sécurité
   */
  private formatHeaderResults(observatory: any): SecurityResult['apos;headers'apos;] {
    if (!observatory) {
      return { score: 0, missing: [], present: [], recommendations: [] };
    }

    const recommendations = [
      {
        header: 'apos;Content-Security-Policy'apos;,
        description: 'apos;Protège contre les attaques XSS et injection de code'apos;,
        priority: 'apos;high'apos; as const
      },
      {
        header: 'apos;Strict-Transport-Security'apos;,
        description: 'apos;Force l\'apos;utilisation de HTTPS'apos;,
        priority: 'apos;high'apos; as const
      },
      {
        header: 'apos;X-Frame-Options'apos;,
        description: 'apos;Protège contre le clickjacking'apos;,
        priority: 'apos;medium'apos; as const
      },
      {
        header: 'apos;X-Content-Type-Options'apos;,
        description: 'apos;Empêche le MIME type sniffing'apos;,
        priority: 'apos;medium'apos; as const
      }
    ];

    return {
      score: observatory.score || 0,
      missing: observatory.tests_failed || [],
      present: observatory.tests_passed || [],
      recommendations
    };
  }

  /**
   * Extrait les vulnérabilités détectées
   */
  private extractVulnerabilities(observatory: any, ssl: any): SecurityResult['apos;vulnerabilities'apos;] {
    const vulnerabilities: SecurityResult['apos;vulnerabilities'apos;] = [];

    // Vulnérabilités Observatory
    if (observatory?.tests_failed) {
      observatory.tests_failed.forEach((test: string) => {
        vulnerabilities.push({
          id: `obs-${test}`,
          severity: 'apos;medium'apos;,
          title: `En-tête manquant: ${test}`,
          description: `L'apos;en-tête de sécurité ${test} n'apos;est pas configuré`,
          fix: `Configurer l'apos;en-tête ${test} sur votre serveur web`
        });
      });
    }

    // Vulnérabilités SSL
    if (ssl?.endpoints?.[0]?.details?.vulnerabilities) {
      ssl.endpoints[0].details.vulnerabilities.forEach((vuln: any) => {
        vulnerabilities.push({
          id: `ssl-${vuln.id}`,
          severity: this.mapSSLSeverity(vuln.severity),
          title: vuln.name,
          description: vuln.description,
          fix: vuln.fix || 'apos;Mettre à jour la configuration SSL'apos;
        });
      });
    }

    return vulnerabilities.slice(0, 10); // Top 10 vulnérabilités
  }

  /**
   * Génère un rapport de sécurité lisible
   */
  generateSecurityReport(result: SecurityResult): string {
    const { overallScore, grade, ssl, headers, vulnerabilities } = result;

    return `# 🔒 Rapport de Sécurité - ${result.url}

**Date d'apos;analyse :** ${new Date(result.timestamp).toLocaleDateString('apos;fr-FR'apos;)}
**Score global :** ${overallScore}/100 (Grade ${grade}) ${this.getSecurityEmoji(grade)}

## 🛡️ Certificat SSL

**Grade SSL :** ${ssl.grade} (${ssl.score}/100)

${ssl.issues.length > 0 ? `### ⚠️ Problèmes SSL détectés
${ssl.issues.map(issue => 
  `- **${this.getSeverityEmoji(issue.severity)} ${issue.title}**  
  ${issue.description}`
).join('apos;\n'apos;)}` : 'apos;✅ Aucun problème SSL majeur détecté'apos;}

## 🔐 En-têtes de Sécurité

**Score en-têtes :** ${headers.score}/100

### 📋 Recommandations prioritaires
${headers.recommendations.map(rec => 
  `- **${rec.priority === 'apos;high'apos; ? 'apos;🔴'apos; : 'apos;🟡'apos;} ${rec.header}**  
  ${rec.description}`
).join('apos;\n'apos;)}

## 🚨 Vulnérabilités Détectées

${vulnerabilities.length > 0 ? vulnerabilities.map(vuln => 
  `### ${this.getSeverityEmoji(vuln.severity)} ${vuln.title}
**Sévérité :** ${vuln.severity.toUpperCase()}  
**Description :** ${vuln.description}  
**Solution :** ${vuln.fix}
`
).join('apos;\n'apos;) : 'apos;✅ Aucune vulnérabilité critique détectée'apos;}

## 📋 Plan d'apos;Action Recommandé

### 🔴 Actions Critiques (À faire immédiatement)
${vulnerabilities.filter(v => v.severity === 'apos;critical'apos;).map(v => `- ${v.title}`).join('apos;\n'apos;) || 'apos;- Aucune action critique requise'apos;}

### 🟡 Actions Importantes (Cette semaine)
${vulnerabilities.filter(v => v.severity === 'apos;high'apos;).map(v => `- ${v.title}`).join('apos;\n'apos;) || 'apos;- Configurer les en-têtes de sécurité manquants'apos;}

### 🟢 Améliorations (Ce mois-ci)
${vulnerabilities.filter(v => v.severity === 'apos;medium'apos;).map(v => `- ${v.title}`).join('apos;\n'apos;) || 'apos;- Optimiser la configuration SSL'apos;}

---
*Analyse générée par SecurityBot - Beriox AI*`;
  }

  // Méthodes utilitaires
  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url.replace(/^https?:\/\//, 'apos;'apos;).split('apos;/'apos;)[0];
    }
  }

  private gradeToScore(grade: string): number {
    const gradeMap: Record<string, number> = {
      'apos;A+'apos;: 100, 'apos;A'apos;: 90, 'apos;A-'apos;: 85,
      'apos;B+'apos;: 80, 'apos;B'apos;: 70, 'apos;B-'apos;: 65,
      'apos;C+'apos;: 60, 'apos;C'apos;: 50, 'apos;C-'apos;: 45,
      'apos;D'apos;: 30, 'apos;E'apos;: 20, 'apos;F'apos;: 0
    };
    return gradeMap[grade] || 0;
  }

  private scoreToGrade(score: number): SecurityResult['apos;grade'apos;] {
    if (score >= 95) return 'apos;A+'apos;;
    if (score >= 85) return 'apos;A'apos;;
    if (score >= 75) return 'apos;B'apos;;
    if (score >= 65) return 'apos;C'apos;;
    if (score >= 50) return 'apos;D'apos;;
    if (score >= 35) return 'apos;E'apos;;
    return 'apos;F'apos;;
  }

  private mapSSLSeverity(severity: number | string): 'apos;critical'apos; | 'apos;high'apos; | 'apos;medium'apos; | 'apos;low'apos; {
    if (typeof severity === 'apos;number'apos;) {
      if (severity >= 4) return 'apos;critical'apos;;
      if (severity >= 3) return 'apos;high'apos;;
      if (severity >= 2) return 'apos;medium'apos;;
      return 'apos;low'apos;;
    }
    return severity as any || 'apos;medium'apos;;
  }

  private getSecurityEmoji(grade: string): string {
    if (['apos;A+'apos;, 'apos;A'apos;].includes(grade)) return 'apos;🟢'apos;;
    if (['apos;B'apos;, 'apos;C'apos;].includes(grade)) return 'apos;🟡'apos;;
    return 'apos;🔴'apos;;
  }

  private getSeverityEmoji(severity: string): string {
    switch (severity) {
      case 'apos;critical'apos;: return 'apos;🚨'apos;;
      case 'apos;high'apos;: return 'apos;🔴'apos;;
      case 'apos;medium'apos;: return 'apos;🟡'apos;;
      case 'apos;low'apos;: return 'apos;🟢'apos;;
      default: return 'apos;ℹ️'apos;;
    }
  }
}

export const securityService = new SecurityService();
