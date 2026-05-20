import { NextRequest, NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { openai } from "@/config/OpenAiModel";
import z from "zod";
import { Agent, run, tool, OpenAIChatCompletionsModel } from "@openai/agents";

export async function POST(req: NextRequest) {
    try {
        const { userId, agentId, userInput } = await req.json();

        const agentDetail = await fetchQuery(api.agent.GetAgentById, {
            agentId: agentId
        });

        if (!agentDetail) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        // Safely check if conversation Id exists
        let conversationId_ = null;
        const conversationDetail = await fetchQuery(api.conversation.GetConversationById, {
            agentId: agentDetail._id,
            userId: userId
        });

        // Use optional chaining (?.) to prevent null crashing if conversation doesn't exist yet
        if (conversationDetail?.conversationId) {
            conversationId_ = conversationDetail.conversationId;
        } else {
            // Replaced openai.conversations.create (unsupported) with a safe UUID fallback
            conversationId_ = crypto.randomUUID(); 
        }

        // 🌟 INSTANTIATE THE MODEL (Missing in your code)
        // Adjust the model ID to whichever you are using via OpenRouter
        const customModel = new OpenAIChatCompletionsModel(openai, "openai/gpt-4o-mini");

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
        
        const createdAgents = agentsData.map((config: any) => {
            return new Agent({
                name: config?.name,
                instructions: config?.instructions || "Help the user with their request using your tools.",
                tools: generatedTools,
                model: customModel 
            });
        });

        // Attach custom model to supervisor
        const finalAgent = Agent.create({
            name: agentDetail?.name || "Primary Supervisor",
            // 🌟 FIXED: Added '(a: any)' to resolve the implicit any error
            instructions: `You are an orchestrator. Your only job is to look at the user request and immediately call the handoff tool for the specialized agent that matches the topic. Do not answer questions yourself if a sub-agent exists. Available agents: ${createdAgents.map((a: any) => a.name).join(", ")}.`,
            handoffs: createdAgents.length > 0 ? createdAgents : undefined,
            model: customModel
        });

        const result = await run(finalAgent, userInput, {
            // 🛑 Stream output back without conversationId to prevent platform SDK crashes
            stream: true
        });

        const stream = result.toTextStream();

        // 🌟 FIXED: Cast stream 'as any' to bypass the Next.js / DOM ReadableStream type clash
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