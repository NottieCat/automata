import {
  Bitcoin,
  BookOpen,
  HandCoins,
  Laugh,
  UserSearch,
  type LucideIcon,
} from "lucide-react";

export type AgentTemplate = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  bgColor: string;
  nodes: any[];
  edges: any[];
  agentToolConfig: any;
};

type TemplateInput = {
  key: string;
  name: string;
  description: string;
  icon: LucideIcon;
  bgColor: string;
  instruction: string;
  tool: {
    name: string;
    description: string;
    url: string;
    parameters: Record<string, string>;
  };
};

/**
 * Builds a Start → Agent → API → End workflow in the exact node/edge shape the
 * canvas produces, plus a ready-to-chat agentToolConfig so the preview works
 * immediately (the "Reboot Agent" LLM step can still regenerate it later).
 */
function buildTemplate(t: TemplateInput): AgentTemplate {
  const agentId = `agent-${t.key}`;
  const apiId = `api-${t.key}`;
  const endId = `end-${t.key}`;

  const nodes = [
    {
      id: "start",
      type: "StartNode",
      position: { x: -240, y: 120 },
      data: { label: "Start" },
    },
    {
      id: agentId,
      type: "AgentNode",
      position: { x: -40, y: 105 },
      data: {
        label: t.name,
        bgColor: "#CDF7E3",
        id: "agent",
        type: "AgentNode",
        settings: {
          name: t.name,
          instruction: t.instruction,
          model: "gemini-flash-1.5",
          includeHistory: true,
          output: "text",
        },
      },
    },
    {
      id: apiId,
      type: "ApiNode",
      position: { x: 180, y: 105 },
      data: {
        label: t.tool.name,
        bgColor: "#D1F0FF",
        id: "api",
        type: "ApiNode",
        settings: {
          name: t.tool.name,
          method: "GET",
          url: t.tool.url,
          includeApiKey: false,
          apiKey: "",
        },
      },
    },
    {
      id: endId,
      type: "EndNode",
      position: { x: 420, y: 120 },
      data: { label: "End", bgColor: "#FFE3E3", id: "end", type: "EndNode" },
    },
  ];

  const edges = [
    { id: `xy-edge__start-${agentId}`, source: "start", target: agentId },
    { id: `xy-edge__${agentId}-${apiId}`, source: agentId, target: apiId },
    { id: `xy-edge__${apiId}-${endId}`, source: apiId, target: endId },
  ];

  const agentToolConfig = {
    parsedJson: {
      primaryAgentName: t.name,
      systemPrompt: "",
      agents: [
        {
          id: agentId,
          name: t.name,
          // The chat runtime reads `instructions`; the builder UI stores
          // `instruction` — include both so every path gets the persona.
          instruction: t.instruction,
          instructions: t.instruction,
          model: "gemini-flash-1.5",
          includeHistory: true,
          output: "",
          tools: [apiId],
        },
      ],
      tools: [
        {
          id: apiId,
          name: t.tool.name,
          description: t.tool.description,
          method: "GET",
          url: t.tool.url,
          includeApiKey: false,
          apiKey: "",
          parameters: t.tool.parameters,
          assignedAgent: agentId,
          usage: [],
        },
      ],
    },
  };

  return {
    id: t.key,
    name: t.name,
    description: t.description,
    icon: t.icon,
    bgColor: t.bgColor,
    nodes,
    edges,
    agentToolConfig,
  };
}

export const AGENT_TEMPLATES: AgentTemplate[] = [
  buildTemplate({
    key: "currency-converter",
    name: "Currency Converter",
    description:
      "Converts an amount between any two currencies using live exchange rates.",
    icon: HandCoins,
    bgColor: "#CDF7E3",
    instruction:
      "You are a Currency Converter agent. The user will ask to convert an amount between two currencies (for example: 100 USD to INR). Call the Exchange Rate API tool with baseCurrency set to the 3-letter code of the source currency (e.g. USD). The response contains a 'rates' object mapping every currency code to its conversion rate. Multiply the user's amount by the target currency's rate and reply with the converted value and the rate you used. If the user hasn't given an amount or both currencies, ask for the missing detail.",
    tool: {
      name: "Exchange Rate API",
      description:
        "Fetches the latest conversion rates for a base currency. baseCurrency must be a 3-letter currency code like USD, EUR or INR. The response's 'rates' object maps every currency code to its rate.",
      url: "https://open.er-api.com/v6/latest/{baseCurrency}",
      parameters: { baseCurrency: "string" },
    },
  }),
  buildTemplate({
    key: "crypto-tracker",
    name: "Crypto Price Tracker",
    description:
      "Reports the live USD price and 24h change of any cryptocurrency.",
    icon: Bitcoin,
    bgColor: "#FFF3CD",
    instruction:
      "You are a Crypto Price Tracker. The user will ask for the current price of a cryptocurrency. Convert the coin's name to its CoinGecko id in lowercase (Bitcoin → bitcoin, Ethereum → ethereum, Solana → solana, Dogecoin → dogecoin) and call the Crypto Price API tool with coinId set to that id. Reply with the current USD price and the 24-hour change percentage, nicely formatted. If the coin is unknown, ask the user to clarify which coin they mean.",
    tool: {
      name: "Crypto Price API",
      description:
        "Fetches the current USD price and 24-hour change for a cryptocurrency from CoinGecko. coinId must be a lowercase CoinGecko id like bitcoin, ethereum or solana.",
      url: "https://api.coingecko.com/api/v3/simple/price?ids={coinId}&vs_currencies=usd&include_24hr_change=true",
      parameters: { coinId: "string" },
    },
  }),
  buildTemplate({
    key: "dictionary",
    name: "Dictionary Assistant",
    description:
      "Looks up any English word — definitions, phonetics and example usage.",
    icon: BookOpen,
    bgColor: "#E3F2FD",
    instruction:
      "You are a Dictionary Assistant. When the user gives you an English word, call the Dictionary API tool with word set to that word in lowercase. From the response, reply with: the word, its phonetic spelling, its part of speech, the top 1-2 definitions and one example sentence if available. If the API returns an error, tell the user the word wasn't found and suggest checking the spelling.",
    tool: {
      name: "Dictionary API",
      description:
        "Looks up an English word and returns its definitions, phonetics, part of speech and example sentences. word must be a single English word in lowercase.",
      url: "https://api.dictionaryapi.dev/api/v2/entries/en/{word}",
      parameters: { word: "string" },
    },
  }),
  buildTemplate({
    key: "github-finder",
    name: "GitHub Profile Finder",
    description:
      "Fetches any GitHub user's public profile — bio, repos and followers.",
    icon: UserSearch,
    bgColor: "#EADCF8",
    instruction:
      "You are a GitHub Profile Finder. The user will give you a GitHub username. Call the GitHub User API tool with username set to that exact username. Reply with a short profile summary: name, bio, location, number of public repos, followers and the profile URL (html_url). If the response says 'Not Found', tell the user that username doesn't exist on GitHub.",
    tool: {
      name: "GitHub User API",
      description:
        "Fetches public profile information for a GitHub user: name, bio, location, public repos, followers and profile URL. username is the GitHub login, e.g. torvalds.",
      url: "https://api.github.com/users/{username}",
      parameters: { username: "string" },
    },
  }),
  buildTemplate({
    key: "joke-generator",
    name: "Joke Generator",
    description:
      "Tells safe jokes on demand — programming jokes, puns and more.",
    icon: Laugh,
    bgColor: "#FFE3E3",
    instruction:
      "You are a Joke Generator. When the user asks for a joke, call the Joke API tool with category set to one of: Programming, Pun, Misc or Any — pick the one matching their request, or 'Any' if they don't specify. The response contains the joke in the 'joke' field. Tell the joke in a fun way. Never make up a joke yourself; always fetch one with the tool.",
    tool: {
      name: "Joke API",
      description:
        "Returns a random family-friendly joke. category must be one of: Any, Programming, Pun, Misc, Spooky, Christmas.",
      url: "https://v2.jokeapi.dev/joke/{category}?safe-mode&type=single",
      parameters: { category: "string" },
    },
  }),
];
