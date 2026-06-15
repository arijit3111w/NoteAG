import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createUser = mutation({
    args: {
        email: v.string(),
        userName: v.string(),
        imgUrl: v.string(),
    },
    handler: async (ctx, args) => {
        //if user exists
        const user = await ctx.db.query('users').filter((q) => q.eq(q.field('email'), args.email))
            .collect();

        // if user doesnt exist
        if (user?.length == 0) {
            await ctx.db.insert('users', {
                email: args.email,
                userName: args.userName,
                imgUrl: args.imgUrl,
            });
            return "Inserted new User";
        }
        else {
            return "User already exists";
        }
    }
}); 