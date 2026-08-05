import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Copy } from "lucide-react";
import { Agent } from "@/types/AgentType";

type Props = {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  agentDetail?: Agent;
};

// The generated snippets contain backticks/${} of their own, so they are
// assembled with string concatenation instead of nested template literals.
function buildReactTemplate(apiUrl: string, agentId: string, agentName: string) {
  return `"use client";
// AgentChat.jsx — drop-in chat component for your published agent.
// Works in any React app (plain CSS, no dependencies).
import { useState } from "react";

const AGENT_API = "${apiUrl}";
const AGENT_ID = "${agentId}";

export default function AgentChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const updated = [...messages, { role: "user", content: input }];
    setMessages(updated);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(AGENT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: AGENT_ID,
          userInput: input,
          messages: updated, // keeps the conversation stateful
        }),
      });
      if (!res.ok || !res.body) throw new Error("Agent request failed: " + res.status);

      // Stream the reply token-by-token into the last message bubble
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const next = [...prev];
          const last = next.length - 1;
          next[last] = { ...next[last], content: next[last].content + chunk };
          return next;
        });
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, border: "1px solid #e5e7eb", borderRadius: 12, display: "flex", flexDirection: "column", height: 520, fontFamily: "sans-serif" }}>
      <div style={{ padding: 12, borderBottom: "1px solid #e5e7eb", fontWeight: 600 }}>
        ${agentName}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              background: m.role === "user" ? "#2563eb" : "#f3f4f6",
              color: m.role === "user" ? "#fff" : "#111",
              borderRadius: 10,
              padding: "8px 12px",
              maxWidth: "80%",
              whiteSpace: "pre-wrap",
            }}
          >
            {m.content}
          </div>
        ))}
        {loading && <div style={{ color: "#6b7280", fontSize: 13 }}>Thinking…</div>}
      </div>
      <div style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid #e5e7eb" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message…"
          style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px" }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{ background: "#111", color: "#fff", borderRadius: 8, padding: "8px 14px", border: "none", cursor: "pointer" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
`;
}

function buildJsTemplate(apiUrl: string, agentId: string) {
  return `// agentClient.js — call your published agent from any JavaScript/Node app.
const AGENT_API = "${apiUrl}";
const AGENT_ID = "${agentId}";

/**
 * Send a message to the agent and stream the reply.
 * @param {string} userInput - the user's latest message
 * @param {{role: string, content: string}[]} messages - full chat history incl. the latest message
 * @param {(chunk: string) => void} [onChunk] - called for each streamed text chunk
 * @returns {Promise<string>} the full reply text
 */
export async function chatWithAgent(userInput, messages = [], onChunk) {
  const res = await fetch(AGENT_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId: AGENT_ID, userInput, messages }),
  });
  if (!res.ok || !res.body) {
    throw new Error("Agent request failed: " + res.status);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let reply = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    reply += chunk;
    if (onChunk) onChunk(chunk);
  }
  return reply;
}

// Example usage:
// const history = [{ role: "user", content: "whats the weather in london?" }];
// const reply = await chatWithAgent("whats the weather in london?", history, (c) => process.stdout.write(c));
`;
}

function buildCurlTemplate(apiUrl: string, agentId: string) {
  return `# Streams the agent's reply as plain text (-N disables buffering)
curl -N ${apiUrl} \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "${agentId}",
    "userInput": "Hello! What can you do?"
  }'
`;
}

function CodeBlock({ fileName, lang, code }: { fileName: string; lang: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full min-w-0 max-w-full rounded-md border bg-muted/30 overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-2 bg-muted/50">
        <span className="text-xs font-mono text-muted-foreground">{fileName}</span>
        <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
          <span>{lang}</span>
          <button onClick={onCopy} className="hover:text-foreground transition-colors" title="Copy code">
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <pre className="p-4 overflow-x-auto overflow-y-auto max-h-[50vh] text-sm font-mono text-foreground">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function PublishCode({ openDialog, setOpenDialog, agentDetail }: Props) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const apiUrl = `${origin}/api/agent-sdk`;
  const agentId = agentDetail?.agentId ?? "YOUR_AGENT_ID";

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      {/* sm:max-w-3xl must carry the responsive variant to override the
          component's built-in sm:max-w-lg. min-w-0 on children stops the
          non-wrapping <pre> from stretching the grid past the viewport. */}
      <DialogContent className="sm:max-w-3xl [&>*]:min-w-0">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Integrate “{agentDetail?.name ?? "your agent"}”
          </DialogTitle>
          <DialogDescription>
            Your agent is live at <span className="font-mono text-xs">{apiUrl}</span>. Copy a
            template below into your own project — the agent ID is already filled in.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="react" className="w-full min-w-0 mt-2">
          <TabsList>
            <TabsTrigger value="react">React Component</TabsTrigger>
            <TabsTrigger value="js">JavaScript</TabsTrigger>
            <TabsTrigger value="curl">cURL</TabsTrigger>
          </TabsList>
          <TabsContent value="react">
            <CodeBlock fileName="AgentChat.jsx" lang="jsx" code={buildReactTemplate(apiUrl, agentId, agentDetail?.name ?? "AI Agent")} />
          </TabsContent>
          <TabsContent value="js">
            <CodeBlock fileName="agentClient.js" lang="js" code={buildJsTemplate(apiUrl, agentId)} />
          </TabsContent>
          <TabsContent value="curl">
            <CodeBlock fileName="terminal" lang="bash" code={buildCurlTemplate(apiUrl, agentId)} />
          </TabsContent>
        </Tabs>

        <p className="text-xs text-muted-foreground">
          Note: when you deploy this platform, the URL above changes to your production domain
          automatically. The endpoint streams plain text and accepts{" "}
          <span className="font-mono">{`{ agentId, userInput, messages? }`}</span>.
        </p>
      </DialogContent>
    </Dialog>
  );
}

export default PublishCode;
