
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

type SearchResult = z.infer<typeof SearchResultSchema>;

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

    if (apiKeys.length === 0) {
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
    
    // This helper will try one key at a time.
    const performSearchWithKey = async (query: string, gl: 'in' | 'us', num: number, apiKey: string): Promise<SearchResult[]> => {
        const url = 'https://google.serper.dev/search';
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ q: query, gl, num }),
        });

        // If key is invalid or rate-limited, throw an error to trigger fallback to the next key.
        if ([401, 403, 429].includes(response.status)) {
            const errorBody = await response.json();
            console.warn(`Serper API key ending in ...${apiKey.slice(-4)} failed with status ${response.status}. Trying next key.`);
            // Throw a specific error to be caught by the outer loop
            const err = new Error(`Serper API Error: ${response.status}`);
            (err as any).status = response.status;
            (err as any).data = errorBody;
            throw err;
        }

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`Serper API Error for query "${query}"`, errorData);
            // Don't continue to next key for general errors, fail fast.
            throw new Error(`Serper API request failed: ${errorData.message || 'Unknown error'}`);
        }

        const data = await response.json();
        
        return (data.organic || []).map((item: any) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
            position: item.position,
        }));
    }

    const indianNewsQuery = `${input.query} news`;
    const globalTrendsQuery = `${input.query} latest trends and technology`;
    
    let lastError: any = null;
    
    // Loop through each API key, only moving to the next one if the current one fails.
    for (const apiKey of apiKeys) {
        try {
            const [indianResults, globalResults] = await Promise.all([
                performSearchWithKey(indianNewsQuery, 'in', 20, apiKey),
                performSearchWithKey(globalTrendsQuery, 'us', 10, apiKey)
            ]);

            const combinedResults = [...indianResults, ...globalResults];

            if (combinedResults.length === 0) {
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
            
            // Success! Remove duplicates and return the unique results.
            const uniqueResults = Array.from(new Map(combinedResults.map(item => [item.link, item])).values());
            return { results: uniqueResults };

        } catch (error: any) {
            lastError = error;
            // If the error is a key-related issue, the loop will continue to the next key.
            // Otherwise, we break and throw the error.
            if (![401, 403, 429].includes(error.status)) {
                 console.error('A non-recoverable error occurred in the webSearch tool:', error);
                 // Re-throw to be caught by the final catch block
                 throw error;
            }
        }
    }

    // This block is reached only if all API keys have failed.
    console.error(`All Serper API keys failed. Last error:`, lastError);
    return {
        results: [
        {
            title: 'Search Failed',
            link: '#',
            snippet: 'The web search failed because all available API keys are exhausted or invalid. Please check the server logs.',
            position: 1,
        },
        ],
    };
  }
);
