import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  menuItems: defineTable({
    name: v.string(),
    category: v.union(v.literal("food"), v.literal("cocktail"), v.literal("draft-beer")),
    price: v.number(),
    isAvailable: v.boolean(),
    description: v.string(),
    allergens: v.array(v.string()),
    imageUrl: v.optional(v.string()),
    abv: v.optional(v.string()),
    pairing: v.optional(v.string()),
  }),

  reservations: defineTable({
    fullName: v.string(),
    email: v.string(),
    phone: v.string(),
    date: v.string(), // ISO date format YYYY-MM-DD
    timeSlot: v.string(), // 24h format e.g. "18:00"
    partySize: v.number(),
    specialRequests: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled")),
    createdAt: v.number(),
  }).index("by_date_time", ["date", "timeSlot"]),
});
