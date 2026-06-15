import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        userName: v.string(),
        email: v.string(),
        imgUrl: v.string(),
        isPremium: v.optional(v.boolean()),
        stripeCustomerId: v.optional(v.string()),
    }),
    pdfFiles: defineTable({
        fileId: v.string(),
        fileName: v.string(),
        fileUrl: v.string(),
        storageId: v.string(),
        createdBy: v.string(),
        uploadedAt: v.string(),
    }),
    subscriptions: defineTable({
        userEmail: v.string(),
        stripeSubscriptionId: v.string(),
        stripeCustomerId: v.string(),
        status: v.string(), // active, canceled, past_due, etc.
        planName: v.string(),
        currentPeriodEnd: v.number(),
        cancelAtPeriodEnd: v.boolean(),
    }).index("by_email", ["userEmail"])
      .index("by_subscription_id", ["stripeSubscriptionId"]),
    documents: defineTable({
        embedding: v.array(v.number()),
        text: v.string(),
        metadata: v.any(),
    }).vectorIndex("byEmbedding", {
        vectorField: "embedding",
        dimensions: 3072,
    }),
    notes: defineTable({
        fileId: v.string(),
        content: v.string(),
    }),
});
