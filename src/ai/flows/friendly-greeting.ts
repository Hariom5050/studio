// src/ai/flows/friendly-greeting.ts
'use server';

/**
 * @fileOverview Implements the friendly greeting AI agent.
 *
 * - friendlyGreeting - A function that returns a friendly and inclusive greeting.
 * - FriendlyGreetingOutput - The return type for the friendlyGreeting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FriendlyGreetingOutputSchema = z.object({
  greeting: z.string().describe('A friendly and inclusive greeting message.'),
});

export type FriendlyGreetingOutput = z.infer<typeof FriendlyGreetingOutputSchema>;

export async function friendlyGreeting(): Promise<FriendlyGreetingOutput> {
  return friendlyGreetingFlow();
}

const prompt = ai.definePrompt({
  name: 'friendlyGreetingPrompt',
  output: {schema: FriendlyGreetingOutputSchema},
  prompt: `You are KWS Ai, a friendly and inclusive AI assistant.

  Generate a short, welcoming greeting for a new user to encourage them to explore the app. Include an emoji of a globe.
  Do not include any preamble. Directly state the greeting.
  The greeting should be no more than 20 words.
  `,
});

const friendlyGreetingFlow = ai.defineFlow(
  {
    name: 'friendlyGreetingFlow',
    outputSchema: FriendlyGreetingOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);
