
// src/ai/flows/summarize-conversation.ts
'use server';
/**
 * @fileOverview A flow for summarizing a conversation into a short title.
 *
 * - summarizeConversation - A function that generates a concise title for a chat history.
 * - SummarizeConversationInput - The input type for the summarizeConversation function.
 * - SummarizeConversationOutput - The return type for the summarizeConversation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type {Message} from '@/lib/types';

const SummarizeConversationInputSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ).describe('The history of the conversation to summarize.'),
});
export type SummarizeConversationInput = z.infer<typeof SummarizeConversationInputSchema>;

const SummarizeConversationOutputSchema = z.object({
  title: z.string().describe('A short, concise title for the conversation (5 words max).'),
});
export type SummarizeConversationOutput = z.infer<typeof SummarizeConversationOutputSchema>;


export async function summarizeConversation(
  messages: Message[]
): Promise<SummarizeConversationOutput> {
    const historyForSummary = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(({ role, content }) => ({ role, content }));
        
  return summarizeConversationFlow({messages: historyForSummary});
}

const prompt = ai.definePrompt({
  name: 'summarizeConversationPrompt',
  input: {schema: SummarizeConversationInputSchema},
  output: {schema: SummarizeConversationOutputSchema},
  prompt: `Based on the following conversation, create a very short, concise title (5 words maximum). This title will be used to identify the conversation in a list.

Conversation History:
{{#each messages}}
  {{this.role}}: {{this.content}}
{{/each}}

Generate only the title.`,
});

const summarizeConversationFlow = ai.defineFlow(
  {
    name: 'summarizeConversationFlow',
    inputSchema: SummarizeConversationInputSchema,
    outputSchema: SummarizeConversationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
