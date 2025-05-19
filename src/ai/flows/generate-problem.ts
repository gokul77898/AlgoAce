'use server';
/**
 * @fileOverview Generates LeetCode-style coding problems based on difficulty, topics, and language.
 *
 * - generateProblem - A function that generates coding problems.
 * - GenerateProblemInput - The input type for the generateProblem function.
 * - GenerateProblemOutput - The return type for the generateProblem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { CodingLanguage } from '@/lib/types';

const codingLanguages: [CodingLanguage, ...CodingLanguage[]] = ['javascript', 'python', 'java', 'cpp', 'go'];

const GenerateProblemInputSchema = z.object({
  difficulty: z
    .enum(['easy', 'medium', 'hard'])
    .describe('The difficulty level of the coding problem.'),
  topics: z.string().describe('The topics or categories of the coding problem (e.g., arrays, strings, trees, graphs, dynamic programming).'),
  language: z.enum(codingLanguages).describe('The preferred coding language for examples.'),
});
export type GenerateProblemInput = z.infer<typeof GenerateProblemInputSchema>;

const GenerateProblemOutputSchema = z.object({
  title: z.string().describe('The title of the coding problem.'),
  description: z.string().describe('The detailed description of the coding problem.'),
  constraints: z.string().describe('The constraints for the coding problem.'),
  examples: z.string().describe('Example inputs and expected outputs, tailored to the specified language.'),
  language: z.enum(codingLanguages).describe('The coding language for which the problem (especially examples) is tailored.'),
});
export type GenerateProblemOutput = z.infer<typeof GenerateProblemOutputSchema>;

export async function generateProblem(input: GenerateProblemInput): Promise<GenerateProblemOutput> {
  return generateProblemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProblemPrompt',
  input: {schema: GenerateProblemInputSchema},
  output: {schema: GenerateProblemOutputSchema},
  prompt: `You are a coding interview problem generator. Generate a LeetCode-style coding problem based on the following criteria:

Difficulty: {{{difficulty}}}
Topics: {{{topics}}}
Language for examples: {{{language}}}

The output MUST be a JSON object with the fields: "title", "description", "constraints", "examples", and "language".
Ensure the "examples" field contains code snippets and explanations relevant to the specified "language".
The "language" field in the output JSON object MUST be the same as the input "language" ({{{language}}}).
`,
});

const generateProblemFlow = ai.defineFlow(
  {
    name: 'generateProblemFlow',
    inputSchema: GenerateProblemInputSchema,
    outputSchema: GenerateProblemOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    // Ensure the language from input is consistently part of the output, overriding if AI missed it.
    return { ...output!, language: input.language };
  }
);
