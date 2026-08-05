import { NextRequest, NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { getOpenAi } from "@/config/OpenAiModel";
import z from "zod";
import { Agent, run, tool, OpenAIChatCompletionsModel } from "@openai/agents";

export async function POST(req: NextRequest) {
    try {
        // `messages` is optional: external callers can pass the running chat
        // history ([{role, content}]) to keep the conversation stateful.
        // (The old Convex conversation lookup was removed — it required
        // Convex-typed userIds that external callers don't have, and its
        // result was never used.)
        const { agentId, userInput, messages } = await req.json();

        const agentDetail = await fetchQuery(api.agent.GetAgentById, {
            agentId: agentId
        });

        if (!agentDetail) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        // Same memory engine as /api/agent-chat
        let contextualInput = userInput;
        if (messages && messages.length > 1) {
            const historyTranscript = messages
                .slice(0, -1)
                .map((m: any) => `${m.role === 'user' ? 'User' : 'Agent'}: ${m.content}`)
                .join("\n");

            contextualInput = `Conversational History:\n${historyTranscript}\n\nLatest User Input: ${userInput}\n\nSystem Note: Use the history above to fulfill the latest input. If the user provides a parameter or missing variable (like a city/location) for a pending tool call, execute that tool immediately.`;
        }

        // 🌟 INSTANTIATE THE MODEL (Missing in your code)
        // Adjust the model ID to whichever you are using via OpenRouter
        const customModel = new OpenAIChatCompletionsModel(
            getOpenAi(),
            process.env.OPENROUTER_MODEL || "nvidia/nemotron-3-super-120b-a12b:free"
        );

        // Note: Added .parsedJson fallback based on earlier Convex data structures
        const toolsData = agentDetail?.agentToolConfig?.parsedJson?.tools || agentDetail?.agentToolConfig?.tools || [];
        
        const generatedTools = toolsData.map((t: any) => {
            // 🧠 UPGRADED SMART PARSE: Matches both {variable} and {{variable}}
            // FIXED: Added (m: string) to prevent implicit any
            const urlVars = [...(t.url.match(/\{+([^}]+)\}+/g) || [])].map((m: string) => m.replace(/[{}]/g, ''));
            
            const combinedParams: Record<string, string> = { ...(t.parameters || {}) };
            // FIXED: Added (v: string) to prevent implicit any
            urlVars.forEach((v: string) => {
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
        const agentsData = agentDetail?.agentToolConfig?.parsedJson?.agents || agentDetail?.agentToolConfig?.agents || [];

        // Small models tend to say "let me check..." and stop without actually
        // calling the tool — forbid that explicitly.
        const TOOL_POLICY = `

CRITICAL TOOL RULE: When the user asks for something a tool can provide, you MUST call that tool in this same turn and answer using its result. NEVER reply with only an acknowledgement like "Sure, let me check" — announcing an action without calling the tool is a failure. Only skip the tool call to ask for a genuinely missing required parameter.`;

        const createdAgents = agentsData.map((config: any) => {
            return new Agent({
                name: config?.name,
                instructions: (config?.instructions || "Help the user with their request using your tools.") + TOOL_POLICY,
                tools: generatedTools,
                model: customModel
            });
        });

        // With a single agent there is nothing to orchestrate — run it directly
        // instead of adding a supervisor handoff hop.
        const finalAgent = createdAgents.length === 1 ? createdAgents[0] : Agent.create({
            name: agentDetail?.name || "Primary Supervisor",
            // 🌟 FIXED: Added '(a: any)' to resolve the implicit any error
            instructions: `You are an orchestrator. Your only job is to look at the user request and immediately call the handoff tool for the specialized agent that matches the topic. Do not answer questions yourself if a sub-agent exists. Available agents: ${createdAgents.map((a: any) => a.name).join(", ")}.`,
            handoffs: createdAgents.length > 0 ? createdAgents : undefined,
            model: customModel
        });

        const result = await run(finalAgent, contextualInput, {
            stream: true
        });

        // toTextStream() emits string chunks; a Response body must be bytes,
        // so pipe through TextEncoderStream to avoid "Received non-Uint8Array chunk".
        const stream = (result.toTextStream() as unknown as ReadableStream<string>)
            .pipeThrough(new TextEncoderStream());

        return new Response(stream as any, {
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