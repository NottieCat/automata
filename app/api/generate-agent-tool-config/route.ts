import { getOpenAi, getModelName } from "@/config/OpenAiModel";
import { NextRequest, NextResponse } from "next/server";

const PROMPT = `from this flow, Generate a agent instruction prompt with all details along with 
tools with all setting info in JSON format. Do not add any extra text just written JSON data. 
make sure to mentioned parameters depends on get and post request:{
  systemPrompt:'',
  primaryAgentName:'', 
  "agents": [
    {
      "id": "agent-id",
      "name": "",
      "model": "",
      "includeHistory": true|false,
      "output": "",
      "tools": ["toold-id"],
      "instruction": ""
    },
  ],
  "tools": [
    {
      "id": "id",
      "name": "",
      "description": "",
      "method": "GET"|"POST",
      "url": "",
      "includeApiKey": true,
      "apiKey": "",
      "parameters": {
        "key": "dataType"
      },
      "usage": [ ],
      "assignedAgent": ""
    }
  ]
}`;

export async function POST(req: NextRequest) {
    const { jsonConfig } = await req.json();

    const openai = getOpenAi();
    // Chat Completions instead of the Responses API — OpenRouter only supports
    // the latter on some providers, and free-tier endpoints often lack it.
    const response = await openai.chat.completions.create({
        model: getModelName(),
        messages: [{ role: 'user', content: JSON.stringify(jsonConfig) + PROMPT }],
    })

    const outputText = response.choices[0]?.message?.content ?? '';
    // parse the response to JSON — strip code fences and any surrounding prose
    let parsedJson;
    try {
        const start = outputText.indexOf('{');
        const end = outputText.lastIndexOf('}');
        parsedJson = JSON.parse(outputText.slice(start, end + 1));
    } catch (err) {
        return NextResponse.json({error: 'Failed to parse JSON response', details:err, raw: outputText}, {status: 500});
    }

    return NextResponse.json({parsedJson});
}