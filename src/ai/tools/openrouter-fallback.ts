// src/ai/tools/openrouter-fallback.ts
'use server';
/**
 * @fileOverview A tool for calling the OpenRouter API as a fallback.
 *
 * - openRouterFallback - A Genkit tool that calls a model via OpenRouter.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const OpenRouterMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
});

export const openRouterFallback = ai.defineTool(
  {
    name: 'openRouterFallback',
    description: 'A fallback tool to call the OpenRouter API when the primary model fails.',
    inputSchema: z.object({
      model: z.string().describe('The model to use from OpenRouter (e.g., openai/gpt-4o).'),
      messages: z.array(OpenRouterMessageSchema).describe('The message history to send to the model.'),
    }),
    outputSchema: z.object({
        content: z.string(),
    }),
  },
  async (input) => {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.error('OpenRouter API key is not configured.');
      return { content: "I'm sorry, my fallback system is not configured correctly." };
    }

    const url = 'https://openrouter.ai/api/v1/chat/completions';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.YOUR_SITE_URL || '',
          'X-Title': process.env.YOUR_SITE_NAME || '',
        },
        body: JSON.stringify({
          model: input.model,
          messages: input.messages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenRouter API Error:', errorData);
        return { content: "Oops! Your KWS Ai is taking a quick break. Please try again in a little while!" };
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      
      if (!content) {
        return { content: "Oops! Your KWS Ai is taking a quick break. Please try again in a little while!" };
      }

      return { content };
    } catch (error) {
      console.error('Error during OpenRouter fallback call:', error);
      return { content: "Oops! Your KWS Ai is taking a quick break. Please try again in a little while!" };
    }
  }
);
