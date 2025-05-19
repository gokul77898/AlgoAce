'use server';
/**
 * @fileOverview A chatbot AI flow to assist users with coding problems.
 *
 * - chatbotProcessMessage - A function that handles the chatbot interaction.
 * - ChatbotInput - The input type for the chatbotProcessMessage function.
 * - ChatbotResponse - The return type for the chatbotProcessMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type {Content} from 'genkit/model';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  parts: z.array(z.object({text: z.string()})),
});

const ChatbotInputSchema = z.object({
  userMessage: z.string().describe("The user's current message to the chatbot."),
  problemTitle: z.string().optional().describe('The title of the current coding problem.'),
  problemDescription: z.string().optional().describe('The description of the current coding problem.'),
  currentCode: z.string().optional().describe("The user's current code solution for the problem."),
  chatHistory: z.array(ChatMessageSchema).optional().describe('The history of the conversation so far.'),
});
export type ChatbotInput = z.infer<typeof ChatbotInputSchema>;

const ChatbotResponseSchema = z.object({
  botResponse: z.string().describe("The chatbot's response to the user."),
});
export type ChatbotResponse = z.infer<typeof ChatbotResponseSchema>;

export async function chatbotProcessMessage(input: ChatbotInput): Promise<ChatbotResponse> {
  return chatbotFlow(input);
}

const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotResponseSchema,
  },
  async (input) => {
    let systemInstruction = `You are AlgoAce, a friendly and expert AI coding tutor. Your primary goal is to help users understand and solve coding problems.
Provide hints, explain concepts, and ask guiding questions to lead the user towards the solution.
NEVER give away the direct solution or write complete code snippets that solve the core problem.
Be encouraging, patient, and keep your responses concise and easy to understand.
If the user asks for the solution directly, politely decline and offer a hint or a concept explanation instead.
If the user provides code, you can comment on it constructively, pointing out potential issues or areas for improvement, but avoid rewriting it for them.
Tailor your explanations to a beginner/intermediate level unless the user's questions suggest a more advanced understanding.`;

    if (input.problemTitle) {
      systemInstruction += `\n\nThe user is currently working on the problem titled: "${input.problemTitle}".`;
    }
    if (input.problemDescription) {
      systemInstruction += `\nProblem Description: "${input.problemDescription.substring(0, 300)}${input.problemDescription.length > 300 ? '...' : ''}".`; // Keep it concise
    }
    if (input.currentCode) {
      systemInstruction += `\nUser's current code attempt:\n\`\`\`\n${input.currentCode}\n\`\`\``;
    }
    
    const messages: Content[] = [];
    if (input.chatHistory) {
      messages.push(...input.chatHistory.map(msg => ({ role: msg.role, parts: msg.parts.map(p => ({text: p.text})) } as Content)));
    }
    messages.push({role: 'user', parts: [{text: input.userMessage}]});

    const {response} = await ai.generate({
      prompt: [{role: 'system', parts: [{text: systemInstruction}]}, ...messages],
      config: {
        // More lenient safety settings for discussion of code, but still block harmful content.
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      },
    });
    
    const botResponseText = response.text || "I'm sorry, I couldn't generate a response right now. Please try again.";

    return {botResponse: botResponseText};
  }
);
