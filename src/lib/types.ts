import type { GenerateProblemOutput } from '@/ai/flows/generate-problem';
import type { AnalyzeCodeOutput } from '@/ai/flows/analyze-code';

export type ProblemDifficulty = 'easy' | 'medium' | 'hard';
export type CodingLanguage = 'javascript' | 'python' | 'java' | 'cpp' | 'go';

export type Problem = GenerateProblemOutput & { language: CodingLanguage }; // Ensure language is part of Problem type
export type AnalysisResult = AnalyzeCodeOutput;
