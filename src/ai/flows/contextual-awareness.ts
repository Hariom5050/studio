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

const ContextualAwarenessInputSchema = z.object({
  message: z.string().describe('The current user message.'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('The history of the conversation.'),
});
export type ContextualAwarenessInput = z.infer<typeof ContextualAwarenessInputSchema>;

const ContextualAwarenessOutputSchema = z.object({
  response: z.string().describe('The AI response to the user message.'),
});
export type ContextualAwarenessOutput = z.infer<typeof ContextualAwarenessOutputSchema>;

export async function contextualAwareness(input: ContextualAwarenessInput): Promise<ContextualAwarenessOutput> {
  return contextualAwarenessFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contextualAwarenessPrompt',
  input: {
    schema: ContextualAwarenessInputSchema,
  },
  output: {
    schema: ContextualAwarenessOutputSchema,
  },
  prompt: `You are KWS AI, a guide to a better world.  Continue the conversation in a way that is helpful and engaging, using the
  previous conversation history to inform your response.

  Do not repeat yourself, and remember to always respond in a friendly manner, as KWS AI. 

  Conversation History:
  {{#each conversationHistory}}
    {{this.role}}: {{this.content}}
  {{/each}}

  User Message: {{message}}
  KWS AI Response: `,
});

const contextualAwarenessFlow = ai.defineFlow(
  {
    name: 'contextualAwarenessFlow',
    inputSchema: ContextualAwarenessInputSchema,
    outputSchema: ContextualAwarenessOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
