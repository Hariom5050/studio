
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
    
    let apiKeyIndex = 0;
    const getApiKey = () => {
        const key = apiKeys[apiKeyIndex];
        apiKeyIndex = (apiKeyIndex + 1) % apiKeys.length;
        return key;
    }

    const performSearch = async (query: string, gl: 'in' | 'us', num: number): Promise<SearchResult[]> => {
        const url = 'https://google.serper.dev/search';
        let lastError: any = null;

        for (let i = 0; i < apiKeys.length; i++) {
          const apiKey = getApiKey();
          try {
            const response = await fetch(url, {
              method: 'POST',
              headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ q: query, gl, num }),
            });

            if (response.status === 401 || response.status === 403 || response.status === 429) {
              console.warn(`Serper API key ending in ...${apiKey.slice(-4)} failed with status ${response.status}. Trying next key.`);
              lastError = await response.json();
              continue; // Try the next key
            }

            if (!response.ok) {
              const errorData = await response.json();
              console.error(`Serper API Error for query "${query}"`, errorData);
              lastError = errorData;
              continue; // Try the next key
            }

            const data = await response.json();
            
            if (!data.organic || data.organic.length === 0) {
               return []; // No results for this specific query
            }
            
            return (data.organic || []).map((item: any) => ({
              title: item.title,
              link: item.link,
              snippet: item.snippet,
              position: item.position,
            }));

          } catch (error) {
            console.error(`Error during web search for query "${query}" with a key:`, error);
            lastError = error;
            continue; // Try the next key
          }
        }
        // If all keys failed for this query
        console.error(`All Serper API keys failed for query: "${query}". Last error:`, lastError);
        return [];
    }

    try {
        const indianNewsQuery = `${input.query} news`;
        const globalTrendsQuery = `${input.query} latest trends and technology`;

        const [indianResults, globalResults] = await Promise.all([
            performSearch(indianNewsQuery, 'in', 20),
            performSearch(globalTrendsQuery, 'us', 10)
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
        
        // Remove duplicates based on the link
        const uniqueResults = Array.from(new Map(combinedResults.map(item => [item.link, item])).values());
        
        return { results: uniqueResults };

    } catch (error) {
        console.error('An unexpected error occurred in the webSearch tool:', error);
        return {
          results: [
            {
              title: 'Search Failed',
              link: '#',
              snippet: 'The web search failed due to an unexpected error. Please check the server logs.',
              position: 1,
            },
          ],
        };
    }
  }
);
