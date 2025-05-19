import { config } from 'dotenv';
config();

import '@/ai/flows/generate-problem.ts';
import '@/ai/flows/analyze-code.ts';
import '@/ai/flows/chatbot-flow.ts';
