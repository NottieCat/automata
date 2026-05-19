import OpenAi from 'openai';
export const openai = new OpenAi({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
})

