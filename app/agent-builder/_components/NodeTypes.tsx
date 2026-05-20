import AgentNode from "../_customNodes/AgentNode";
import ApiNode from "../_customNodes/ApiNode";
import EndNode from "../_customNodes/EndNode";
import IfElseNode from "../_customNodes/IfElseNode";
import StartNode from "../_customNodes/StartNode";
import UserApprovalNode from "../_customNodes/UserApprovalNode";
import WhileNode from "../_customNodes/WhileNode";

export const nodeTypes = {
  StartNode: StartNode,
  AgentNode: AgentNode,
  EndNode: EndNode,
  IfElseNode: IfElseNode,
  WhileNode: WhileNode,
  UserApprovalNode: UserApprovalNode,
  ApiNode: ApiNode,
};