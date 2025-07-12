
// pledge-encouragement.ts
'use server';

/**
 * @fileOverview Encourages users to reflect on their values and commit to a small action for a better world.
 *
 * - encouragePledge - A function that handles the pledge encouragement process.
 * - EncouragePledgeInput - The input type for the encouragePledge function.
 * - EncouragePledgeOutput - The return type for the encouragePledge function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { fallbackGenerate } from '@/ai/fallback';
import { webSearch } from '@/ai/tools/web-search';

const EncouragePledgeInputSchema = z.object({
  conversationHistory: z.string().describe('The history of the conversation so far.'),
});
export type EncouragePledgeInput = z.infer<typeof EncouragePledgeInputSchema>;

const EncouragePledgeOutputSchema = z.object({
  encouragement: z.string().describe('A message encouraging the user to make a pledge.'),
  pledgeIdeas: z.array(z.string()).describe('A list of ideas for small actions the user can pledge to.'),
});
export type EncouragePledgeOutput = z.infer<typeof EncouragePledgeOutputSchema>;

export async function encouragePledge(input: EncouragePledgeInput): Promise<EncouragePledgeOutput> {
  return encouragePledgeFlow(input);
}

const systemPrompt = `You are KWS Ai, a helpful AI assistant designed to encourage users to make small pledges to improve the world. Use the webSearch tool to find creative and relevant ideas if needed.`;
const promptTemplate = `Based on the conversation history, suggest a few pledge ideas and provide an encouraging message.

Conversation History: {{{conversationHistory}}}`;

const prompt = ai.definePrompt({
  name: 'encouragePledgePrompt',
  input: {schema: EncouragePledgeInputSchema},
  output: {schema: EncouragePledgeOutputSchema},
  system: systemPrompt,
  prompt: promptTemplate,
  tools: [webSearch]
});

const encouragePledgeFlow = ai.defineFlow(
  {
    name: 'encouragePledgeFlow',
    inputSchema: EncouragePledgeInputSchema,
    outputSchema: EncouragePledgeOutputSchema,
  },
  async input => {
    try {
        const {output} = await prompt(input);
        return output!;
    } catch (error) {
        console.error("Primary model failed in encouragePledgeFlow, trying fallback:", error);
        try {
            const fallbackString = await fallbackGenerate({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Based on this conversation history, suggest a few pledge ideas and provide an encouraging message in a JSON object with keys "encouragement" and "pledgeIdeas" (an array of strings): ${input.conversationHistory}` }
                ],
                json: true
            });
            const fallbackResponse = JSON.parse(fallbackString);
            return fallbackResponse;
        } catch (fallbackError) {
             console.error("Fallback failed in encouragePledgeFlow:", fallbackError);
             return { 
                 encouragement: "Let's make a promise to our planet! What's one small action you'd like to take?",
                 pledgeIdeas: [
                     "Use a reusable water bottle for a week.",
                     "Learn one new thing about a different culture.",
                     "Share a positive comment online."
                 ]
             };
        }
    }
  }
);
