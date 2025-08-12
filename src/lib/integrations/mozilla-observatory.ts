import { ApiResponse, SecurityData } from './types'
export class MozillaObservatoryAPI {
  private baseUrl = 'https://http-observatory.security.mozilla.org/api/v1'
  async scanWebsite(domain: string): Promise<ApiResponse<SecurityData>> {
    try {
      // Démarrer un scan
      const scanResponse = await fetch(`${this.baseUrl}/analyze?host=${domain}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!scanResponse.ok) {
        throw new Error(`Mozilla Observatory API error: ${scanResponse.status}`)
      }

      const scanData = await scanResponse.json()
      // Attendre que le scan soit terminé (avec timeout)
      let attempts = 0
      const maxAttempts = 30; // 30 secondes max
      let results
      while (attempts < maxAttempts) {
        const resultResponse = await fetch(`${this.baseUrl}/analyze?host=${domain}`)
        results = await resultResponse.json()
        if (results.state === 'FINISHED') {
          break
        }

        await new Promise(resolve => setTimeout(resolve, 1000))
        attempts++
      }

      if (!results || results.state !== 'FINISHED') {
        throw new Error('Scan timeout - le scan n\'a pas pu se terminer')
      }

      // Récupérer les détails du scan
      const detailsResponse = await fetch(`${this.baseUrl}/getScanResults?scan=${results.scan_id}`)
      const details = await detailsResponse.json()
      // Mapper les résultats vers notre format
      const vulnerabilities = Object.entries(details)
        .filter(([key, value]: [string, any]) => value.pass === false)
        .map(([key, value]: [string, any]) => ({
          type: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          severity: this.mapSeverity(value.score_modifier),
          description: value.score_description || 'Problème de sécurité détecté',
          recommendation: this.getRecommendation(key),
        }))
      return {
        success: true,
        data: {
          domain,
          overallGrade: results.grade || 'F',
          httpsGrade: results.grade || 'F',
          sslGrade: 'N/A', // Mozilla Observatory ne fournit pas directement le grade SSL
          vulnerabilities,
          certificates: [], // Sera complété par SSL Labs
        },
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  private mapSeverity(scoreModifier: number): 'low' | 'medium' | 'high' | 'critical' {
    if (scoreModifier <= -10) return 'critical'
    if (scoreModifier <= -5) return 'high'
    if (scoreModifier <= -2) return 'medium'
    return 'low'
  }

  private getRecommendation(testName: string): string {
    const recommendations: Record<string, string> = {
      'content_security_policy': 'Implémentez une Content Security Policy (CSP) pour prévenir les attaques XSS',
      'strict_transport_security': 'Activez HTTP Strict Transport Security (HSTS) pour forcer HTTPS',
      'x_frame_options': 'Configurez X-Frame-Options pour prévenir le clickjacking',
      'x_content_type_options': 'Ajoutez X-Content-Type-Options: nosniff pour prévenir le MIME sniffing',
      'referrer_policy': 'Définissez une Referrer Policy appropriée pour contrôler les informations de référence',
      'cookies': 'Sécurisez vos cookies avec les attributs Secure, HttpOnly et SameSite',
    }
    return recommendations[testName] || 'Consultez la documentation Mozilla Observatory pour plus de détails'
  }

  async getHistory(domain: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/getScanResults?host=${domain}`)
      if (!response.ok) {
        throw new Error(`Failed to get history: ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        data: data.history || [],
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }
}
