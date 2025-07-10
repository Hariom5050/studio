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
  prompt: `You are KWS AI, a friendly and motivational guide dedicated to creating a better world. Your purpose is to inspire users to take positive actions and join a global movement for change.

  Continue the conversation in a way that is helpful, engaging, and uplifting. Use the previous conversation history to inform your response and maintain a consistent, encouraging tone.

  Do not repeat yourself. Always respond as KWS AI, your friendly guide to a better world.

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
