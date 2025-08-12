// Types pour les intégrations API

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CompetitorData {
  domain: string;
  rank: number;
  organicKeywords: number;
  organicTraffic: number;
  organicCost: number;
  adwordsKeywords: number;
  adwordsTraffic: number;
  adwordsCost: number;
}

export interface OrganicTrafficData {
  domain: string;
  organicData: CompetitorData[];
  lastUpdated: Date;
}

export interface KeywordData {
  keyword: string;
  position: number;
  traffic: number;
  trafficCost: number;
  competition: number;
  results: number;
}

export interface OrganicKeywordsData {
  domain: string;
  keywords: KeywordData[];
  lastUpdated: Date;
}

export interface BacklinkData {
  domain: string;
  backlinks: number;
  domains: number;
  pages: number;
  text: number;
}

export interface BacklinksData {
  domain: string;
  backlinks: BacklinkData[];
  lastUpdated: Date;
}

export interface DomainOverviewData {
  domain: string;
  authority: number;
  traffic: number;
  keywords: number;
  backlinks: number;
  lastUpdated: Date;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
}
