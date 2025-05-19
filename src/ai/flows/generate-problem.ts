'use server';
/**
 * @fileOverview Generates LeetCode-style coding problems based on difficulty and topics.
 *
 * - generateProblem - A function that generates coding problems.
 * - GenerateProblemInput - The input type for the generateProblem function.
 * - GenerateProblemOutput - The return type for the generateProblem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProblemInputSchema = z.object({
  difficulty: z
    .enum(['easy', 'medium', 'hard'])
    .describe('The difficulty level of the coding problem.'),
  topics: z.string().describe('The topics or categories of the coding problem.'),
  language: z.enum(['javascript', 'python']).describe('The preferred coding language.')
});
export type GenerateProblemInput = z.infer<typeof GenerateProblemInputSchema>;

const GenerateProblemOutputSchema = z.object({
  title: z.string().describe('The title of the coding problem.'),
  description: z.string().describe('The detailed description of the coding problem.'),
  constraints: z.string().describe('The constraints for the coding problem.'),
  examples: z.string().describe('Example inputs and expected outputs.'),
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
Language: {{{language}}}

Problem Title:
Description:
Constraints:
Examples:
`,
});

const generateProblemFlow = ai.defineFlow(
  {
    name: 'generateProblemFlow',
    inputSchema: GenerateProblemInputSchema,
    outputSchema: GenerateProblemOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
