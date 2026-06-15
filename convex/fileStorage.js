import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export const addPdfFile = mutation({
    args: {
        fileId: v.string(),
        fileName: v.string(),
        storageId: v.string(),
        createdBy: v.string(),
    },
    handler: async (ctx, args) => {
        // Generate the actual accessible URL from the storage ID
        const fileUrl = await ctx.storage.getUrl(args.storageId);
        
        await ctx.db.insert("pdfFiles", {
            fileId: args.fileId,
            fileName: args.fileName,
            fileUrl: fileUrl,
            storageId: args.storageId,
            createdBy: args.createdBy,
            uploadedAt: new Date().toISOString(),
        });
        return fileUrl;
    },
});

export const getUserFiles = query({
    args: {
        userEmail: v.string(),
    },
    handler: async (ctx, args) => {
        const files = await ctx.db
            .query("pdfFiles")
            .filter((q) => q.eq(q.field("createdBy"), args.userEmail))
            .collect();
        return files;
    },
});

export const getFileCount = query({
    args: {
        userEmail: v.string(),
    },
    handler: async (ctx, args) => {
        const files = await ctx.db
            .query("pdfFiles")
            .filter((q) => q.eq(q.field("createdBy"), args.userEmail))
            .collect();
        return files.length;
    },
});

export const GetFileRecord = query({
    args: {
        fileId: v.string()
    },
    handler: async (ctx, args) => {
        const result = await ctx.db
            .query("pdfFiles")
            .filter((q) => q.eq(q.field("fileId"), args.fileId))
            .collect();
        return result[0];
    }
});
