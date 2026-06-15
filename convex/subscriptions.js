import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create or update subscription
export const upsertSubscription = mutation({
  args: {
    userEmail: v.string(),
    stripeSubscriptionId: v.string(),
    stripeCustomerId: v.string(),
    status: v.string(),
    planName: v.string(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if subscription already exists
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_subscription_id", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first();

    if (existing) {
      // Update existing subscription
      await ctx.db.patch(existing._id, {
        status: args.status,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      });
      return existing._id;
    } else {
      // Create new subscription
      const subscriptionId = await ctx.db.insert("subscriptions", args);
      return subscriptionId;
    }
  },
});

// Get user's active subscription
export const getUserSubscription = query({
  args: { userEmail: v.string() },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_email", (q) => q.eq("userEmail", args.userEmail))
      .first();

    return subscription;
  },
});

// Check if user is premium
export const isPremiumUser = query({
  args: { userEmail: v.string() },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_email", (q) => q.eq("userEmail", args.userEmail))
      .first();

    if (!subscription) return false;

    // Check if subscription is active and not expired
    const isActive = subscription.status === "active" || subscription.status === "trialing";
    const notExpired = subscription.currentPeriodEnd * 1000 > Date.now();

    return isActive && notExpired;
  },
});

// Cancel subscription
export const cancelSubscription = mutation({
  args: { stripeSubscriptionId: v.string() },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_subscription_id", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first();

    if (subscription) {
      await ctx.db.patch(subscription._id, {
        status: "canceled",
      });
    }
  },
});


// Manually set user as premium (for testing or admin purposes)
export const makeUserPremium = mutation({
  args: { userEmail: v.string() },
  handler: async (ctx, args) => {
    // Check if subscription already exists
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_email", (q) => q.eq("userEmail", args.userEmail))
      .first();

    // 30 days from now (monthly subscription)
    const thirtyDaysFromNow = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);

    if (existing) {
      // Update existing subscription to active
      await ctx.db.patch(existing._id, {
        status: "active",
        currentPeriodEnd: thirtyDaysFromNow,
        cancelAtPeriodEnd: false,
      });
      return { success: true, message: "User updated to premium (30 days)" };
    } else {
      // Create new subscription
      await ctx.db.insert("subscriptions", {
        userEmail: args.userEmail,
        stripeSubscriptionId: "manual_" + Date.now(),
        stripeCustomerId: "manual_" + Date.now(),
        status: "active",
        planName: "NoteAG Pro (Manual)",
        currentPeriodEnd: thirtyDaysFromNow,
        cancelAtPeriodEnd: false,
      });
      return { success: true, message: "User set as premium (30 days)" };
    }
  },
});

// Remove premium status from user
export const removeUserPremium = mutation({
  args: { userEmail: v.string() },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_email", (q) => q.eq("userEmail", args.userEmail))
      .first();

    if (subscription) {
      await ctx.db.delete(subscription._id);
      return { success: true, message: "Premium status removed" };
    }
    
    return { success: false, message: "No subscription found" };
  },
});
