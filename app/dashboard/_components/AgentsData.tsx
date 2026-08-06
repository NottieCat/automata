"use client"
import React, { useContext, useEffect, useState } from "react";
import { useConvex, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UserDetailContext } from "@/context/UserDetailContext";
import { Agent } from "@/types/AgentType";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import moment from "moment";
import { toast } from "sonner";

function AgentsData() {
  const { userDetail } = useContext(UserDetailContext);
  const convex = useConvex();
  const DeleteAgentMutation = useMutation(api.agent.DeleteAgent);
  const [agentList, setAgentList] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userDetail?._id && GetUserAgents();
  }, [userDetail?._id]);

  const GetUserAgents = async () => {
    const result = await convex.query(api.agent.GetUserAgents, {
      userId: userDetail?._id,
    });
    setAgentList(result || []);
    setLoading(false);
  };

  const DeleteAgent = async (agent: Agent) => {
    try {
      await DeleteAgentMutation({ id: agent._id as any });
      setAgentList((prev) => prev.filter((a) => a._id !== agent._id));
      toast.success(`Deleted "${agent.name}"`);
    } catch (e) {
      console.error(e);
      toast.error("Could not delete the agent. Please try again.");
    }
  };

  const countApiTools = (agent: Agent) =>
    (agent.nodes || []).filter((n: any) => n.type === "ApiNode").length;

  if (loading) {
    return <p className="mt-8 text-gray-500">Loading agents…</p>;
  }

  if (agentList.length === 0) {
    return (
      <p className="mt-8 text-gray-500">
        No agents yet — create one from the Dashboard or use a Template.
      </p>
    );
  }

  return (
    <div className="mt-6 border rounded-2xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agent</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Nodes</TableHead>
            <TableHead className="text-center">API Tools</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agentList.map((agent) => (
            <TableRow key={agent._id as string}>
              <TableCell className="font-medium">{agent.name}</TableCell>
              <TableCell>
                {agent.published ? (
                  <Badge>Published</Badge>
                ) : (
                  <Badge variant="outline">Draft</Badge>
                )}
              </TableCell>
              <TableCell className="text-center">
                {agent.nodes?.length ?? 0}
              </TableCell>
              <TableCell className="text-center">
                {countApiTools(agent) || "—"}
              </TableCell>
              <TableCell>
                {moment(agent._creationTime).format("MMM D, YYYY")}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link href={"/agent-builder/" + agent.agentId}>
                    <Button variant="outline" size="sm">
                      <ExternalLink /> Open
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete &quot;{agent.name}&quot;?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This permanently removes the agent and its workflow.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => DeleteAgent(agent)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default AgentsData;
