// src/ai/flows/conversation-guidance.ts
'use server';

/**
 * @fileOverview A conversation guidance AI agent.
 *
 * - conversationGuidance - A function that handles the conversation guidance process.
 * - ConversationGuidanceInput - The input type for the conversationGuidance function.
 * - ConversationGuidanceOutput - The return type for the conversationGuidance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ConversationGuidanceInputSchema = z.object({
  topic: z
    .string()
    .describe(
      'The topic to guide the conversation on.  Should be one of: sustainability, peace, digital citizenship, global cultures.'
    ),
  userMessage: z.string().describe('The user message to respond to.'),
  conversationHistory: z.string().describe('The history of the conversation.'),
});
export type ConversationGuidanceInput = z.infer<typeof ConversationGuidanceInputSchema>;

const ConversationGuidanceOutputSchema = z.object({
  response: z.string().describe('The response to the user message.'),
});
export type ConversationGuidanceOutput = z.infer<typeof ConversationGuidanceOutputSchema>;

export async function conversationGuidance(input: ConversationGuidanceInput): Promise<ConversationGuidanceOutput> {
  return conversationGuidanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'conversationGuidancePrompt',
  input: {schema: ConversationGuidanceInputSchema},
  output: {schema: ConversationGuidanceOutputSchema},
  prompt: `You are KWS Ai, a helpful and friendly AI assistant that guides conversations on important topics.

  The current topic is: {{{topic}}}

  Here is the conversation history:
  {{conversationHistory}}

  The user said:
  {{userMessage}}

  Generate a response that continues the conversation on the topic of {{{topic}}}, and encourages the user to learn more and contribute to positive change.
  The response should be engaging, informative, and relevant to the user's message.
  The response should be no more than 100 words.
  `,
});

const conversationGuidanceFlow = ai.defineFlow(
  {
    name: 'conversationGuidanceFlow',
    inputSchema: ConversationGuidanceInputSchema,
    outputSchema: ConversationGuidanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
