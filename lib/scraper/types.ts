export interface ScrapedLead {
  businessName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  instagramHandle?: string;
  website?: string;
  source: string;
}

export interface DirectorySourceConfig {
  type: "directory";
  query: string;
  location: string;
  maxResults?: number;
  enrichEmailFromWebsite?: boolean;
}

export interface InstagramSourceConfig {
  type: "instagram";
  handles: string[];
}

export interface CustomUrlSourceConfig {
  type: "custom";
  urls: string[];
}

export type ScrapeSourceConfig =
  | DirectorySourceConfig
  | InstagramSourceConfig
  | CustomUrlSourceConfig;

export interface ScrapeJobInput {
  vertical: string;
  sources: ScrapeSourceConfig[];
}

export interface ScrapeJobResult {
  vertical: string;
  found: number;
  created: number;
  duplicates: number;
  skippedNoContact: number;
  errors: string[];
}
