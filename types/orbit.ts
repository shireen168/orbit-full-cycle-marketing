export interface MarketIntel {
  summary?: string;
  competitorMap: Competitor[];
  marketGaps: string[];
  whitespaceOpportunities: string[];
  positioning: PositioningAxis[];
}

export interface Competitor {
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  priceScore?: number;    // 1-10: 1=free/cheap, 10=enterprise/premium
  featureScore?: number;  // 1-10: 1=minimal, 10=feature-rich
}

export interface PositioningAxis {
  label: string;
  value: number;
}

export interface BrandFoundation {
  positioningStatement: string;
  valueProp: string;
  messagingPillars: MessagingPillar[];
  brandVoice: string[];
  taglines: string[];
  selectedTagline?: string;
}

export interface MessagingPillar {
  title: string;
  description: string;
  icon: string;
}

export interface AudienceStudio {
  personas: Persona[];
}

export interface Persona {
  name: string;
  role: string;
  ageRange: string;
  psychographicSummary: string;
  painPoints: string[];
  buyingTriggers: string[];
  objections: string[];
  preferredChannels: string[];
  sampleAdHook: string;
}

export interface OrbitProject {
  id: string;
  user_id: string;
  name: string;
  market_intel: MarketIntel | null;
  brand_foundation: BrandFoundation | null;
  audience_studio: AudienceStudio | null;
  campaign_plan: null;
  content_studio: null;
  performance_data: null;
  ai_calls_today: number;
  created_at: string;
  updated_at: string;
}

export type ModuleStatus = "locked" | "unlocked" | "complete";

export interface ModuleState {
  marketIntel: ModuleStatus;
  brandFoundation: ModuleStatus;
  audienceStudio: ModuleStatus;
}
