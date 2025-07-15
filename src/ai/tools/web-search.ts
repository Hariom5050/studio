
// src/ai/tools/web-search.ts
'use server';
/**
 * @fileOverview A tool for performing a live web search using Serper API.
 *
 * - webSearch - A Genkit tool that performs a web search.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SearchResultSchema = z.object({
  title: z.string(),
  link: z.string(),
  snippet: z.string(),
  position: z.number().optional(),
});

export const webSearch = ai.defineTool(
  {
    name: 'webSearch',
    description:
      'Use this tool to get up-to-date information on recent events, news, or topics the AI model might not have knowledge of. Can also be used to find current information on any topic.',
    inputSchema: z.object({
      query: z.string().describe('The search query for news and recent events.'),
    }),
    outputSchema: z.object({
      results: z.array(SearchResultSchema),
    }),
  },
  async (input) => {
    const apiKeys = (process.env.SERPER_API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean);

    if (!apiKeys || apiKeys.length === 0) {
      console.error('Serper API key(s) are not configured.');
      return {
        results: [
          {
            title: 'Web Search Not Configured',
            link: '#',
            snippet:
              'The web search tool is not configured. Please set the SERPER_API_KEYS environment variable. You can get a free key from serper.dev.',
          },
        ],
      };
    }

    // Use the /search endpoint for general queries
    const url = 'https://google.serper.dev/search';
    let lastError: any = null;

    const requestBody = JSON.stringify({
      q: input.query,
      gl: 'us',
    });

    for (const apiKey of apiKeys) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json',
          },
          body: requestBody,
        });

        if (response.status === 401 || response.status === 403 || response.status === 429) {
          console.warn(`Serper API key ending in ...${apiKey.slice(-4)} failed with status ${response.status}. Trying next key.`);
          lastError = await response.json();
          continue; // Try the next key
        }

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Serper API Error:', errorData);
          lastError = errorData;
          continue; // Try the next key
        }

        const data = await response.json();

        if (!data.organic || data.organic.length === 0) {
          return {
            results: [
              {
                title: 'No results found',
                link: `https://www.google.com/search?q=${encodeURIComponent(input.query)}`,
                snippet: `Your search - ${input.query} - did not match any documents. Please try a different query.`,
                position: 1,
              },
            ],
          };
        }
        
        // The /search endpoint returns 'organic' array
        const results = (data.organic || []).map((item: any) => ({
          title: item.title,
          link: item.link,
          snippet: item.snippet,
          position: item.position,
        }));

        return { results }; // Success, exit the loop
      } catch (error) {
        console.error('Error during web search with a key:', error);
        lastError = error;
        continue; // Try the next key
      }
    }

    // If all keys have failed
    console.error('All Serper API keys failed. Last error:', lastError);
    return {
      results: [
        {
          title: 'Search Failed',
          link: '#',
          snippet: 'The web search failed after trying all available API keys. Please check the server logs for more details.',
          position: 1,
        },
      ],
    };
  }
);
