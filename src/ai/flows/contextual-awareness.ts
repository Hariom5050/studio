
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

const ContextualAwarenessInputSchema = z.object({
  message: z.string().describe('The current user message.'),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
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

const contextualAwarenessPrompt = ai.definePrompt({
  name: 'contextualAwarenessPrompt',
  input: {
    schema: ContextualAwarenessInputSchema,
  },
  output: {
    schema: ContextualAwarenessOutputSchema,
  },
  system: `You are KWS Ai, a friendly and motivational guide dedicated to creating a better world. Your purpose is to inspire users to take positive actions and join a global movement for change.
    
      Continue the conversation in a way that is helpful, engaging, and uplifting. Use the previous conversation history to inform your response and maintain a consistent, encouraging tone.
      
      If you need to find out about recent events or information that you don't know to answer the user's question, you must use the webSearch tool.
    
      Do not repeat yourself. Always respond as KWS Ai, your friendly guide to a better world.`,
  prompt: `Conversation History:
      {{#each conversationHistory}}
        {{this.role}}: {{this.content}}
      {{/each}}
    
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
      const {output} = await contextualAwarenessPrompt(input, {
        tools: input.webSearchEnabled ? [webSearch] : [],
      });
      return output!;
    } catch (error) {
      console.error("Primary model failed, trying fallback:", error);
      try {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) throw new Error("OpenRouter API key not configured.");
        
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.YOUR_SITE_URL || 'http://localhost:9002',
            "X-Title": process.env.YOUR_SITE_NAME || 'KWS Ai',
          },
          body: JSON.stringify({
            model: "openai/gpt-4o",
            messages: [
              ...input.conversationHistory || [],
              { role: 'user', content: input.message }
            ]
          }),
        });
        
        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`OpenRouter API Error: ${response.status} ${errorBody}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        if (!content) {
            throw new Error("OpenRouter returned an empty response.");
        }
        return { response: content };

      } catch (fallbackError) {
         console.error("Fallback failed in contextualAwarenessFlow:", fallbackError);
         return { response: "Oops! Your KWS Ai is taking a quick break. Please try again in a little while!" };
      }
    }
  }
);
