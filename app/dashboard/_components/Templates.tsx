"use client"
import React, { useContext, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { UserDetailContext } from "@/context/UserDetailContext";
import { Button } from "@/components/ui/button";
import { Loader2Icon, Plus } from "lucide-react";
import { toast } from "sonner";
import { AGENT_TEMPLATES, AgentTemplate } from "./agent-templates";

function Templates() {
  const { userDetail } = useContext(UserDetailContext);
  const CreateAgentMutation = useMutation(api.agent.CreateAgent);
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const UseTemplate = async (template: AgentTemplate) => {
    if (!userDetail?._id || loadingId) return;
    setLoadingId(template.id);
    try {
      const agentId = uuidv4();
      await CreateAgentMutation({
        agentId: agentId,
        name: template.name,
        userId: userDetail._id,
        nodes: template.nodes,
        edges: template.edges,
        agentToolConfig: template.agentToolConfig,
      });
      toast.success(`${template.name} created!`);
      router.push("/agent-builder/" + agentId);
    } catch (e) {
      console.error(e);
      toast.error("Could not create the agent. Please try again.");
      setLoadingId(null);
    }
  };

  return (
    <div className="w-full mt-5">
      <p className="text-gray-500">
        Start from a ready-made agent — the workflow and API tool are already
        wired up. Open it, preview it and start chatting.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-5">
        {AGENT_TEMPLATES.map((template) => (
          <div
            key={template.id}
            className="p-4 border rounded-2xl shadow flex flex-col"
          >
            <template.icon
              className="p-2 h-9 w-9 rounded-sm"
              style={{ backgroundColor: template.bgColor }}
            />
            <h2 className="mt-3 font-semibold">{template.name}</h2>
            <p className="text-sm text-gray-500 mt-1 flex-1">
              {template.description}
            </p>
            <Button
              className="mt-4 w-full"
              onClick={() => UseTemplate(template)}
              disabled={loadingId !== null}
            >
              {loadingId === template.id ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <Plus />
              )}
              Use Template
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Templates;
