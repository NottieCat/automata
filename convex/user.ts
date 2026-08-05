import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const CreateNewUser = mutation({
    args: {
        name: v.string(),
        email: v.string()
    },
    handler: async (ctx, args) => {
        // if user already exists
        const user = await ctx.db.query('UserTable')
        .filter((q) => q.eq(q.field('email'), args.email))
        .collect()

        // if not then create new user
        if (user?.length == 0) {
            const userData = {
                name: args.name,
                email:args?.email,
                token: 5000
            }
            const result = await ctx.db.insert('UserTable', userData);
            // Return the full inserted document (including _id) so callers
            // like CreateAgent / GetUserAgents have a valid userId to work with.
            return await ctx.db.get(result);
        }
        return user[0];
    }
})