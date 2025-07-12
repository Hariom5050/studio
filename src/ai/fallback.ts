
'use server';
/**
 * @fileOverview A centralized fallback function to call the Groq API.
 */
import Groq from 'groq-sdk';
import type { Message } from '@/lib/types';

interface FallbackGenerateInput {
  model?: string;
  messages: Array<{ role: 'user' | 'assistant' | 'system', content: string }>;
  json?: boolean;
}

// Groq SDK is initialized once and reused.
// It will automatically use the GROQ_API_KEY environment variable.
let groq: Groq | null = null;
if (process.env.GROQ_API_KEY) {
    try {
        groq = new Groq();
    } catch (error) {
        console.error("Failed to initialize Groq SDK:", error);
    }
}


export async function fallbackGenerate(input: FallbackGenerateInput): Promise<string> {
  if (!groq) {
    throw new Error('Groq API key not configured. Please set the GROQ_API_KEY environment variable.');
  }

  const { messages, json = false } = input;
  const primaryFallbackModel = 'gemma2-9b-it';
  const secondaryFallbackModel = 'llama3-70b-8192';
  
  // The Groq API requires at least one message.
  if (!messages || messages.length === 0) {
      throw new Error("Cannot call Groq API with no messages.");
  }

  try {
    // First attempt with the primary fallback model
    const chatCompletion = await groq.chat.completions.create({
      messages: messages.map(({role, content}) => ({role, content})),
      model: primaryFallbackModel,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
      response_format: json ? { type: 'json_object' } : undefined,
    });
    
    const content = chatCompletion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Groq API returned an empty response.");
    }

    return content;
  } catch (error) {
    console.error(`Error calling Groq API with ${primaryFallbackModel}:`, error);
    console.log(`Primary fallback failed. Trying secondary fallback model: ${secondaryFallbackModel}`);
    
    // Second attempt with the secondary fallback model
    try {
        const secondaryChatCompletion = await groq.chat.completions.create({
            messages: messages.map(({role, content}) => ({role, content})),
            model: secondaryFallbackModel,
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 1,
            stream: false,
            response_format: json ? { type: 'json_object' } : undefined,
        });

        const secondaryContent = secondaryChatCompletion.choices[0]?.message?.content;

        if (!secondaryContent) {
            throw new Error("Groq API (secondary fallback) returned an empty response.");
        }

        return secondaryContent;

    } catch (secondaryError) {
        console.error(`Error calling Groq API with ${secondaryFallbackModel}:`, secondaryError);
        throw new Error('The fallback service (Groq) also failed on the second attempt.');
    }
  }
}
