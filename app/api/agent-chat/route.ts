import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { Agent, run, tool, OpenAIChatCompletionsModel } from '@openai/agents';
import OpenAI from 'openai'; 

export async function POST(req: NextRequest) {
    try {
        const { input, tools, agents, conversationId, agentName, messages } = await req.json();

        // 🛡️ OpenRouter Client with explicit headers to prevent 400 rejections
        const openRouterClient = new OpenAI({
            apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
            baseURL: "https://openrouter.ai/api/v1",
            defaultHeaders: {
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "AI Agent Builder",
            }
        });

        // 🌟 Use standard GPT-4o-mini for perfect tool-schema compatibility
        const customModel = new OpenAIChatCompletionsModel(openRouterClient, "openai/gpt-4o-mini");

        // MEMORY ENGINE
        let contextualInput = input;
        if (messages && messages.length > 1) {
            const historyTranscript = messages
                .slice(0, -1)
                .map((m: any) => `${m.role === 'user' ? 'User' : 'Agent'}: ${m.content}`)
                .join("\n");

            contextualInput = `Conversational History:\n${historyTranscript}\n\nLatest User Input: ${input}\n\nSystem Note: Use the history above to fulfill the latest input. If the user provides a parameter or missing variable (like a city/location) for a pending tool call, execute that tool immediately.`;
        }

        // Map tools (with safe fallback for empty parameters)
        // Map tools with Smart URL Parsing
        // Map tools with Bulletproof URL Parsing
        const generatedTools = (tools || []).map((t: any) => {
            
            // 🧠 UPGRADED SMART PARSE: Matches both {variable} and {{variable}}
            const urlVars = [...(t.url.match(/\{+([^}]+)\}+/g) || [])].map(m => m.replace(/[{}]/g, ''));
            
            const combinedParams: Record<string, string> = { ...(t.parameters || {}) };
            urlVars.forEach(v => {
                if (!combinedParams[v]) combinedParams[v] = "string";
            });

            const paramEntries = Object.entries(combinedParams);
            
            const paramSchema = paramEntries.length > 0 
                ? z.object(
                    Object.fromEntries(
                        paramEntries.map(([key]) => {
                            return [key, z.string().describe(`The ${key} value required for the API request`)];
                        })
                    )
                ) 
                : z.object({});

            return tool({
                name: t.name ? t.name.replace(/\s+/g, '_') : "API_Tool",
                description: t.description || `Executes the ${t.name} API operation`,
                parameters: paramSchema,
                async execute(params: Record<string, any>) {
                    let url = t.url;
                    
                    // 🌟 UPGRADED REPLACEMENT: Replaces {key} or {{key}} dynamically
                    for (const key in params) {
                        const regex = new RegExp(`\\{+${key}\\}+`, 'g');
                        url = url.replace(regex, encodeURIComponent(String(params[key])));
                    }
                    
                    if (t.includeApiKey && t.apiKey) {
                        url += url.includes("?") ? `&key=${t.apiKey}` : `?key=${t.apiKey}`;
                    }
                    
                    console.log("\n🚀 EXECUTING API CALL TO:", url, "\n");
                    
                    const response = await fetch(url);
                    return await response.json();
                }
            });
        });

        // Attach custom model to sub-agents
        const createdAgents = (agents || []).map((config: any) => {
            return new Agent({
                name: config?.name,
                instructions: config?.instructions || "Help the user with their request using your tools.",
                tools: generatedTools,
                model: customModel 
            });
        });

        // Attach custom model to supervisor
        const finalAgent = Agent.create({
            name: agentName || "Primary Supervisor",
            instructions: `You are an orchestrator. Your only job is to look at the user request and immediately call the handoff tool for the specialized agent that matches the topic. Do not answer questions yourself if a sub-agent exists. Available agents: ${createdAgents.map(a => a.name).join(", ")}.`,
            handoffs: createdAgents.length > 0 ? createdAgents : undefined,
            model: customModel
        });

        const result = await run(finalAgent, contextualInput, {
            // 🛑 THE FATAL BUG KILLER: Removing conversationId completely. 
            // This stops the SDK from trying to hit platform.openai.com in the background!
            stream: true
        });

        const stream = result.toTextStream();

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache'
            }
        });

    } catch (error: any) {
        console.error("🔴 Caught API Route error:", error);
        return NextResponse.json({
            error: "Execution Failed",
            message: error?.message || "Unknown error"
        }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const mockConversationId = "session_" + Math.random().toString(36).substring(2, 11);
        return NextResponse.json(mockConversationId);
    } catch (error: any) {
        return NextResponse.json({ error: "Local tracking ID generation failed" }, { status: 500 });
    }
}