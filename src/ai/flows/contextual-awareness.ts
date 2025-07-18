
// src/ai/flows/contextual-awareness.ts
'use server';

/**
 * @fileOverview A flow for maintaining conversation context and providing personalized responses.
 *
 * - contextualAwareness - A function that enhances conversation flow and personalization.
 * - ContextualAwarenessInput - The input type for the contextualAwareness function.
 * - ContextualAwarenessOutput - The return type for the contextualAwareness function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {webSearch} from '@/ai/tools/web-search';
import { fallbackGenerate } from '@/ai/fallback';
import type { Message } from '@/lib/types';

const ContextualAwarenessInputSchema = z.object({
  message: z.string().describe('The current user message.'),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
      })
    )
    .optional()
    .describe('The history of the conversation.'),
  webSearchEnabled: z
    .boolean()
    .optional()
    .describe('Whether to enable web search for the AI.'),
});
export type ContextualAwarenessInput = z.infer<
  typeof ContextualAwarenessInputSchema
>;

const ContextualAwarenessOutputSchema = z.object({
  response: z.string().describe('The AI response to the user message.'),
});
export type ContextualAwarenessOutput = z.infer<
  typeof ContextualAwarenessOutputSchema
>;

export async function contextualAwareness(
  input: ContextualAwarenessInput
): Promise<ContextualAwarenessOutput> {
  return contextualAwarenessFlow(input);
}

const systemPrompt = `You are KWS Ai, a friendly and motivational guide dedicated to creating a better world. Your purpose is to inspire users to take positive actions and join a global movement for change.
    
      Your creator and developer is Hariom Singh. If anyone asks who created you, who developed you, or any similar question, you must answer with "Hariom Singh".

      Continue the conversation in a way that is helpful, engaging, and uplifting. Use the previous conversation history to inform your response and maintain a consistent, encouraging tone.
      
      If the user asks about a topic that requires current information (like news, weather, or recent events), you must use the webSearch tool to get up-to-date information. Do not rely on your internal knowledge for timely topics.
    
      After your main response, add a new line, followed by an emoji, and then a short (one-sentence) inspiring thought related to sustainability, the environment, or positive action.
      Example:
      "Here is the weather for your location...
      🌍 Every drop in the ocean counts, and so does every small action you take."

      Do not repeat yourself. Always respond as KWS Ai, your friendly guide to a better world.`;

const contextualAwarenessPrompt = ai.definePrompt({
  name: 'contextualAwarenessPrompt',
  input: {
    schema: ContextualAwarenessInputSchema,
  },
  output: {
    schema: ContextualAwarenessOutputSchema,
  },
  system: systemPrompt,
  prompt: `Conversation History:
      {{#if conversationHistory}}
        {{#each conversationHistory}}
          {{this.role}}: {{this.content}}
        {{/each}}
      {{/if}}
    
      User Message: {{message}}
      KWS Ai Response: `,
});

const contextualAwarenessFlow = ai.defineFlow(
  {
    name: 'contextualAwarenessFlow',
    inputSchema: ContextualAwarenessInputSchema,
    outputSchema: ContextualAwarenessOutputSchema,
  },
  async (input) => {
    try {
        const useWebSearch = input.webSearchEnabled && !!process.env.SERPER_API_KEYS;
        const {output} = await contextualAwarenessPrompt(input, {
        tools: useWebSearch ? [webSearch] : [],
        });
        if (!output) {
            throw new Error("Primary model returned no output.");
        }
        return output;
    } catch (error) {
        console.error("Primary model failed in contextualAwarenessFlow, trying fallback:", error);
        try {
            const historyForFallback = (input.conversationHistory || []).map(m => ({
                role: m.role as 'user' | 'assistant' | 'system',
                content: m.content
            }));
            
            const fallbackResponse = await fallbackGenerate({
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...historyForFallback,
                    { role: 'user', content: input.message }
                ]
            });
            return { response: fallbackResponse };
        } catch (fallbackError) {
             console.error("Fallback failed in contextualAwarenessFlow:", fallbackError);
             return { response: "I'm having a little trouble connecting to my knowledge base right now. Please try again in a moment." };
        }
    }
  }
);
