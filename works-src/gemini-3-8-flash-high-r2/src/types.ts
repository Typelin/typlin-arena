export type ThinkingLevel = 'low' | 'medium' | 'high';

export interface ModelSpec {
  name: string;
  creator: string;
  releaseDate: string;
  intelligenceIndex: number;
  costPerTask: number;
  speedTps: number;
  ttftSeconds: number;
  contextWindow: string;
  maxOutputTokens: string;
  openWeights: boolean;
  inputModalities: string[];
  outputModalities: string[];
}

export interface BenchmarkScore {
  benchmark: string;
  version: string;
  category: string;
  score: string;
  description: string;
  verifiedBy: string;
}

export interface CompetitorComparison {
  model: string;
  creator: string;
  intelligenceIndex: number;
  costPerTask: string;
  outputSpeed: string;
  ttft: string;
  contextWindow: string;
  openWeights: string;
}
