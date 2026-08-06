import { convexToJson, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const CreateAgent = mutation({
    args: {
        name: v.string(),
        agentId: v.string(),
        userId: v.id('UserTable'),
        // Optional prebuilt workflow — used when creating an agent from a template
        nodes: v.optional(v.any()),
        edges: v.optional(v.any()),
        agentToolConfig: v.optional(v.any()),
    },
    handler: async(ctx, args) => {
        const result = await ctx.db.insert('AgentTable', {
            name: args.name,
            agentId: args.agentId,
            published: false,
            userId: args.userId,
            ...(args.nodes ? { nodes: args.nodes } : {}),
            ...(args.edges ? { edges: args.edges } : {}),
            ...(args.agentToolConfig ? { agentToolConfig: args.agentToolConfig } : {}),
        })
        return result;
    }
})

export const GetUserAgents = query({
    args: {
        userId: v.id('UserTable'),
    },
    handler: async(ctx, args) => {
        const result = await ctx.db.query('AgentTable')
            .filter((q) => q.eq(q.field('userId'), args.userId))
            .order('desc')
            .collect()

        return result
    }
})

export const GetAgentById = query({
    args: {
        agentId: v.string(),
    },
    handler: async(ctx, args) => {
        const result = await ctx.db.query('AgentTable')
            .filter((q) => q.eq(q.field('agentId'), args.agentId))
            .order('desc')
            .collect()
        return result[0];
    }
})

export const UpdateAgentDetail = mutation({
    args: {
        id: v.id('AgentTable'),
        nodes: v.optional(v.any()),
        edges: v.optional(v.any()),
    },
    handler: async(ctx, args) => {
        await ctx.db.patch(args.id, {
            edges: args.edges,
            nodes: args.nodes
        })
    }
})

export const PublishAgent = mutation({
    args: {
        id: v.id('AgentTable'),
    },
    handler: async(ctx, args) => {
        await ctx.db.patch(args.id, {
            published: true
        })
    }
})

export const UpdateAgentToolConfig = mutation({
    args: {
        id: v.id('AgentTable'),
        agentToolConfig: v.optional(v.any()),
    },
    handler: async(ctx, args) => {
        await ctx.db.patch(args.id, {
            agentToolConfig: args.agentToolConfig
        })
    }
})