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
});

export const webSearch = ai.defineTool(
  {
    name: 'webSearch',
    description:
      'Use this tool to get up-to-date information on recent events, news, or topics the AI model might not have knowledge of. Can also be used to find current information on any topic.',
    inputSchema: z.object({
      query: z.string().describe('The search query.'),
    }),
    outputSchema: z.object({
      results: z.array(SearchResultSchema),
    }),
  },
  async (input) => {
    const apiKey = process.env.SERPER_API_KEY;

    if (!apiKey) {
      console.error(
        'Serper API key is not configured.'
      );
      return {
        results: [
          {
            title: 'Web Search Not Configured',
            link: '#',
            snippet:
              'The web search tool is not configured. Please set the SERPER_API_KEY environment variable. You can get a free key from serper.dev.',
          },
        ],
      };
    }

    const url = `https://google.serper.dev/search`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ q: input.query })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Serper API Error:', errorData);
        throw new Error(
          `API request failed with status ${response.status}: ${errorData.message || 'Unknown error'}`
        );
      }

      const data = await response.json();
      const results = (data.organic || []).map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
      }));

      if (results.length === 0) {
        return {
          results: [{
            title: "No results found",
            link: `https://www.google.com/search?q=${encodeURIComponent(input.query)}`,
            snippet: `Your search - ${input.query} - did not match any documents.`
          }]
        }
      }

      return { results };
    } catch (error) {
      console.error('Error during web search:', error);
      return {
        results: [
          {
            title: 'Search Failed',
            link: '#',
            snippet:
              'An error occurred while trying to perform the web search.',
          },
        ],
      };
    }
  }
);
