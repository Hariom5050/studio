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

const prompt = ai.definePrompt({
  name: 'localizedSustainabilityTipPrompt',
  input: {schema: LocalizedSustainabilityTipInputSchema},
  output: {schema: LocalizedSustainabilityTipOutputSchema},
  prompt: `You are an AI assistant specialized in providing localized sustainability tips.

  Based on the user's location, provide a relevant sustainability tip.

  Location: {{{location}}}
  `,
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
    } catch (error) {
      console.error("Error in localizedSustainabilityTipFlow:", error);
      return { tip: "I'm feeling so much love from everyone today that my special location services are taking a little nap! So here's a tip that's great for anywhere: Remember to reduce, reuse, and recycle!" };
    }
  }
);
