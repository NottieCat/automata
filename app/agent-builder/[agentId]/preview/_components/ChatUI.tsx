import { Button } from "@/components/ui/button";
import { Agent } from "@/types/AgentType";
import { Loader2Icon, Send } from "lucide-react";
import React, { useState } from "react";
import Markdown from 'react-markdown'
// import remarkGfm from 'remark-gfm'

// Define message type structure
type Message = {
  role: "user" | "assistant";
  content: string;
};

type Props = {
  agentDetail: Agent;
  conversationId: string | null;
};

function ChatUI({ agentDetail, conversationId }: Props) {
  const [userInput, setUserInput] = useState<string>("");
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);

  const OnSendMsg = async () => {
    if (!userInput.trim()) return;

    setLoadingMsg(true);
    const currentInput = userInput;

    // Optimistically add the user's message to the chat
    const updatedMessages = [...messages, { role: "user" as const, content: currentInput }];
    setMessages(updatedMessages);
    setUserInput("");

    try {
      const result = await fetch("/api/agent-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentName: agentDetail?.name,
          agents: agentDetail?.agentToolConfig?.parsedJson?.agents || [],
          tools: agentDetail?.agentToolConfig?.parsedJson?.tools || [],
          input: currentInput,
          messages: updatedMessages,
          conversationId: conversationId,
        }),
      });

      // A failed request returns JSON ({error, message}) instead of a text
      // stream — surface it in the chat instead of silently showing nothing.
      if (!result.ok) {
        let detail = "";
        try {
          const err = await result.json();
          detail = err?.message || err?.error || "";
        } catch {}
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `⚠️ The agent could not respond${detail ? `: ${detail}` : "."} Please try again.`,
          },
        ]);
        return;
      }

      if (!result.body) return;

      const reader = result.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      // 🌟 STEP 1: Add an empty assistant message bubble to the screen
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      // 🌟 STEP 2: Read the stream and append text chunks in real-time
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (value) {
          const textChunk = decoder.decode(value, { stream: true });
          
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastIndex = newMessages.length - 1;
            
            newMessages[lastIndex] = {
              ...newMessages[lastIndex],
              content: newMessages[lastIndex].content + textChunk,
            };
            
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Network / stream failure — tell the user instead of leaving the chat blank
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        const errMsg = {
          role: "assistant" as const,
          content: "⚠️ The connection failed while the agent was responding. Please try again.",
        };
        // Reuse the empty assistant bubble if one was already added
        if (last?.role === "assistant" && !last.content) {
          return [...prev.slice(0, -1), errMsg];
        }
        return [...prev, errMsg];
      });
    } finally {
      setLoadingMsg(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center border-b p-4">
        <h2>{agentDetail?.name}</h2>
      </div>
      <div className="w-full flex-1 min-h-0 p-4 flex flex-col">
        {/* Message Section */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 flex rounded-lg max-w-[80%] ${
                msg.role === "user"
                  ? "bg-blue-500 text-white self-end"
                  : "bg-gray-300 text-black self-start"
              }`}
            >
              {/* Added whitespace-pre-wrap so bullet points format correctly */}
              {/* <h2 className="text-sm whitespace-pre-wrap">{msg.content}</h2> */}
              <div className="text-sm break-words whitespace-pre-wrap overflow-hidden">
               <Markdown >{msg?.content}</Markdown>
               </div>
            </div>
          ))}
        </div>

        {/* Loading state */}
        {loadingMsg && (
          <div className="flex justify-center items-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-800"></div>
            <span className="ml-2 text-zinc-800">
              Thinking... Working on your request
            </span>
          </div>
        )}
      </div>

      {/* Footer Input */}
      <div className="p-2 border-t flex items-center gap-2">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message here..."
          className="flex-1 resize-none border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
        />
        <Button
          onClick={OnSendMsg}
          disabled={loadingMsg || !userInput.trim().length}
        >
          {loadingMsg ? <Loader2Icon className="animate-spin" /> : <Send />}
        </Button>
      </div>
    </div>
  );
}

export default ChatUI;