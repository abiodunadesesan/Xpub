import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const MAX_CAPACITY_PER_SLOT = 20;

export const checkAvailability = query({
  args: {
    date: v.string(),
    timeSlot: v.string(),
  },
  handler: async (ctx: any, args: { date: string; timeSlot: string }) => {
    const existingReservations = await ctx.db
      .query("reservations")
      .withIndex("by_date_time", (q: any) =>
        q.eq("date", args.date).eq("timeSlot", args.timeSlot)
      )
      .filter((q: any) => q.neq(q.field("status"), "cancelled"))
      .collect();

    const bookedGuests = existingReservations.reduce(
      (sum: number, r: any) => sum + r.partySize,
      0
    );

    const remainingSeats = Math.max(0, MAX_CAPACITY_PER_SLOT - bookedGuests);

    return {
      date: args.date,
      timeSlot: args.timeSlot,
      bookedGuests,
      remainingSeats,
      maxCapacity: MAX_CAPACITY_PER_SLOT,
      isAvailable: remainingSeats > 0,
    };
  },
});

export const createReservation = mutation({
  args: {
    fullName: v.string(),
    email: v.string(),
    phone: v.string(),
    date: v.string(),
    timeSlot: v.string(),
    partySize: v.number(),
    specialRequests: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    if (args.partySize < 1 || args.partySize > 12) {
      throw new Error("Party size must be between 1 and 12 guests.");
    }

    const existingReservations = await ctx.db
      .query("reservations")
      .withIndex("by_date_time", (q: any) =>
        q.eq("date", args.date).eq("timeSlot", args.timeSlot)
      )
      .filter((q: any) => q.neq(q.field("status"), "cancelled"))
      .collect();

    const bookedGuests = existingReservations.reduce(
      (sum: number, r: any) => sum + r.partySize,
      0
    );

    if (bookedGuests + args.partySize > MAX_CAPACITY_PER_SLOT) {
      const available = MAX_CAPACITY_PER_SLOT - bookedGuests;
      throw new Error(
        `Capacity exceeded for ${args.timeSlot} on ${args.date}. Only ${available} seat(s) left.`
      );
    }

    const reservationId = await ctx.db.insert("reservations", {
      fullName: args.fullName,
      email: args.email,
      phone: args.phone,
      date: args.date,
      timeSlot: args.timeSlot,
      partySize: args.partySize,
      specialRequests: args.specialRequests,
      status: "confirmed",
      createdAt: Date.now(),
    });

    return {
      success: true,
      reservationId,
      details: {
        fullName: args.fullName,
        email: args.email,
        date: args.date,
        timeSlot: args.timeSlot,
        partySize: args.partySize,
      },
    };
  },
});

export const list = query({
  args: {},
  handler: async (ctx: any) => {
    return await ctx.db
      .query("reservations")
      .order("desc")
      .collect();
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("reservations"),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled")),
  },
  handler: async (ctx: any, args: { id: any; status: any }) => {
    await ctx.db.patch(args.id, { status: args.status });
    return { success: true };
  },
});
