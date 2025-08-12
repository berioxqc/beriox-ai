import { ApiResponse, SecurityData } from 'apos;./types'apos;;

export class SSLLabsAPI {
  private baseUrl = 'apos;https://api.ssllabs.com/api/v3'apos;;

  async analyzeSSL(domain: string): Promise<ApiResponse<Partial<SecurityData>>> {
    try {
      // Démarrer l'apos;analyse SSL
      const startResponse = await fetch(
        `${this.baseUrl}/analyze?host=${domain}&startNew=on&all=done`
      );

      if (!startResponse.ok) {
        throw new Error(`SSL Labs API error: ${startResponse.status}`);
      }

      let analysisData = await startResponse.json();

      // Attendre que l'apos;analyse soit terminée
      let attempts = 0;
      const maxAttempts = 60; // 60 secondes max

      while (analysisData.status !== 'apos;READY'apos; && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Attendre 2 secondes
        
        const checkResponse = await fetch(`${this.baseUrl}/analyze?host=${domain}&all=done`);
        analysisData = await checkResponse.json();
        attempts++;
      }

      if (analysisData.status !== 'apos;READY'apos;) {
        throw new Error('apos;SSL analysis timeout'apos;);
      }

      // Traiter les résultats
      const endpoints = analysisData.endpoints || [];
      const mainEndpoint = endpoints[0];

      if (!mainEndpoint) {
        throw new Error('apos;Aucun endpoint SSL trouvé'apos;);
      }

      const certificates = mainEndpoint.details?.certs?.map((cert: any) => ({
        issuer: cert.issuerLabel || cert.issuerSubject || 'apos;Unknown'apos;,
        expiresAt: new Date(cert.notAfter),
        isValid: !cert.issues,
      })) || [];

      // Analyser les vulnérabilités SSL
      const vulnerabilities = [];
      const details = mainEndpoint.details;

      if (details) {
        // Vérifier les protocoles obsolètes
        if (details.protocols?.some((p: any) => p.version === 'apos;1.0'apos; || p.version === 'apos;1.1'apos;)) {
          vulnerabilities.push({
            type: 'apos;Protocoles SSL/TLS obsolètes'apos;,
            severity: 'apos;medium'apos; as const,
            description: 'apos;Le serveur supporte des versions obsolètes de SSL/TLS'apos;,
            recommendation: 'apos;Désactivez SSL 2.0, SSL 3.0, TLS 1.0 et TLS 1.1'apos;,
          });
        }

        // Vérifier les suites de chiffrement faibles
        if (details.suites?.some((s: any) => s.cipherStrength < 128)) {
          vulnerabilities.push({
            type: 'apos;Suites de chiffrement faibles'apos;,
            severity: 'apos;high'apos; as const,
            description: 'apos;Le serveur utilise des suites de chiffrement faibles'apos;,
            recommendation: 'apos;Configurez uniquement des suites de chiffrement fortes (256 bits minimum)'apos;,
          });
        }

        // Vérifier la vulnérabilité Heartbleed
        if (details.heartbleed) {
          vulnerabilities.push({
            type: 'apos;Heartbleed'apos;,
            severity: 'apos;critical'apos; as const,
            description: 'apos;Le serveur est vulnérable à l\'apos;attaque Heartbleed'apos;,
            recommendation: 'apos;Mettez à jour OpenSSL immédiatement'apos;,
          });
        }

        // Vérifier POODLE
        if (details.poodle || details.poodleTls) {
          vulnerabilities.push({
            type: 'apos;POODLE'apos;,
            severity: 'apos;high'apos; as const,
            description: 'apos;Le serveur est vulnérable à l\'apos;attaque POODLE'apos;,
            recommendation: 'apos;Désactivez SSL 3.0 et les suites de chiffrement CBC en TLS'apos;,
          });
        }
      }

      return {
        success: true,
        data: {
          domain,
          sslGrade: mainEndpoint.grade || 'apos;T'apos;,
          certificates,
          vulnerabilities,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getInfo(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/info`);
      
      if (!response.ok) {
        throw new Error(`Failed to get SSL Labs info: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
