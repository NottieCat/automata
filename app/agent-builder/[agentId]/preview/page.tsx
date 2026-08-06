"use client";
import React, { useEffect, useRef, useState } from "react";
import Header from "../../_components/Header";
import { useConvex, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Agent } from "@/types/AgentType";
import { Background, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import axios from "axios";
import { Loader2Icon } from "lucide-react";
import ChatUI from "./_components/ChatUI";
import { toast } from "sonner";
import PublishCode from "./_components/PublishCode";
import { nodeTypes } from "../../_components/NodeTypes";

function PreviewAgent() {
  const convex = useConvex();
  const { agentId } = useParams();
  const [agentDetail, setAgentDetail] = React.useState<Agent>();
  const [flowConfig, setFlowConfig] = React.useState<any>(null);
  const [loading, setLoading] = useState(false);
  const updateAgentToolConfig = useMutation(api.agent.UpdateAgentToolConfig);
  const publishAgent = useMutation(api.agent.PublishAgent);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const autoGenerateAttempted = useRef(false);

  useEffect(() => {
    GetAgentDetails();
  }, []);

  const GetAgentDetails = async () => {
    const result = await convex.query(api.agent.GetAgentById, {
      agentId: agentId as string,
    });
    setAgentDetail(result);

    // get conversation ID if not present
    const conversationIdResult = await axios.get("/api/agent-chat");
    console.log(conversationIdResult.data);
    setConversationId(conversationIdResult.data);
  };

  // 🧩 Generate workflow once agent data is loaded
  useEffect(() => {
    if (agentDetail) {
      GenerateWorkflow();
    }
  }, [agentDetail]);

  // ⚙️ Generate workflow config (node/edge relationship)
  const GenerateWorkflow = () => {
    // 🧩 Build Edge Map for quick source → target lookup
    const edgeMap = agentDetail?.edges?.reduce((acc: any, edge: any) => {
      if (!acc[edge.source]) acc[edge.source] = [];
      acc[edge.source].push(edge);
      return acc;
    }, {});

    // 🔄 Build flow array by mapping each node
    const flow = agentDetail?.nodes?.map((node: any) => {
      const connectedEdges = edgeMap[node.id] || [];
      let next: any = null;

      switch (node.type) {
        // 🧭 Conditional branching node with "if" and "else"
        case "IfElseNode": {
          const ifEdge = connectedEdges.find(
            (e: any) => e.sourceHandle === "if",
          );
          const elseEdge = connectedEdges.find(
            (e: any) => e.sourceHandle === "else",
          );

          next = {
            if: ifEdge?.target || null,
            else: elseEdge?.target || null,
          };
          break;
        }

        // 🧠 Agent or AI Node
        case "AgentNode": {
          if (connectedEdges.length === 1) {
            next = connectedEdges[0].target;
          } else if (connectedEdges.length > 1) {
            next = connectedEdges.map((e: any) => e.target);
          }
          break;
        }

        // 🔗 API Call Node
        case "ApiNode": {
          if (connectedEdges.length === 1) {
            next = connectedEdges[0].target;
          }
          break;
        }

        // ✅ User Approval Node (manual checkpoint)
        case "UserApprovalNode": {
          if (connectedEdges.length === 1) {
            next = connectedEdges[0].target;
          }
          break;
        }

        // 🚀 Start Node
        case "StartNode": {
          if (connectedEdges.length === 1) {
            next = connectedEdges[0].target;
          }
          break;
        }

        // 🏁 End Node
        case "EndNode": {
          next = null; // No next node
          break;
        }

        // 🔧 Default handling for any unknown node type
        default: {
          if (connectedEdges.length === 1) {
            next = connectedEdges[0].target;
          } else if (connectedEdges.length > 1) {
            next = connectedEdges.map((e: any) => e.target);
          }
          break;
        }
      }

      // 🧱 Return a simplified node configuration
      return {
        id: node.id,
        type: node.type,
        label: node.data?.label || node.type,
        settings: node.data?.settings || {},
        next,
      };
    });

    // 🎯 Find the Start Node
    const startNode = agentDetail?.nodes?.find(
      (n: any) => n.type === "StartNode",
    );

    // 🧱 Final Config structure
    const config = {
      startNode: startNode?.id || null,
      flow,
    };

    console.log("✅ Generated Workflow Config:", config);
    setFlowConfig(config);
  };

  // Auto-generate the tool config on first load so the chat is usable
  // immediately, without a manual "Reboot Agent" click.
  useEffect(() => {
    if (
      flowConfig &&
      agentDetail &&
      !agentDetail.agentToolConfig &&
      !autoGenerateAttempted.current
    ) {
      autoGenerateAttempted.current = true;
      GenerateAgentToolConfig();
    }
  }, [flowConfig, agentDetail]);

  const GenerateAgentToolConfig = async () => {
    setLoading(true);
    try {
      const result = await axios.post("/api/generate-agent-tool-config", {
        jsonConfig: flowConfig,
      });

      console.log(result.data);

      // update to our DB — must be the Convex document _id, not the URL uuid
      await updateAgentToolConfig({
        id: agentDetail?._id as any,
        agentToolConfig: result.data,
      });

      GetAgentDetails();
    } catch (error) {
      console.error("Failed to generate config:", error);
    } finally {
      setLoading(false);
    }
  };

  const OnPublish = async () => {
    setOpenDialog(true);
    if (agentDetail?._id && !agentDetail.published) {
      await publishAgent({ id: agentDetail._id as any });
      toast.success("Agent published!");
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header
        previewHeader={true}
        agentDetail={agentDetail}
        onPublish={OnPublish}
      />
      <div className="grid grid-cols-4 flex-1 min-h-0">
        <div className="col-span-3 p-5 border rounded-2xl mx-5 mb-5 flex flex-col min-h-0">
          <h2>Preview</h2>
          <div className="flex-1 min-h-0 w-full">
            <ReactFlow
              nodes={agentDetail?.nodes || []}
              edges={agentDetail?.edges || []}
              fitView
              nodeTypes={nodeTypes}
              draggable={false}
            >
              {/* @ts-ignore */}
              <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
          </div>
        </div>
        <div className="col-span-1 border rounded-2xl mx-5 mb-5 flex flex-col min-h-0 overflow-hidden">
          {!agentDetail?.agentToolConfig ? (
            <div className="flex items-center justify-center h-full gap-2 text-muted-foreground">
              <Loader2Icon className="animate-spin" />
              Preparing agent...
            </div>
          ) : (
            <ChatUI
              agentDetail={agentDetail}
              conversationId={conversationId}
            />
          )}
        </div>
      </div>
      <PublishCode openDialog={openDialog} setOpenDialog={setOpenDialog} agentDetail={agentDetail} />
    </div>
  );
}

export default PreviewAgent;
