export interface UserBrandScores {
  name: string;
  priceScore: number;
  featureScore: number;
  reputationScore: number;
  reachScore: number;
}

export interface MarketIntel {
  summary?: string;
  competitorMap: Competitor[];
  userBrand?: UserBrandScores;
  marketGaps: string[];
  whitespaceOpportunities: string[];
  positioning: PositioningAxis[];
  citations?: string[];
}

export interface Competitor {
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  priceScore?: number;      // 1-10: 1=budget, 10=premium
  featureScore?: number;    // 1-10: 1=basic, 10=feature-rich/high quality
  reputationScore?: number; // 1-10: 1=unknown, 10=well-established brand
  reachScore?: number;      // 1-10: 1=niche, 10=mass market
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

export interface CampaignConcept {
  name: string;
  hook: string;
  angle: string;
  coreMessage: string;
  cta: string;
  personaTarget: string;
}

export interface ChannelRecommendation {
  channel: string;
  budgetPercent: number;
  rationale: string;
}

export interface CampaignPlan {
  brief: {
    campaignTitle: string;
    objectiveStatement: string;
    primaryMessage: string;
    targetSegment: string;
    keyInsight: string;
    successMetrics: string[];
  };
  messageArchitecture: {
    primaryMessage: string;
    supportingMessages: string[];
    objectionHandlers: string[];
  };
  channelMix: ChannelRecommendation[];
  concepts: CampaignConcept[];
  selectedConcept: number | null;
}

export interface ContentVariant {
  format: string;
  headline: string;
  body: string;
  cta: string;
}

export interface RepurposeRow {
  format: string;
  adaptation: string;
}

export interface ContentStudio {
  selectedConceptName: string;
  variants: ContentVariant[];
  repurposeMatrix: RepurposeRow[];
}

export interface OrbitProject {
  id: string;
  user_id: string;
  name: string;
  market_intel: MarketIntel | null;
  brand_foundation: BrandFoundation | null;
  audience_studio: AudienceStudio | null;
  campaign_plan: CampaignPlan | null;
  content_studio: ContentStudio | null;
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
