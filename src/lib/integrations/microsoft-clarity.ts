import { ApiResponse, UxData } from 'apos;./types'apos;;

export class MicrosoftClarityAPI {
  private apiKey: string;
  private baseUrl = 'apos;https://www.clarity.ms/api'apos;;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getProjects(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/projects`, {
        headers: {
          'apos;Authorization'apos;: `Bearer ${this.apiKey}`,
          'apos;Content-Type'apos;: 'apos;application/json'apos;,
        },
      });

      if (!response.ok) {
        throw new Error(`Microsoft Clarity API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data.projects || [],
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getSessionData(projectId: string, startDate: string, endDate: string): Promise<ApiResponse<UxData>> {
    try {
      const params = new URLSearchParams({
        start: startDate,
        end: endDate,
        limit: 'apos;100'apos;,
      });

      const response = await fetch(`${this.baseUrl}/projects/${projectId}/sessions?${params}`, {
        headers: {
          'apos;Authorization'apos;: `Bearer ${this.apiKey}`,
          'apos;Content-Type'apos;: 'apos;application/json'apos;,
        },
      });

      if (!response.ok) {
        throw new Error(`Microsoft Clarity API error: ${response.status}`);
      }

      const data = await response.json();

      // Traiter les données de session
      const recordings = data.sessions?.map((session: any) => ({
        sessionId: session.id,
        duration: session.totalTime || 0,
        url: session.url || 'apos;'apos;,
        userAgent: session.userAgent || 'apos;Unknown'apos;,
      })) || [];

      // Simuler des données de heatmap (Clarity ne fournit pas directement ces données via API)
      const heatmaps = data.pages?.map((page: any) => ({
        url: page.url,
        clickCount: page.clicks || 0,
        scrollDepth: page.scrollDepth || 0,
        timeOnPage: page.averageTime || 0,
      })) || [];

      return {
        success: true,
        data: {
          heatmaps,
          recordings,
          userFeedback: [], // Clarity ne fournit pas de feedback utilisateur via API
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getHeatmapData(projectId: string, url: string): Promise<ApiResponse<any>> {
    try {
      const params = new URLSearchParams({
        url: encodeURIComponent(url),
      });

      const response = await fetch(`${this.baseUrl}/projects/${projectId}/heatmaps?${params}`, {
        headers: {
          'apos;Authorization'apos;: `Bearer ${this.apiKey}`,
          'apos;Content-Type'apos;: 'apos;application/json'apos;,
        },
      });

      if (!response.ok) {
        throw new Error(`Microsoft Clarity API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data.heatmap || {},
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
