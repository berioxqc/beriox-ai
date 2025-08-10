// Types communs pour toutes les intégrations API

export interface ApiIntegration {
  id: string;
  name: string;
  description: string;
  category: 'seo' | 'analytics' | 'performance' | 'security' | 'monitoring' | 'ux' | 'accessibility' | 'infrastructure' | 'productivity' | 'development' | 'communication' | 'local' | 'trends' | 'competitors';
  isEnabled: boolean;
  isFree: boolean;
  quotaLimit?: number;
  quotaUsed?: number;
  lastSync?: Date;
  config?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  quotaRemaining?: number;
  nextSync?: Date;
}

export interface SeoData {
  domain: string;
  keywords: Array<{
    query: string;
    position: number;
    clicks: number;
    impressions: number;
    ctr: number;
  }>;
  indexingErrors: Array<{
    url: string;
    error: string;
    type: string;
  }>;
  backlinks?: number;
  organicTraffic?: number;
}

export interface AnalyticsData {
  sessions: number;
  users: number;
  pageviews: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversions: number;
  topPages: Array<{
    path: string;
    views: number;
    uniqueViews: number;
  }>;
  trafficSources: Array<{
    source: string;
    sessions: number;
    percentage: number;
  }>;
}

export interface PerformanceData {
  url: string;
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  seoScore: number;
  coreWebVitals: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
  };
  opportunities: Array<{
    title: string;
    description: string;
    savings: string;
  }>;
}

export interface SecurityData {
  domain: string;
  overallGrade: string;
  httpsGrade: string;
  sslGrade: string;
  vulnerabilities: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
  }>;
  certificates: Array<{
    issuer: string;
    expiresAt: Date;
    isValid: boolean;
  }>;
}

export interface UptimeData {
  url: string;
  status: 'up' | 'down' | 'paused';
  uptimePercentage: number;
  responseTime: number;
  incidents: Array<{
    timestamp: Date;
    duration: number;
    reason: string;
  }>;
}

export interface UxData {
  heatmaps: Array<{
    url: string;
    clickCount: number;
    scrollDepth: number;
    timeOnPage: number;
  }>;
  recordings: Array<{
    sessionId: string;
    duration: number;
    url: string;
    userAgent: string;
  }>;
  userFeedback: Array<{
    rating: number;
    comment: string;
    url: string;
    timestamp: Date;
  }>;
}

export interface AccessibilityData {
  url: string;
  score: number;
  errors: Array<{
    type: string;
    count: number;
    description: string;
    impact: 'minor' | 'moderate' | 'serious' | 'critical';
  }>;
  warnings: Array<{
    type: string;
    count: number;
    description: string;
  }>;
  wcagLevel: 'A' | 'AA' | 'AAA' | 'none';
}

export interface CompetitorData {
  domain: string;
  totalVisits?: number;
  averageVisitDuration?: number;
  pagesPerVisit?: number;
  bounceRate?: number;
  organicKeywords?: number;
  organicCost?: number;
  trafficSources?: {
    directTraffic?: number;
    searchTraffic?: number;
    socialTraffic?: number;
    referralTraffic?: number;
    emailTraffic?: number;
    displayTraffic?: number;
  };
  keywords?: {
    organicKeywords?: Array<{
      keyword: string;
      position: number;
      traffic: number;
      trafficCost: number;
      competition: number;
      results: number;
    }>;
    paidKeywords?: Array<{
      keyword: string;
      position: number;
      traffic: number;
      cost: number;
    }>;
    keywordDifficulty?: Record<string, number>;
    searchVolume?: Record<string, number>;
  };
  backlinks?: {
    backlinks?: number;
    domains?: number;
    pages?: number;
    text?: number;
  };
  competitors?: Array<{
    domain: string;
    overlapScore?: number;
    trafficShare?: number;
    category?: string;
    organicKeywords?: number;
    organicTraffic?: number;
    organicCost?: number;
    adwordsKeywords?: number;
    adwordsTraffic?: number;
    adwordsCost?: number;
  }>;
  competitorAnalysis?: {
    competitors?: Array<{
      domain: string;
      organicKeywords: number;
      organicTraffic: number;
      organicCost: number;
      adwordsKeywords: number;
      adwordsTraffic: number;
      adwordsCost: number;
    }>;
  };
  lastUpdated: Date;
}
