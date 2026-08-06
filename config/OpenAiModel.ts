import OpenAi from 'openai';

// The whole app talks to the LLM through the OpenAI-compatible chat-completions
// API, so any OpenAI-compatible provider works. The active provider is picked
// from whichever API key is present in .env.local, in this order:
//
//   1. GROQ_API_KEY      — https://console.groq.com/keys   (recommended: fast,
//                          ~1k free requests/day, reliable tool calling)
//   2. GEMINI_API_KEY    — https://aistudio.google.com/apikey
//   3. OPENROUTER_API_KEY — https://openrouter.ai/keys     (free tier is only
//                          50 requests/day)
//
// AI_MODEL overrides the default model for whichever provider is active.

type ProviderConfig = {
    name: string;
    baseURL: string;
    apiKey: string;
    model: string;
};

function resolveProvider(): ProviderConfig {
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const openRouterKey =
        process.env.OPENROUTER_API_KEY ||
        process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

    if (groqKey) {
        return {
            name: 'groq',
            baseURL: 'https://api.groq.com/openai/v1',
            apiKey: groqKey,
            model: process.env.AI_MODEL || 'llama-3.3-70b-versatile',
        };
    }
    if (geminiKey) {
        return {
            name: 'gemini',
            baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
            apiKey: geminiKey,
            model: process.env.AI_MODEL || 'gemini-2.5-flash',
        };
    }
    if (openRouterKey) {
        return {
            name: 'openrouter',
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: openRouterKey,
            model:
                process.env.AI_MODEL ||
                process.env.OPENROUTER_MODEL ||
                'nvidia/nemotron-3-super-120b-a12b:free',
        };
    }
    throw new Error(
        'No AI provider key is set. Add GROQ_API_KEY (recommended — free at https://console.groq.com/keys), GEMINI_API_KEY (https://aistudio.google.com/apikey) or OPENROUTER_API_KEY to .env.local and restart the dev server.'
    );
}

// Lazily instantiate the client. The OpenAI SDK constructor throws
// "Missing credentials" when no API key is available — if we build the client
// at module scope that throw happens during `next build` page-data collection
// and breaks the build. Creating it on first use keeps module evaluation
// side-effect free.
let client: OpenAi | null = null;

export function getOpenAi() {
    if (!client) {
        const provider = resolveProvider();
        client = new OpenAi({
            baseURL: provider.baseURL,
            apiKey: provider.apiKey,
        });
    }
    return client;
}

// The model id matching the active provider — use this everywhere instead of
// reading OPENROUTER_MODEL directly, so switching providers is one env change.
export function getModelName() {
    return resolveProvider().model;
}
