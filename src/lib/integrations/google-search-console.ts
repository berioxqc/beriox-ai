import { ApiResponse, SeoData } from 'apos;./types'apos;;

export class GoogleSearchConsoleAPI {
  private accessToken: string;
  private baseUrl = 'apos;https://searchconsole.googleapis.com/webmasters/v3'apos;;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getSiteData(siteUrl: string, startDate: string, endDate: string): Promise<ApiResponse<SeoData>> {
    try {
      const searchAnalyticsUrl = `${this.baseUrl}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
      
      const response = await fetch(searchAnalyticsUrl, {
        method: 'apos;POST'apos;,
        headers: {
          'apos;Authorization'apos;: `Bearer ${this.accessToken}`,
          'apos;Content-Type'apos;: 'apos;application/json'apos;,
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ['apos;query'apos;],
          rowLimit: 100,
        }),
      });

      if (!response.ok) {
        throw new Error(`Google Search Console API error: ${response.status}`);
      }

      const data = await response.json();
      
      const keywords = data.rows?.map((row: any) => ({
        query: row.keys[0],
        position: Math.round(row.position),
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: Math.round(row.ctr * 100 * 100) / 100, // Pourcentage avec 2 décimales
      })) || [];

      // Récupérer les erreurs d'apos;indexation
      const indexingErrors = await this.getIndexingIssues(siteUrl);

      return {
        success: true,
        data: {
          domain: siteUrl,
          keywords,
          indexingErrors,
          organicTraffic: keywords.reduce((sum: number, k: any) => sum + k.clicks, 0),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async getIndexingIssues(siteUrl: string) {
    try {
      const issuesUrl = `${this.baseUrl}/sites/${encodeURIComponent(siteUrl)}/sitemaps`;
      
      const response = await fetch(issuesUrl, {
        headers: {
          'apos;Authorization'apos;: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      
      return data.sitemap?.map((sitemap: any) => ({
        url: sitemap.path,
        error: sitemap.errors?.[0]?.details || 'apos;Unknown error'apos;,
        type: 'apos;sitemap'apos;,
      })) || [];
    } catch {
      return [];
    }
  }

  async getSites(): Promise<ApiResponse<string[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/sites`, {
        headers: {
          'apos;Authorization'apos;: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get sites: ${response.status}`);
      }

      const data = await response.json();
      const sites = data.siteEntry?.map((site: any) => site.siteUrl) || [];

      return {
        success: true,
        data: sites,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
