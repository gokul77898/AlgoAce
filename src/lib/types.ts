import type { GenerateProblemOutput } from '@/ai/flows/generate-problem';
import type { AnalyzeCodeOutput } from '@/ai/flows/analyze-code';

export type ProblemDifficulty = 'easy' | 'medium' | 'hard';
export type CodingLanguage = 'javascript' | 'python';

export type Problem = GenerateProblemOutput;
export type AnalysisResult = AnalyzeCodeOutput;
