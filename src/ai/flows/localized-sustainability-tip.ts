
'use server';
/**
 * @fileOverview Fetches and shares a localized sustainability tip based on the user's location.
 *
 * - getLocalizedSustainabilityTip - A function that retrieves a localized sustainability tip.
 * - LocalizedSustainabilityTipInput - The input type for the getLocalizedSustainabilityTip function.
 * - LocalizedSustainabilityTipOutput - The return type for the getLocalizedSustainabilityTip function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { fallbackGenerate } from '@/ai/fallback';

const LocalizedSustainabilityTipInputSchema = z.object({
  location: z
    .string()
    .describe("The user's location, including city and country."),
});
export type LocalizedSustainabilityTipInput = z.infer<
  typeof LocalizedSustainabilityTipInputSchema
>;

const LocalizedSustainabilityTipOutputSchema = z.object({
  tip: z
    .string()
    .describe(
      'A sustainability tip that is relevant to the user’s location.'
    ),
});
export type LocalizedSustainabilityTipOutput = z.infer<
  typeof LocalizedSustainabilityTipOutputSchema
>;

export async function getLocalizedSustainabilityTip(
  input: LocalizedSustainabilityTipInput
): Promise<LocalizedSustainabilityTipOutput> {
  return localizedSustainabilityTipFlow(input);
}

const systemPrompt = `You are an AI assistant specialized in providing localized sustainability tips.`;
const promptTemplate = `Based on the user's location, provide a relevant sustainability tip.

Location: {{{location}}}`;

const prompt = ai.definePrompt({
  name: 'localizedSustainabilityTipPrompt',
  input: {schema: LocalizedSustainabilityTipInputSchema},
  output: {schema: LocalizedSustainabilityTipOutputSchema},
  system: systemPrompt,
  prompt: promptTemplate
});

const localizedSustainabilityTipFlow = ai.defineFlow(
  {
    name: 'localizedSustainabilityTipFlow',
    inputSchema: LocalizedSustainabilityTipInputSchema,
    outputSchema: LocalizedSustainabilityTipOutputSchema,
  },
  async input => {
    try {
        const {output} = await prompt(input);
        return output!;
    } catch(error) {
        console.error("Primary model failed in localizedSustainabilityTipFlow, trying fallback:", error);
        try {
            const fallbackResponse = await fallbackGenerate({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Based on my location (${input.location}), give me a sustainability tip.` }
                ]
            });
            // As fallback is simple text, wrap it in the expected output schema
            return { tip: fallbackResponse };
        } catch (fallbackError) {
             console.error("Fallback failed in localizedSustainabilityTipFlow:", fallbackError);
             return { tip: "I couldn't fetch a tip for your location right now, but a general one is to reduce single-use plastics!" };
        }
    }
  }
);
