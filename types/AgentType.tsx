export type Agent = {
  _id: string,
  agentId: string,
  config?: any,
  published: boolean,
  name: string,
  userId: string,
  nodes?: any,
  edges?: any,
  _creationTime: number,
  agentToolConfig?: any
};
