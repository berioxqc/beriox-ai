import { ApiResponse, PerformanceData } from './types';

export class PageSpeedInsightsAPI {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeUrl(url: string, strategy: 'mobile' | 'desktop' = 'mobile'): Promise<ApiResponse<PerformanceData>> {
    try {
      const params = new URLSearchParams({
        url: url,
        key: this.apiKey,
        strategy: strategy,
        category: 'performance,accessibility,best-practices,seo',
      });

      const response = await fetch(`${this.baseUrl}?${params}`);

      if (!response.ok) {
        throw new Error(`PageSpeed Insights API error: ${response.status}`);
      }

      const data = await response.json();
      const lighthouse = data.lighthouseResult;
      const categories = lighthouse.categories;
      const audits = lighthouse.audits;

      // Core Web Vitals
      const coreWebVitals = {
        lcp: audits['largest-contentful-paint']?.numericValue || 0,
        fid: audits['max-potential-fid']?.numericValue || 0,
        cls: audits['cumulative-layout-shift']?.numericValue || 0,
      };

      // Opportunités d'amélioration
      const opportunities = Object.values(audits)
        .filter((audit: any) => audit.details?.type === 'opportunity' && audit.numericValue > 0)
        .map((audit: any) => ({
          title: audit.title,
          description: audit.description,
          savings: audit.displayValue || `${Math.round(audit.numericValue)}ms`,
        }))
        .slice(0, 5); // Top 5 opportunités

      return {
        success: true,
        data: {
          url,
          performanceScore: Math.round(categories.performance.score * 100),
          accessibilityScore: Math.round(categories.accessibility.score * 100),
          bestPracticesScore: Math.round(categories['best-practices'].score * 100),
          seoScore: Math.round(categories.seo.score * 100),
          coreWebVitals,
          opportunities,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async batchAnalyze(urls: string[], strategy: 'mobile' | 'desktop' = 'mobile'): Promise<ApiResponse<PerformanceData[]>> {
    try {
      const results = await Promise.allSettled(
        urls.map(url => this.analyzeUrl(url, strategy))
      );

      const successfulResults = results
        .filter((result): result is PromiseFulfilledResult<ApiResponse<PerformanceData>> => 
          result.status === 'fulfilled' && result.value.success
        )
        .map(result => result.value.data!);

      const failedCount = results.length - successfulResults.length;

      return {
        success: true,
        data: successfulResults,
        error: failedCount > 0 ? `${failedCount} analyses ont échoué` : undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
