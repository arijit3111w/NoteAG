import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveNote = mutation({
    args: {
        fileId: v.string(),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if a note already exists for this fileId
        const existing = await ctx.db
            .query("notes")
            .filter((q) => q.eq(q.field("fileId"), args.fileId))
            .first();

        if (existing) {
            // Update existing note
            await ctx.db.patch(existing._id, {
                content: args.content,
            });
        } else {
            // Create new note
            await ctx.db.insert("notes", {
                fileId: args.fileId,
                content: args.content,
            });
        }
    },
});

export const getNote = query({
    args: {
        fileId: v.string(),
    },
    handler: async (ctx, args) => {
        const note = await ctx.db
            .query("notes")
            .filter((q) => q.eq(q.field("fileId"), args.fileId))
            .first();
        return note;
    },
});
