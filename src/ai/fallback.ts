
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
    // Return a user-friendly message instead of throwing an error.
    console.error('Groq API key not configured. Please set the GROQ_API_KEY environment variable.');
    return "I'm having a little trouble connecting to my knowledge base right now. Please try again in a moment.";
  }

  const { messages, json = false } = input;
  const primaryFallbackModel = 'gemma2-9b-it';
  const secondaryFallbackModel = 'llama3-70b-8192';
  const tertiaryFallbackModel = 'mixtral-8x7b-32768';
  
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
        console.log(`Secondary fallback failed. Trying tertiary fallback model: ${tertiaryFallbackModel}`);

        // Third attempt with the tertiary fallback model
        try {
            const tertiaryChatCompletion = await groq.chat.completions.create({
                messages: messages.map(({role, content}) => ({role, content})),
                model: tertiaryFallbackModel,
                temperature: 0.6,
                max_tokens: 4096,
                top_p: 0.95,
                stream: false,
                response_format: json ? { type: 'json_object' } : undefined,
            });

            const tertiaryContent = tertiaryChatCompletion.choices[0]?.message?.content;

            if (!tertiaryContent) {
                throw new Error("Groq API (tertiary fallback) returned an empty response.");
            }

            return tertiaryContent;

        } catch (tertiaryError) {
             console.error(`Error calling Groq API with ${tertiaryFallbackModel}:`, tertiaryError);
             throw new Error('The fallback service (Groq) also failed on the third attempt.');
        }
    }
  }
}
