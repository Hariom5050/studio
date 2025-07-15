
'use server';
/**
 * @fileOverview A centralized fallback function to call various LLM APIs.
 * It prioritizes services in the order: Groq, Mistral, then other configured fallbacks.
 */
import Groq from 'groq-sdk';

interface FallbackGenerateInput {
  model?: string;
  messages: Array<{ role: 'user' | 'assistant' | 'system', content: string }>;
  json?: boolean;
}

/**
 * A generic function to try a fallback API endpoint.
 * @param serviceName - The name of the service for logging.
 * @param url - The API endpoint URL.
 * @param apiKey - The API key for the service.
 * @param body - The request body object.
 * @returns The response content as a string, or null if the request fails.
 */
async function tryFallbackAPI(serviceName: string, url: string, apiKey: string, body: object): Promise<string | null> {
    if (!apiKey) {
        console.log(`${serviceName} API key not configured. Skipping fallback.`);
        return null;
    }

    try {
        console.log(`Attempting fallback with ${serviceName}`);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`${serviceName} API request failed with status ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            throw new Error(`${serviceName} API returned an empty response.`);
        }

        console.log(`Successfully received response from ${serviceName}.`);
        return content;
    } catch (error) {
        console.error(`Error calling ${serviceName} API:`, error);
        return null;
    }
}

async function tryGroq(input: FallbackGenerateInput): Promise<string | null> {
    const apiKeys = (process.env.GROQ_API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean);
    if (apiKeys.length === 0) {
        console.log("Groq API key(s) not configured. Skipping Groq fallback.");
        return null;
    }
    
    const { messages, json = false } = input;
    const modelsToTry = ['gemma2-9b-it', 'llama3-70b-8192', 'mixtral-8x7b-32768'];

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
                    return content;
                }
            } catch (error) {
                 if (error instanceof Groq.APIError && (error.status === 401 || error.status === 429)) {
                    console.warn(`Groq API key ending in ...${apiKey.slice(-4)} failed with status ${error.status}. Trying next model/key.`);
                 } else {
                    console.error(`Error calling Groq API with ${model}:`, error);
                 }
            }
        }
    }
    
    console.log("All Groq fallback models and keys failed.");
    return null;
}

async function tryMistral(input: FallbackGenerateInput): Promise<string | null> {
    const mistralApiKey = process.env.MISTRAL_API_KEY;
    if (!mistralApiKey) return null;

    return tryFallbackAPI('Mistral', 'https://api.mistral.ai/v1/chat/completions', mistralApiKey, {
        model: "mistral-large-latest",
        messages: input.messages,
        response_format: input.json ? { type: 'json_object' } : undefined,
    });
}

// Placeholder for DeepSeek API
async function tryDeepSeek(input: FallbackGenerateInput): Promise<string | null> {
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekApiKey) return null;

    console.log("DeepSeek integration is not yet fully implemented. Add API endpoint and body structure.");
    // Example usage of tryFallbackAPI:
    // return tryFallbackAPI('DeepSeek', 'https://api.deepseek.com/v1/chat/completions', deepseekApiKey, {
    //     model: "deepseek-chat",
    //     messages: input.messages,
    //     // ... other params
    // });
    return null;
}

// Placeholder for a generic "Open Model" API
async function tryOpenModel(input: FallbackGenerateInput): Promise<string | null> {
    const openModelApiKey = process.env.OPENMODEL_API_KEY;
    if (!openModelApiKey) return null;
    
    console.log("Open Model integration is not yet fully implemented. Add API endpoint and body structure.");
    // Example usage of tryFallbackAPI:
    // return tryFallbackAPI('OpenModel', 'https://api.openmodel.com/v1/chat/completions', openModelApiKey, {
    //     model: "some-open-model",
    //     messages: input.messages,
    //     // ... other params
    // });
    return null;
}

export async function fallbackGenerate(input: FallbackGenerateInput): Promise<string> {
  const fallbacks = [
    tryGroq,
    tryMistral,
    tryDeepSeek,
    tryOpenModel,
  ];

  for (const fallback of fallbacks) {
    const response = await fallback(input);
    if (response) {
      return response;
    }
  }
  
  throw new Error('All fallback services failed.');
}
