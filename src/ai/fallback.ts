
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

  const { model = 'gemma2-9b-it', messages, json = false } = input;
  
  // The Groq API requires at least one message.
  if (!messages || messages.length === 0) {
      throw new Error("Cannot call Groq API with no messages.");
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: messages.map(({role, content}) => ({role, content})), // Ensure only role and content are passed
      model,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false, // We will not stream for the fallback to keep it simple
      response_format: json ? { type: 'json_object' } : undefined,
    });
    
    const content = chatCompletion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Groq API returned an empty response.");
    }

    return content;
  } catch (error) {
    console.error(`Error calling Groq API (${model}):`, error);
    throw new Error('The fallback service (Groq) also failed.');
  }
}
