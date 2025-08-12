import { ApiResponse, SecurityData } from './types'
export class SSLLabsAPI {
  private baseUrl = 'https://api.ssllabs.com/api/v3'
  async analyzeSSL(domain: string): Promise<ApiResponse<Partial<SecurityData>>> {
    try {
      // Démarrer l'analyse SSL
      const startResponse = await fetch(
        `${this.baseUrl}/analyze?host=${domain}&startNew=on&all=done`
      )
      if (!startResponse.ok) {
        throw new Error(`SSL Labs API error: ${startResponse.status}`)
      }

      let analysisData = await startResponse.json()
      // Attendre que l'analyse soit terminée
      let attempts = 0
      const maxAttempts = 60; // 60 secondes max

      while (analysisData.status !== 'READY' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Attendre 2 secondes
        
        const checkResponse = await fetch(`${this.baseUrl}/analyze?host=${domain}&all=done`)
        analysisData = await checkResponse.json()
        attempts++
      }

      if (analysisData.status !== 'READY') {
        throw new Error('SSL analysis timeout')
      }

      // Traiter les résultats
      const endpoints = analysisData.endpoints || []
      const mainEndpoint = endpoints[0]
      if (!mainEndpoint) {
        throw new Error('Aucun endpoint SSL trouvé')
      }

      const certificates = mainEndpoint.details?.certs?.map((cert: any) => ({
        issuer: cert.issuerLabel || cert.issuerSubject || 'Unknown',
        expiresAt: new Date(cert.notAfter),
        isValid: !cert.issues,
      })) || []
      // Analyser les vulnérabilités SSL
      const vulnerabilities = []
      const details = mainEndpoint.details
      if (details) {
        // Vérifier les protocoles obsolètes
        if (details.protocols?.some((p: any) => p.version === '1.0' || p.version === '1.1')) {
          vulnerabilities.push({
            type: 'Protocoles SSL/TLS obsolètes',
            severity: 'medium' as const,
            description: 'Le serveur supporte des versions obsolètes de SSL/TLS',
            recommendation: 'Désactivez SSL 2.0, SSL 3.0, TLS 1.0 et TLS 1.1',
          })
        }

        // Vérifier les suites de chiffrement faibles
        if (details.suites?.some((s: any) => s.cipherStrength < 128)) {
          vulnerabilities.push({
            type: 'Suites de chiffrement faibles',
            severity: 'high' as const,
            description: 'Le serveur utilise des suites de chiffrement faibles',
            recommendation: 'Configurez uniquement des suites de chiffrement fortes (256 bits minimum)',
          })
        }

        // Vérifier la vulnérabilité Heartbleed
        if (details.heartbleed) {
          vulnerabilities.push({
            type: 'Heartbleed',
            severity: 'critical' as const,
            description: 'Le serveur est vulnérable à l\'attaque Heartbleed',
            recommendation: 'Mettez à jour OpenSSL immédiatement',
          })
        }

        // Vérifier POODLE
        if (details.poodle || details.poodleTls) {
          vulnerabilities.push({
            type: 'POODLE',
            severity: 'high' as const,
            description: 'Le serveur est vulnérable à l\'attaque POODLE',
            recommendation: 'Désactivez SSL 3.0 et les suites de chiffrement CBC en TLS',
          })
        }
      }

      return {
        success: true,
        data: {
          domain,
          sslGrade: mainEndpoint.grade || 'T',
          certificates,
          vulnerabilities,
        },
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  async getInfo(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/info`)
      if (!response.ok) {
        throw new Error(`Failed to get SSL Labs info: ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        data,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }
}
