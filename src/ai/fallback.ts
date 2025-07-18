
'use server';
/**
 * @fileOverview A centralized fallback function to call various LLM APIs.
 * It prioritizes services in the order: Groq, OpenRouter models, then Mistral.
 */
import Groq from 'groq-sdk';

interface FallbackGenerateInput {
  model?: string;
  messages: Array<{ role: 'user' | 'assistant' | 'system', content: string }>;
  json?: boolean;
}

interface OpenRouterModel {
    name: string;
    apiKey: string | undefined;
    model: string;
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

async function tryOpenRouterAPI(modelConfig: OpenRouterModel, input: FallbackGenerateInput): Promise<string | null> {
  const { apiKey, model, name } = modelConfig;
  const { messages, json = false } = input;

  if (!apiKey) {
    console.log(`${name} API key not configured. Skipping.`);
    return null;
  }
  
  return tryFallbackAPI(
    name,
    'https://openrouter.ai/api/v1/chat/completions',
    apiKey,
    {
      model,
      messages: messages,
      response_format: json ? { type: 'json_object' } : undefined,
    }
  );
}


export async function fallbackGenerate(input: FallbackGenerateInput): Promise<string> {
    // 1. Try Groq
    const groqResponse = await tryGroq(input);
    if (groqResponse) {
        return groqResponse;
    }

    // 2. Try OpenRouter models
    const openRouterFallbacks: OpenRouterModel[] = [
        { name: 'Deepseek', apiKey: process.env.DEEPSEEK_API_KEY, model: 'deepseek/deepseek-chat' },
        { name: 'Kimi', apiKey: process.env.KIMI_API_KEY, model: 'kimi/kimi-dev-72b' },
        { name: 'Moonshot', apiKey: process.env.MOONSHOT_API_KEY, model: 'moonshot/moonshot-v1-32k' },
        { name: 'Sarvam', apiKey: process.env.SARVAM_API_KEY, model: 'sarvam/sarvam-m' },
        { name: 'Dolphin Mistral', apiKey: process.env.DOLPHIN_MISTRAL_API_KEY, model: 'cognitivecomputations/dolphin-mistral-24b-venice-edition' },
        { name: 'Tencent Hunyuan', apiKey: process.env.TENCENT_HUNYUAN_API_KEY, model: 'tencent/hunyuan-a13b-instruct' },
        { name: 'Microsoft MAI', apiKey: process.env.MICROSOFT_MAI_API_KEY, model: 'microsoft/mai-ds-r1' },
        { name: 'Qwen 235B', apiKey: process.env.QWEN_235B_API_KEY, model: 'qwen/qwen3-235b-a22b' },
        { name: 'Qwen 4B', apiKey: process.env.QWEN_4B_API_KEY, model: 'qwen/qwen3-4b' },
    ];

    for (const modelConfig of openRouterFallbacks) {
        const response = await tryOpenRouterAPI(modelConfig, input);
        if (response) {
            return response;
        }
    }

    // 3. Try Mistral
    const mistralResponse = await tryMistral(input);
    if (mistralResponse) {
        return mistralResponse;
    }
  
  throw new Error('All fallback services failed.');
}
