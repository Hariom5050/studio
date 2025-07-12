
// pledge-encouragement.ts
'use server';

/**
 * @fileOverview Encourages users to reflect on their values and commit to a small action for a better world.
 *
 * - encouragePledge - A function that handles the pledge encouragement process.
 * - EncouragePledgeInput - The input type for the encouragePledge function.
 * - EncouragePledgeOutput - The return type for the encouragePledge function.
 */

import {ai, fallbackModel} from '@/ai/genkit';
import {z} from 'genkit';
import { openRouterFallback } from '../tools/openrouter-fallback';

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

const prompt = ai.definePrompt({
  name: 'encouragePledgePrompt',
  input: {schema: EncouragePledgeInputSchema},
  output: {schema: EncouragePledgeOutputSchema},
  prompt: `You are KWS Ai, a helpful AI assistant designed to encourage users to make small pledges to improve the world.

  Based on the conversation history, suggest a few pledge ideas and provide an encouraging message.

  Conversation History: {{{conversationHistory}}}

  Output the encouragement and pledge ideas in the following format:
  {
    "encouragement": "[Encouraging message here]",
    "pledgeIdeas": ["Pledge idea 1", "Pledge idea 2", "Pledge idea 3"]
  }
  `,
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
      console.error("Primary model failed, trying fallback:", error);
      try {
        const fallbackResponse = await openRouterFallback({
          model: 'openai/gpt-4o',
          messages: [{ role: 'user', content: `You are KWS Ai, a helpful AI assistant designed to encourage users to make small pledges to improve the world. Based on the conversation history (${input.conversationHistory}), suggest a few pledge ideas and provide an encouraging message. Output the encouragement and pledge ideas in a JSON object with 'encouragement' and 'pledgeIdeas' keys.` }]
        });
        
        // Attempt to parse the JSON from the fallback
        try {
          const parsed = JSON.parse(fallbackResponse.content);
          return EncouragePledgeOutputSchema.parse(parsed);
        } catch (e) {
            console.error("Failed to parse fallback response for pledge encouragement", e);
            return {
              encouragement: "Let's make a small promise to our planet! What's one simple action you'd like to take for a better world?",
              pledgeIdeas: ["Use a reusable water bottle.", "Spend 5 minutes learning about a new culture.", "Share a positive comment online."]
            };
        }
      } catch (fallbackError) {
        console.error("Error in encouragePledgeFlow:", fallbackError);
        return {
          encouragement: "Oops! Your KWS Ai is taking a quick break. Please try again in a little while!",
          pledgeIdeas: []
        };
      }
    }
  }
);
