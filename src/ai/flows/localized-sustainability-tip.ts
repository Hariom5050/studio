
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
                messages: [{ role: 'user', content: `Based on my location (${input.location}), give me one relevant sustainability tip.` }]
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
        return { tip: content };
         
      } catch (fallbackError) {
        console.error("Fallback failed in localizedSustainabilityTipFlow:", fallbackError);
        return { tip: "Oops! Your KWS Ai is taking a quick break. Please try again in a little while!" };
      }
    }
  }
);
