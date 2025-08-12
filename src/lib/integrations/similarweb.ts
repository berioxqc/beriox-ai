import { ApiResponse, CompetitorData } from 'apos;./types'apos;;

export class SimilarWebAPI {
  private baseUrl = 'apos;https://api.similarweb.com/v1'apos;;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Analyse du trafic d'apos;un domaine
   */
  async getTrafficAnalysis(domain: string): Promise<ApiResponse<CompetitorData>> {
    try {
      const response = await fetch(`${this.baseUrl}/website/${domain}/total-traffic-and-engagement/visits`, {
        headers: {
          'apos;api-key'apos;: this.apiKey,
          'apos;Content-Type'apos;: 'apos;application/json'apos;,
        },
      });

      if (!response.ok) {
        throw new Error(`SimilarWeb API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: {
          domain,
          totalVisits: data.visits || 0,
          averageVisitDuration: data.averageVisitDuration || 0,
          pagesPerVisit: data.pagesPerVisit || 0,
          bounceRate: data.bounceRate || 0,
          trafficSources: data.trafficSources || {},
          topKeywords: data.topKeywords || [],
          competitors: data.competitors || [],
          lastUpdated: new Date(),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Analyse des mots-clés d'apos;un domaine
   */
  async getKeywordAnalysis(domain: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/website/${domain}/search/keyword`, {
        headers: {
          'apos;api-key'apos;: this.apiKey,
          'apos;Content-Type'apos;: 'apos;application/json'apos;,
        },
      });

      if (!response.ok) {
        throw new Error(`SimilarWeb API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: {
          domain,
          organicKeywords: data.organic || [],
          paidKeywords: data.paid || [],
          keywordDifficulty: data.difficulty || {},
          searchVolume: data.volume || {},
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Analyse des sources de trafic
   */
  async getTrafficSources(domain: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/website/${domain}/traffic-sources/overview`, {
        headers: {
          'apos;api-key'apos;: this.apiKey,
          'apos;Content-Type'apos;: 'apos;application/json'apos;,
        },
      });

      if (!response.ok) {
        throw new Error(`SimilarWeb API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: {
          domain,
          directTraffic: data.direct || 0,
          searchTraffic: data.search || 0,
          socialTraffic: data.social || 0,
          referralTraffic: data.referral || 0,
          emailTraffic: data.email || 0,
          displayTraffic: data.display || 0,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Analyse des concurrents
   */
  async getCompetitors(domain: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/website/${domain}/competitors/overview`, {
        headers: {
          'apos;api-key'apos;: this.apiKey,
          'apos;Content-Type'apos;: 'apos;application/json'apos;,
        },
      });

      if (!response.ok) {
        throw new Error(`SimilarWeb API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: {
          domain,
          competitors: data.competitors?.map((comp: any) => ({
            domain: comp.domain,
            overlapScore: comp.overlapScore || 0,
            trafficShare: comp.trafficShare || 0,
            category: comp.category || 'apos;'apos;,
          })) || [],
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Analyse complète d'apos;un domaine
   */
  async getCompleteAnalysis(domain: string): Promise<ApiResponse<CompetitorData>> {
    try {
      const [trafficResult, keywordsResult, sourcesResult, competitorsResult] = await Promise.allSettled([
        this.getTrafficAnalysis(domain),
        this.getKeywordAnalysis(domain),
        this.getTrafficSources(domain),
        this.getCompetitors(domain),
      ]);

      const traffic = trafficResult.status === 'apos;fulfilled'apos; ? trafficResult.value : null;
      const keywords = keywordsResult.status === 'apos;fulfilled'apos; ? keywordsResult.value : null;
      const sources = sourcesResult.status === 'apos;fulfilled'apos; ? sourcesResult.value : null;
      const competitors = competitorsResult.status === 'apos;fulfilled'apos; ? competitorsResult.value : null;

      if (!traffic?.success) {
        throw new Error('apos;Impossible d\'apos;obtenir les données de trafic'apos;);
      }

      return {
        success: true,
        data: {
          ...traffic.data,
          keywords: keywords?.data || {},
          trafficSources: sources?.data || {},
          competitorAnalysis: competitors?.data || {},
          lastUpdated: new Date(),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
