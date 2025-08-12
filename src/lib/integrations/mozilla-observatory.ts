import { ApiResponse, SecurityData } from 'apos;./types'apos;;

export class MozillaObservatoryAPI {
  private baseUrl = 'apos;https://http-observatory.security.mozilla.org/api/v1'apos;;

  async scanWebsite(domain: string): Promise<ApiResponse<SecurityData>> {
    try {
      // Démarrer un scan
      const scanResponse = await fetch(`${this.baseUrl}/analyze?host=${domain}`, {
        method: 'apos;POST'apos;,
        headers: {
          'apos;Content-Type'apos;: 'apos;application/json'apos;,
        },
      });

      if (!scanResponse.ok) {
        throw new Error(`Mozilla Observatory API error: ${scanResponse.status}`);
      }

      const scanData = await scanResponse.json();
      
      // Attendre que le scan soit terminé (avec timeout)
      let attempts = 0;
      const maxAttempts = 30; // 30 secondes max
      let results;

      while (attempts < maxAttempts) {
        const resultResponse = await fetch(`${this.baseUrl}/analyze?host=${domain}`);
        results = await resultResponse.json();

        if (results.state === 'apos;FINISHED'apos;) {
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }

      if (!results || results.state !== 'apos;FINISHED'apos;) {
        throw new Error('apos;Scan timeout - le scan n\'apos;a pas pu se terminer'apos;);
      }

      // Récupérer les détails du scan
      const detailsResponse = await fetch(`${this.baseUrl}/getScanResults?scan=${results.scan_id}`);
      const details = await detailsResponse.json();

      // Mapper les résultats vers notre format
      const vulnerabilities = Object.entries(details)
        .filter(([key, value]: [string, any]) => value.pass === false)
        .map(([key, value]: [string, any]) => ({
          type: key.replace(/_/g, 'apos; 'apos;).replace(/\b\w/g, l => l.toUpperCase()),
          severity: this.mapSeverity(value.score_modifier),
          description: value.score_description || 'apos;Problème de sécurité détecté'apos;,
          recommendation: this.getRecommendation(key),
        }));

      return {
        success: true,
        data: {
          domain,
          overallGrade: results.grade || 'apos;F'apos;,
          httpsGrade: results.grade || 'apos;F'apos;,
          sslGrade: 'apos;N/A'apos;, // Mozilla Observatory ne fournit pas directement le grade SSL
          vulnerabilities,
          certificates: [], // Sera complété par SSL Labs
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private mapSeverity(scoreModifier: number): 'apos;low'apos; | 'apos;medium'apos; | 'apos;high'apos; | 'apos;critical'apos; {
    if (scoreModifier <= -10) return 'apos;critical'apos;;
    if (scoreModifier <= -5) return 'apos;high'apos;;
    if (scoreModifier <= -2) return 'apos;medium'apos;;
    return 'apos;low'apos;;
  }

  private getRecommendation(testName: string): string {
    const recommendations: Record<string, string> = {
      'apos;content_security_policy'apos;: 'apos;Implémentez une Content Security Policy (CSP) pour prévenir les attaques XSS'apos;,
      'apos;strict_transport_security'apos;: 'apos;Activez HTTP Strict Transport Security (HSTS) pour forcer HTTPS'apos;,
      'apos;x_frame_options'apos;: 'apos;Configurez X-Frame-Options pour prévenir le clickjacking'apos;,
      'apos;x_content_type_options'apos;: 'apos;Ajoutez X-Content-Type-Options: nosniff pour prévenir le MIME sniffing'apos;,
      'apos;referrer_policy'apos;: 'apos;Définissez une Referrer Policy appropriée pour contrôler les informations de référence'apos;,
      'apos;cookies'apos;: 'apos;Sécurisez vos cookies avec les attributs Secure, HttpOnly et SameSite'apos;,
    };

    return recommendations[testName] || 'apos;Consultez la documentation Mozilla Observatory pour plus de détails'apos;;
  }

  async getHistory(domain: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/getScanResults?host=${domain}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get history: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data.history || [],
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
