import type { GenerateProblemOutput } from '@/ai/flows/generate-problem';
import type { AnalyzeCodeOutput } from '@/ai/flows/analyze-code';
import type { ChatbotResponse } from '@/ai/flows/chatbot-flow';

export type ProblemDifficulty = 'easy' | 'medium' | 'hard';

export const CODING_LANGUAGES = [
  'javascript',
  'python',
  'java',
  'cpp',
  'go',
  'csharp',
  'swift',
  'kotlin',
  'ruby',
  'rust',
  'scala',
  'typescript',
  'php',
  'perl',
] as const;
export type CodingLanguage = typeof CODING_LANGUAGES[number];

export const DSA_TOPICS = [
  'Arrays',
  'Strings',
  'Linked Lists',
  'Trees',
  'Graphs',
  'Hash Tables',
  'Sorting',
  'Searching',
  'Dynamic Programming',
  'Greedy Algorithms',
  'Backtracking',
  'Bit Manipulation',
  'Stacks',
  'Queues',
  'Heaps',
  'Tries',
  'Math',
  'Geometry',
  'Matrix',
  'Two Pointers',
  'Sliding Window',
  'Recursion',
  'Divide and Conquer',
  'Union Find',
  'Segment Trees',
  'Topological Sort',
  'Kadane Algorithm',
] as const;
export type DsaTopic = typeof DSA_TOPICS[number];

export type Problem = GenerateProblemOutput & { language: CodingLanguage };
export type AnalysisResult = AnalyzeCodeOutput;

export type ChatMessage = {
  id: string;
  role: 'user' | 'bot';
  text: string;
  isLoading?: boolean;
};

export type BotResponse = ChatbotResponse;
