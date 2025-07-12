import { config } from 'dotenv';
config();

import '@/ai/flows/localized-sustainability-tip.ts';
import '@/ai/flows/pledge-encouragement.ts';
import '@/ai/flows/contextual-awareness.ts';
import '@/ai/flows/conversation-guidance.ts';
import '@/ai/flows/summarize-conversation.ts';
import '@/ai/tools/web-search.ts';
import '@/ai/tools/openrouter-fallback.ts';
