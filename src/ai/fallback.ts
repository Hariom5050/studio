
'use server';
/**
 * @fileOverview A centralized fallback function to call various LLM APIs.
 * It now prioritizes Groq and then falls back to Mistral AI.
 */
import Groq from 'groq-sdk';
import type { Message } from '@/lib/types';

interface FallbackGenerateInput {
  model?: string;
  messages: Array<{ role: 'user' | 'assistant' | 'system', content: string }>;
  json?: boolean;
}

async function tryMistral(input: FallbackGenerateInput): Promise<string | null> {
    const mistralApiKey = process.env.MISTRAL_API_KEY;
    if (!mistralApiKey) {
        console.log("Mistral API key not configured. Skipping Mistral fallback.");
        return null;
    }

    const { messages, json = false } = input;
    const mistralModel = "mistral-large-latest"; 
    
    try {
        console.log(`Attempting fallback with Mistral model: ${mistralModel}`);
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${mistralApiKey}`,
            },
            body: JSON.stringify({
                model: mistralModel,
                messages: messages,
                response_format: json ? { type: 'json_object' } : undefined,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Mistral API request failed with status ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            throw new Error("Mistral API returned an empty response.");
        }

        console.log("Successfully received response from Mistral.");
        return content;
    } catch (error) {
        console.error(`Error calling Mistral API:`, error);
        return null;
    }
}


async function tryGroq(input: FallbackGenerateInput): Promise<string | null> {
    const apiKeys = (process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
    if (apiKeys.length === 0) {
        console.log("Groq API key(s) not configured. Skipping Groq fallback.");
        return null;
    }
    
    const { messages, json = false } = input;
    const primaryFallbackModel = 'gemma2-9b-it';
    const secondaryFallbackModel = 'llama3-70b-8192';
    const tertiaryFallbackModel = 'mixtral-8x7b-32768';
    const modelsToTry = [primaryFallbackModel, secondaryFallbackModel, tertiaryFallbackModel];

    if (!messages || messages.length === 0) {
      console.error("Cannot call Groq API with no messages.");
      return null;
    }

    for (const apiKey of apiKeys) {
        const groq = new Groq({ apiKey });
        for (const model of modelsToTry) {
            try {
                console.log(`Attempting fallback with Groq model: ${model}`);
                const chatCompletion = await groq.chat.completions.create({
                    messages: messages.map(({role, content}) => ({role, content})),
                    model: model,
                    temperature: 0.7,
                    max_tokens: 1024,
                    top_p: 1,
                    stream: false,
                    response_format: json ? { type: 'json_object' } : undefined,
                });
                
                const content = chatCompletion.choices[0]?.message?.content;
                if (content) {
                    console.log(`Successfully received response from Groq model: ${model}`);
                    return content; // Success, exit the loops
                }
            } catch (error) {
                 if (error instanceof Groq.APIError && (error.status === 401 || error.status === 429)) {
                    console.warn(`Groq API key ending in ...${apiKey.slice(-4)} failed with status ${error.status}. Trying next model/key.`);
                    // Let it continue to the next model or key
                 } else {
                    console.error(`Error calling Groq API with ${model}:`, error);
                 }
            }
        }
    }
    
    console.log("All Groq fallback models and keys failed.");
    return null;
}


export async function fallbackGenerate(input: FallbackGenerateInput): Promise<string> {
  const groqResponse = await tryGroq(input);
  if (groqResponse) {
    return groqResponse;
  }

  const mistralResponse = await tryMistral(input);
  if (mistralResponse) {
    return mistralResponse;
  }
  
  // If all fallbacks fail
  throw new Error('All fallback services (Groq, Mistral) failed.');
}
