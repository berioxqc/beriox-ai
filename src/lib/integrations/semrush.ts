import { 
  ApiResponse, 
  CompetitorData, 
  OrganicTrafficData, 
  OrganicKeywordsData, 
  BacklinksData, 
  DomainOverviewData,
  ApiError 
} from './types'
export class SEMrushAPI {
  private baseUrl = 'https://api.semrush.com/analytics/ta.php'
  private apiKey: string
  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Analyse du trafic organique d'un domaine
   */
  async getOrganicTraffic(domain: string, database: string = 'fr'): Promise<ApiResponse<OrganicTrafficData>> {
    try {
      const params = new URLSearchParams({
        key: this.apiKey,
        type: 'domain_ranks',
        key_type: 'domain',
        database: database,
        display_limit: '10',
        export_columns: 'Dn,Rk,Or,Ot,Oc,Ad,At,Ac',
      })
      const response = await fetch(`${this.baseUrl}?${params}`)
      if (!response.ok) {
        throw new Error(`SEMrush API error: ${response.status}`)
      }

      const data = await response.text()
      const rows = data.trim().split('\n').slice(1); // Ignorer l'en-tête
      
      const results = rows.map(row => {
        const columns = row.split(';')
        return {
          domain: columns[0],
          rank: parseInt(columns[1]) || 0,
          organicKeywords: parseInt(columns[2]) || 0,
          organicTraffic: parseInt(columns[3]) || 0,
          organicCost: parseInt(columns[4]) || 0,
          adwordsKeywords: parseInt(columns[5]) || 0,
          adwordsTraffic: parseInt(columns[6]) || 0,
          adwordsCost: parseInt(columns[7]) || 0,
        }
      })
      return {
        success: true,
        data: {
          domain,
          organicData: results,
          lastUpdated: new Date(),
        },
      }
    } catch (error: unknown) {
      const apiError = error as ApiError
      return {
        success: false,
        error: apiError.message,
      }
    }
  }

  /**
   * Analyse des mots-clés organiques
   */
  async getOrganicKeywords(domain: string, database: string = 'fr'): Promise<ApiResponse<OrganicKeywordsData>> {
    try {
      const params = new URLSearchParams({
        key: this.apiKey,
        type: 'domain_organic',
        key_type: 'domain',
        database: database,
        display_limit: '100',
        export_columns: 'Dn,Ur,Kw,Po,Tr,Tc,Co,Nr',
      })
      const response = await fetch(`${this.baseUrl}?${params}`)
      if (!response.ok) {
        throw new Error(`SEMrush API error: ${response.status}`)
      }

      const data = await response.text()
      const rows = data.trim().split('\n').slice(1)
      const keywords = rows.map(row => {
        const columns = row.split(';')
        return {
          keyword: columns[2],
          position: parseInt(columns[3]) || 0,
          traffic: parseInt(columns[4]) || 0,
          trafficCost: parseInt(columns[5]) || 0,
          competition: parseFloat(columns[6]) || 0,
          results: parseInt(columns[7]) || 0,
        }
      })
      return {
        success: true,
        data: {
          domain,
          keywords,
          lastUpdated: new Date(),
        },
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Analyse des backlinks
   */
  async getBacklinks(domain: string, database: string = 'fr'): Promise<ApiResponse<any>> {
    try {
      const params = new URLSearchParams({
        key: this.apiKey,
        type: 'backlinks_overview',
        key_type: 'domain',
        database: database,
        export_columns: 'Dn,BL,BLD,BLP,BLT',
      })
      const response = await fetch(`${this.baseUrl}?${params}`)
      if (!response.ok) {
        throw new Error(`SEMrush API error: ${response.status}`)
      }

      const data = await response.text()
      const rows = data.trim().split('\n').slice(1)
      const backlinks = rows.map(row => {
        const columns = row.split(';')
        return {
          domain: columns[0],
          backlinks: parseInt(columns[1]) || 0,
          domains: parseInt(columns[2]) || 0,
          pages: parseInt(columns[3]) || 0,
          text: parseInt(columns[4]) || 0,
        }
      })
      return {
        success: true,
        data: {
          domain,
          backlinks: backlinks[0] || {},
          lastUpdated: new Date(),
        },
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Analyse des concurrents
   */
  async getCompetitors(domain: string, database: string = 'fr'): Promise<ApiResponse<any>> {
    try {
      const params = new URLSearchParams({
        key: this.apiKey,
        type: 'domain_organic_organic',
        key_type: 'domain',
        database: database,
        display_limit: '20',
        export_columns: 'Dn,Or,Ot,Oc,Ad,At,Ac',
      })
      const response = await fetch(`${this.baseUrl}?${params}`)
      if (!response.ok) {
        throw new Error(`SEMrush API error: ${response.status}`)
      }

      const data = await response.text()
      const rows = data.trim().split('\n').slice(1)
      const competitors = rows.map(row => {
        const columns = row.split(';')
        return {
          domain: columns[0],
          organicKeywords: parseInt(columns[1]) || 0,
          organicTraffic: parseInt(columns[2]) || 0,
          organicCost: parseInt(columns[3]) || 0,
          adwordsKeywords: parseInt(columns[4]) || 0,
          adwordsTraffic: parseInt(columns[5]) || 0,
          adwordsCost: parseInt(columns[6]) || 0,
        }
      })
      return {
        success: true,
        data: {
          domain,
          competitors,
          lastUpdated: new Date(),
        },
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Analyse complète d'un domaine
   */
  async getCompleteAnalysis(domain: string, database: string = 'fr'): Promise<ApiResponse<CompetitorData>> {
    try {
      const [organicResult, keywordsResult, backlinksResult, competitorsResult] = await Promise.allSettled([
        this.getOrganicTraffic(domain, database),
        this.getOrganicKeywords(domain, database),
        this.getBacklinks(domain, database),
        this.getCompetitors(domain, database),
      ])
      const organic = organicResult.status === 'fulfilled' ? organicResult.value : null
      const keywords = keywordsResult.status === 'fulfilled' ? keywordsResult.value : null
      const backlinks = backlinksResult.status === 'fulfilled' ? backlinksResult.value : null
      const competitors = competitorsResult.status === 'fulfilled' ? competitorsResult.value : null
      if (!organic?.success) {
        throw new Error('Impossible d\'obtenir les données organiques')
      }

      return {
        success: true,
        data: {
          domain,
          totalVisits: organic.data.organicData?.[0]?.organicTraffic || 0,
          organicKeywords: organic.data.organicData?.[0]?.organicKeywords || 0,
          organicCost: organic.data.organicData?.[0]?.organicCost || 0,
          keywords: keywords?.data || {},
          backlinks: backlinks?.data || {},
          competitors: competitors?.data || {},
          lastUpdated: new Date(),
        },
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }
}
