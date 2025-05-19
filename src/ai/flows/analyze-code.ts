'use server';

/**
 * @fileOverview An AI-powered code analysis tool that offers suggestions for improvement.
 *
 * - analyzeCode - A function that analyzes code and provides improvement suggestions.
 * - AnalyzeCodeInput - The input type for the analyzeCode function.
 * - AnalyzeCodeOutput - The return type for the analyzeCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { CodingLanguage } from '@/lib/types';

const codingLanguages: [CodingLanguage, ...CodingLanguage[]] = ['javascript', 'python', 'java', 'cpp', 'go'];

const AnalyzeCodeInputSchema = z.object({
  code: z.string().describe('The code to be analyzed.'),
  language: z.enum(codingLanguages).describe('The programming language of the code.'),
  problemDescription: z.string().describe('The description of the problem the code is trying to solve.'),
});
export type AnalyzeCodeInput = z.infer<typeof AnalyzeCodeInputSchema>;

const AnalyzeCodeOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of suggestions for improving the code.'),
  overallQuality: z.string().describe('An overall assessment of the code quality.'),
});
export type AnalyzeCodeOutput = z.infer<typeof AnalyzeCodeOutputSchema>;

export async function analyzeCode(input: AnalyzeCodeInput): Promise<AnalyzeCodeOutput> {
  return analyzeCodeFlow(input);
}

const analyzeCodePrompt = ai.definePrompt({
  name: 'analyzeCodePrompt',
  input: {schema: AnalyzeCodeInputSchema},
  output: {schema: AnalyzeCodeOutputSchema},
  prompt: `You are an AI code analysis tool that provides suggestions for improving code quality.

  Analyze the following code, written in {{language}}, which attempts to solve the problem described below, and provide specific, actionable suggestions for improvement.

  Problem Description: {{{problemDescription}}}

  Code:
  {{code}}

  Focus on aspects such as:
  - Code clarity and readability
  - Efficiency and performance
  - Potential bugs and errors
  - Adherence to best practices for the specified language ({{language}})

  Provide an overall assessment of the code quality and a list of suggestions for improvement.
  Format the output as a JSON object with 'suggestions' (an array of strings) and 'overallQuality' (a string).
`,
});

const analyzeCodeFlow = ai.defineFlow(
  {
    name: 'analyzeCodeFlow',
    inputSchema: AnalyzeCodeInputSchema,
    outputSchema: AnalyzeCodeOutputSchema,
  },
  async input => {
    const {output} = await analyzeCodePrompt(input);
    return output!;
  }
);
