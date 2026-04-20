export interface SEOConfig {
  keyword: string;
  anchorText: string;
  url: string;
  supportKeywords: string[];
}

export interface GenerationState {
  isGenerating: boolean;
  content: string;
  progress: number;
  eeatScore: number;
  checklist: {
    h1: boolean;
    h2: boolean;
    internalLink: boolean;
    outboundLinks: boolean;
    faq: boolean;
    cta: boolean;
  };
  error?: string;
}
