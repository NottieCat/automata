import OpenAi from 'openai';

let client: OpenAi | null = null;

// Lazily instantiate the OpenAI (OpenRouter) client. The OpenAI SDK constructor
// throws "Missing credentials" when no API key is available — if we build the
// client at module scope that throw happens during `next build` page-data
// collection and breaks the build. Creating it on first use keeps module
// evaluation side-effect free.
export function getOpenAi() {
    if (!client) {
        // Prefer the server-only var; NEXT_PUBLIC_ kept for backward compat.
        const apiKey =
            process.env.OPENROUTER_API_KEY ||
            process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
        if (!apiKey) {
            throw new Error(
                "OPENROUTER_API_KEY is not set. Get a key at https://openrouter.ai/keys, add it to .env.local, and restart the dev server."
            );
        }
        client = new OpenAi({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey,
        });
    }
    return client;
}
