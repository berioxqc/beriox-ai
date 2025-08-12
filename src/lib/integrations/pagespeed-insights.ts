import { ApiResponse, PerformanceData } from 'apos;./types'apos;;

export class PageSpeedInsightsAPI {
  private apiKey: string;
  private baseUrl = 'apos;https://www.googleapis.com/pagespeedonline/v5/runPagespeed'apos;;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeUrl(url: string, strategy: 'apos;mobile'apos; | 'apos;desktop'apos; = 'apos;mobile'apos;): Promise<ApiResponse<PerformanceData>> {
    try {
      const params = new URLSearchParams({
        url: url,
        key: this.apiKey,
        strategy: strategy,
        category: 'apos;performance,accessibility,best-practices,seo'apos;,
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
        lcp: audits['apos;largest-contentful-paint'apos;]?.numericValue || 0,
        fid: audits['apos;max-potential-fid'apos;]?.numericValue || 0,
        cls: audits['apos;cumulative-layout-shift'apos;]?.numericValue || 0,
      };

      // Opportunités d'apos;amélioration
      const opportunities = Object.values(audits)
        .filter((audit: any) => audit.details?.type === 'apos;opportunity'apos; && audit.numericValue > 0)
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
          bestPracticesScore: Math.round(categories['apos;best-practices'apos;].score * 100),
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

  async batchAnalyze(urls: string[], strategy: 'apos;mobile'apos; | 'apos;desktop'apos; = 'apos;mobile'apos;): Promise<ApiResponse<PerformanceData[]>> {
    try {
      const results = await Promise.allSettled(
        urls.map(url => this.analyzeUrl(url, strategy))
      );

      const successfulResults = results
        .filter((result): result is PromiseFulfilledResult<ApiResponse<PerformanceData>> => 
          result.status === 'apos;fulfilled'apos; && result.value.success
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
