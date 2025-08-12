// Service d'intégration avec Google Analytics 4 API

export interface AnalyticsConnection {
  id: string
  userId: string
  propertyId: string
  propertyName: string
  websiteUrl: string
  accessToken: string
  refreshToken: string
  connectedAt: string
  lastSync?: string
}

export interface AnalyticsData {
  propertyId: string
  period: {
    startDate: string
    endDate: string
  }
  overview: {
    users: number
    newUsers: number
    sessions: number
    pageviews: number
    bounceRate: number
    averageSessionDuration: number
    conversions: number
    conversionRate: number
  }
  traffic: {
    sources: Array<{
      source: string
      medium: string
      users: number
      sessions: number
      percentage: number
    }>
    devices: Array<{
      category: string
      users: number
      percentage: number
    }>
    countries: Array<{
      country: string
      users: number
      percentage: number
    }>
  }
  content: {
    topPages: Array<{
      page: string
      pageviews: number
      uniquePageviews: number
      avgTimeOnPage: number
      bounceRate: number
    }>
    landingPages: Array<{
      page: string
      sessions: number
      bounceRate: number
      conversionRate: number
    }>
  }
  goals: Array<{
    name: string
    completions: number
    conversionRate: number
    value: number
  }>
  trends: {
    usersGrowth: number
    sessionsGrowth: number
    conversionGrowth: number
  }
}

class GoogleAnalyticsService {
  private clientId: string
  private clientSecret: string
  private redirectUri: string
  private scope = 'https://www.googleapis.com/auth/analytics.readonly'
  constructor() {
    this.clientId = process.env.GOOGLE_ANALYTICS_CLIENT_ID || ''
    this.clientSecret = process.env.GOOGLE_ANALYTICS_CLIENT_SECRET || ''
    this.redirectUri = process.env.GOOGLE_ANALYTICS_REDIRECT_URI || 'http://localhost:4001/api/analytics/callback'
    // Ne pas afficher d'avertissement lors du build
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
      if (!this.clientId || !this.clientSecret) {
        // Log silencieux en production
      }
    } else if (!this.clientId || !this.clientSecret) {
      console.warn('⚠️ Google Analytics credentials not configured')
    }
  }

  /**
   * Génère l'URL d'autorisation OAuth2
   */
  getAuthUrl(userId: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scope,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      state: userId // Pour identifier l'utilisateur au retour
    })
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  }

  /**
   * Échange le code d'autorisation contre des tokens
   */
  async exchangeCodeForTokens(code: string): Promise<{accessToken: string, refreshToken: string} | null> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri,
          grant_type: 'authorization_code',
          code: code
        })
      })
      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.status}`)
      }

      const data = await response.json()
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token
      }
    } catch (error) {
      console.error('❌ Error exchanging code for tokens:', error)
      return null
    }
  }

  /**
   * Rafraîchit le token d'accès
   */
  async refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        })
      })
      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`)
      }

      const data = await response.json()
      return data.access_token
    } catch (error) {
      console.error('❌ Error refreshing token:', error)
      return null
    }
  }

  /**
   * Récupère les propriétés Analytics disponibles
   */
  async getProperties(accessToken: string): Promise<Array<{id: string, name: string, websiteUrl: string}> | null> {
    try {
      const response = await fetch('https://analyticsadmin.googleapis.com/v1alpha/accounts/-/properties', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
      if (!response.ok) {
        throw new Error(`Failed to fetch properties: ${response.status}`)
      }

      const data = await response.json()
      return data.properties?.map((prop: any) => ({
        id: prop.name.split('/').pop(),
        name: prop.displayName,
        websiteUrl: prop.websiteUrl || ''
      })) || []
    } catch (error) {
      console.error('❌ Error fetching properties:', error)
      return null
    }
  }

  /**
   * Récupère les données Analytics pour une période donnée
   */
  async getAnalyticsData(
    propertyId: string, 
    accessToken: string, 
    startDate: string = '30daysAgo', 
    endDate: string = 'today'
  ): Promise<AnalyticsData | null> {
    try {
      // Requête pour les métriques principales
      const mainMetrics = await this.runReport(propertyId, accessToken, {
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'newUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
          { name: 'conversions' },
          { name: 'conversionRate' }
        ]
      })
      // Requête pour les sources de trafic
      const trafficSources = await this.runReport(propertyId, accessToken, {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
        metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 10
      })
      // Requête pour les appareils
      const devices = await this.runReport(propertyId, accessToken, {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }]
      })
      // Requête pour les pages populaires
      const topPages = await this.runReport(propertyId, accessToken, {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'averageTimeOnScreen' },
          { name: 'bounceRate' }
        ],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10
      })
      return this.formatAnalyticsData(propertyId, startDate, endDate, {
        mainMetrics,
        trafficSources,
        devices,
        topPages
      })
    } catch (error) {
      console.error('❌ Error fetching analytics data:', error)
      return null
    }
  }

  /**
   * Exécute un rapport GA4
   */
  private async runReport(propertyId: string, accessToken: string, request: any): Promise<any> {
    const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })
    if (!response.ok) {
      throw new Error(`Report request failed: ${response.status}`)
    }

    return await response.json()
  }

  /**
   * Formate les données Analytics en structure utilisable
   */
  private formatAnalyticsData(
    propertyId: string,
    startDate: string,
    endDate: string,
    reports: any
  ): AnalyticsData {
    const { mainMetrics, trafficSources, devices, topPages } = reports
    // Métriques principales
    const mainRow = mainMetrics.rows?.[0]?.metricValues || []
    const overview = {
      users: parseInt(mainRow[0]?.value || '0'),
      newUsers: parseInt(mainRow[1]?.value || '0'),
      sessions: parseInt(mainRow[2]?.value || '0'),
      pageviews: parseInt(mainRow[3]?.value || '0'),
      bounceRate: parseFloat(mainRow[4]?.value || '0'),
      averageSessionDuration: parseFloat(mainRow[5]?.value || '0'),
      conversions: parseInt(mainRow[6]?.value || '0'),
      conversionRate: parseFloat(mainRow[7]?.value || '0')
    }
    // Sources de trafic
    const totalUsers = overview.users
    const sources = trafficSources.rows?.map((row: any) => ({
      source: row.dimensionValues[0].value,
      medium: row.dimensionValues[1].value,
      users: parseInt(row.metricValues[0].value),
      sessions: parseInt(row.metricValues[1].value),
      percentage: totalUsers > 0 ? (parseInt(row.metricValues[0].value) / totalUsers * 100) : 0
    })) || []
    // Appareils
    const deviceData = devices.rows?.map((row: any) => ({
      category: row.dimensionValues[0].value,
      users: parseInt(row.metricValues[0].value),
      percentage: totalUsers > 0 ? (parseInt(row.metricValues[0].value) / totalUsers * 100) : 0
    })) || []
    // Pages populaires
    const pages = topPages.rows?.map((row: any) => ({
      page: row.dimensionValues[0].value,
      pageviews: parseInt(row.metricValues[0].value),
      uniquePageviews: parseInt(row.metricValues[0].value), // Approximation
      avgTimeOnPage: parseFloat(row.metricValues[1].value),
      bounceRate: parseFloat(row.metricValues[2].value)
    })) || []
    return {
      propertyId,
      period: { startDate, endDate },
      overview,
      traffic: {
        sources,
        devices: deviceData,
        countries: [] // À implémenter si nécessaire
      },
      content: {
        topPages: pages,
        landingPages: [] // À implémenter si nécessaire
      },
      goals: [], // À implémenter avec les conversions personnalisées
      trends: {
        usersGrowth: 0, // À calculer avec les données de période précédente
        sessionsGrowth: 0,
        conversionGrowth: 0
      }
    }
  }

  /**
   * Génère un rapport d'analyse lisible
   */
  generateAnalyticsReport(data: AnalyticsData, propertyName: string): string {
    const { overview, traffic, content } = data
    const period = `${data.period.startDate} au ${data.period.endDate}`
    return `# 📊 Rapport Google Analytics - ${propertyName}

**Période d'analyse :** ${period}
**Propriété :** ${data.propertyId}

## 🎯 Vue d'ensemble

### Audiences
- **Utilisateurs :** ${overview.users.toLocaleString()} (${overview.newUsers.toLocaleString()} nouveaux)
- **Sessions :** ${overview.sessions.toLocaleString()}
- **Pages vues :** ${overview.pageviews.toLocaleString()}

### Engagement
- **Taux de rebond :** ${overview.bounceRate.toFixed(1)}%
- **Durée moyenne session :** ${Math.round(overview.averageSessionDuration / 60)}min ${Math.round(overview.averageSessionDuration % 60)}s
- **Pages/session :** ${(overview.pageviews / overview.sessions).toFixed(1)}

### Conversions
- **Conversions :** ${overview.conversions.toLocaleString()}
- **Taux de conversion :** ${overview.conversionRate.toFixed(2)}%

## 🚀 Sources de Trafic

${traffic.sources.map((source, index) => 
  `${index + 1}. **${source.source}** (${source.medium})
   - ${source.users.toLocaleString()} utilisateurs (${source.percentage.toFixed(1)}%)
   - ${source.sessions.toLocaleString()} sessions`
).join('\n\n')}

## 📱 Répartition par Appareils

${traffic.devices.map(device => 
  `- **${device.category}** : ${device.users.toLocaleString()} utilisateurs (${device.percentage.toFixed(1)}%)`
).join('\n')}

## 📄 Pages les Plus Populaires

${content.topPages.map((page, index) => 
  `${index + 1}. **${page.page}**
   - ${page.pageviews.toLocaleString()} vues
   - ${Math.round(page.avgTimeOnPage / 60)}min ${Math.round(page.avgTimeOnPage % 60)}s en moyenne
   - ${page.bounceRate.toFixed(1)}% de rebond`
).join('\n\n')}

## 💡 Recommandations AnalyticsBot

### 🎯 Optimisations Prioritaires
${this.generateRecommendations(data)}

### 📈 Actions Suggérées
- **Améliorer l'engagement** : Réduire le taux de rebond sur les pages principales
- **Diversifier le trafic** : Développer les sources moins représentées
- **Optimiser les conversions** : Analyser le parcours utilisateur sur les pages à fort trafic
- **Mobile-first** : ${traffic.devices.find(d => d.category === 'mobile')?.percentage || 0 > 50 ? 'Continuer' : 'Prioriser'} l'optimisation mobile

---
*Rapport généré par AnalyticsBot - Beriox AI*`
  }

  /**
   * Génère des recommandations basées sur les données
   */
  private generateRecommendations(data: AnalyticsData): string {
    const recommendations: string[] = []
    const { overview, traffic } = data
    // Taux de rebond élevé
    if (overview.bounceRate > 70) {
      recommendations.push('🔴 **Taux de rebond élevé** : Améliorer la pertinence du contenu et la vitesse de chargement')
    }

    // Durée de session faible
    if (overview.averageSessionDuration < 120) {
      recommendations.push('🟡 **Sessions courtes** : Optimiser l\'engagement avec du contenu interactif')
    }

    // Taux de conversion faible
    if (overview.conversionRate < 2) {
      recommendations.push('🔴 **Conversions faibles** : Revoir le tunnel de conversion et les CTA')
    }

    // Dépendance à une source de trafic
    const topSource = traffic.sources[0]
    if (topSource && topSource.percentage > 60) {
      recommendations.push('🟡 **Dépendance trafic** : Diversifier les sources d\'acquisition')
    }

    return recommendations.length > 0 ? recommendations.join('\n') : '✅ Performances globalement satisfaisantes'
  }
}

export const googleAnalyticsService = new GoogleAnalyticsService()