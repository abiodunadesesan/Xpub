"use client";

import React, { useState } from "react";
import { usePub } from "@/lib/pub-store";
import { sendReservationConfirmation } from "@/app/actions/send-confirmation";
import { Calendar as CalendarIcon, Clock, Users, User, Mail, Phone, MessageSquare, CheckCircle, AlertTriangle, Sparkles, ShieldCheck } from "lucide-react";
import { trackEvent } from "./analytics-provider";

export const ReservationSystem: React.FC = () => {
  const { addReservation, getSlotAvailability } = usePub();

  const todayStr = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState<string>(todayStr);
  const [timeSlot, setTimeSlot] = useState<string>("19:00");
  const [partySize, setPartySize] = useState<number>(4);

  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [specialRequests, setSpecialRequests] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    reservationId: string;
    fullName: string;
    email: string;
    date: string;
    timeSlot: string;
    partySize: number;
  } | null>(null);

  const availableSlots = ["17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName || !email || !phone) {
      setErrorMsg("Please fill out all required guest fields.");
      return;
    }

    setIsSubmitting(true);
    trackEvent("submit_reservation_attempt", { date, timeSlot, partySize });

    try {
      const res = await addReservation({
        fullName,
        email,
        phone,
        date,
        timeSlot,
        partySize,
        specialRequests,
      });

      if (res.success) {
        const bookingDetails = {
          reservationId: res.reservationId,
          fullName,
          email,
          date,
          timeSlot,
          partySize,
        };

        // Fire Resend server action
        sendReservationConfirmation(bookingDetails);
        trackEvent("reservation_confirmed", { reservationId: res.reservationId });

        setConfirmedBooking(bookingDetails);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to place reservation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const slotAvailability = getSlotAvailability(date, timeSlot);

  return (
    <section id="reservation-section" className="py-20 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-pub-amber/10 border border-pub-amber/30 text-pub-yellow text-xs font-mono uppercase tracking-wider mb-4">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Transactional Capacity Engine</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-sans">
          RESERVE A <span className="text-pub-yellow">TABLE</span>
        </h2>
        <p className="mt-3 text-zinc-400 max-w-lg mx-auto text-base">
          Guaranteed table availability with real-time seat lock verification. Instant confirmation email dispatched via Resend.
        </p>
      </div>

      {confirmedBooking ? (
        /* Confirmation Screen */
        <div className="bg-pub-card border border-pub-gold/50 rounded-3xl p-8 sm:p-12 text-center shadow-2xl shadow-pub-yellow/10 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-pub-yellow/10 border border-pub-yellow/40 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-pub-yellow" />
          </div>
          <span className="text-xs uppercase font-mono tracking-widest text-pub-yellow font-bold">Booking Confirmed</span>
          <h3 className="text-3xl font-extrabold text-white mt-1 mb-2">We've Saved Your Table!</h3>
          <p className="text-zinc-400 text-sm mb-8">
            A confirmation receipt has been dispatched to <span className="text-white font-medium">{confirmedBooking.email}</span>.
          </p>

          <div className="bg-pub-surface border border-zinc-800 rounded-2xl p-6 mb-8 text-left space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <span className="text-xs text-zinc-400 uppercase font-mono">Reference Code</span>
              <span className="text-sm font-mono font-bold text-pub-yellow">{confirmedBooking.reservationId.toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Guest Name:</span>
              <span className="text-sm font-semibold text-white">{confirmedBooking.fullName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Date & Time:</span>
              <span className="text-sm font-semibold text-white">{confirmedBooking.date} @ {confirmedBooking.timeSlot}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Party Count:</span>
              <span className="text-sm font-semibold text-pub-yellow">{confirmedBooking.partySize} Guests</span>
            </div>
          </div>

          <button
            onClick={() => {
              setConfirmedBooking(null);
              setFullName("");
              setEmail("");
              setPhone("");
              setSpecialRequests("");
            }}
            className="px-8 py-3.5 rounded-xl bg-pub-yellow text-zinc-950 font-bold text-sm hover:bg-pub-gold transition-all"
          >
            Make Another Reservation
          </button>
        </div>
      ) : (
        /* Reservation Form */
        <div className="bg-pub-card border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-sm flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Step 1: Booking Details */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-pub-yellow text-zinc-950 flex items-center justify-center text-xs font-bold">1</span>
                <span>Select Booking Window</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Date Picker */}
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Reservation Date</label>
                  <div className="relative">
                    <CalendarIcon className="w-4 h-4 text-pub-yellow absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      min={todayStr}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 focus:border-pub-yellow rounded-xl pl-10 pr-3 py-3 text-white text-sm focus:outline-none"
                    />
                  </div>
                </div>

                {/* Party Size */}
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Party Size</label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-pub-yellow absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={partySize}
                      onChange={(e) => setPartySize(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-700 focus:border-pub-yellow rounded-xl pl-10 pr-3 py-3 text-white text-sm focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "Guest" : "Guests"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Live Slot Capacity Status */}
                <div className="flex flex-col justify-end">
                  <div className="p-3 rounded-xl bg-pub-surface border border-zinc-800 text-xs">
                    <div className="text-zinc-400">Slot Availability:</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-bold text-white">{date} @ {timeSlot}</span>
                      <span className={`px-2 py-0.5 rounded font-mono font-bold ${slotAvailability.remainingSeats > 5 ? "bg-emerald-950 text-emerald-400" : slotAvailability.remainingSeats > 0 ? "bg-amber-950 text-amber-400" : "bg-red-950 text-red-400"}`}>
                        {slotAvailability.remainingSeats > 0 ? `${slotAvailability.remainingSeats} Seats Left` : "Fully Booked"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Slots Grid */}
              <div className="mt-6">
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-3">Available Arrival Times (24h)</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {availableSlots.map((slot) => {
                    const slotInfo = getSlotAvailability(date, slot);
                    const isSelected = timeSlot === slot;
                    const isFull = slotInfo.remainingSeats < partySize;

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isFull}
                        onClick={() => setTimeSlot(slot)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isFull
                            ? "bg-zinc-950 border-zinc-900 text-zinc-600 opacity-50 cursor-not-allowed"
                            : isSelected
                            ? "bg-pub-yellow text-zinc-950 border-pub-yellow font-bold shadow-lg shadow-pub-yellow/20"
                            : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-pub-gold/50"
                        }`}
                      >
                        <div className="text-sm font-semibold">{slot}</div>
                        <div className="text-[10px] opacity-80 mt-0.5">
                          {isFull ? "Full" : `${slotInfo.remainingSeats} left`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 2: Guest Details */}
            <div className="pt-6 border-t border-zinc-800">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-pub-yellow text-zinc-950 flex items-center justify-center text-xs font-bold">2</span>
                <span>Guest Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 focus:border-pub-yellow rounded-xl pl-10 pr-3 py-3 text-white text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 focus:border-pub-yellow rounded-xl pl-10 pr-3 py-3 text-white text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Phone Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 019-2834"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 focus:border-pub-yellow rounded-xl pl-10 pr-3 py-3 text-white text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Special Requests (Optional)</label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <textarea
                    rows={2}
                    placeholder="High chair needed, booth preference, dietary preferences..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 focus:border-pub-yellow rounded-xl pl-10 pr-3 py-2.5 text-white text-sm focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || slotAvailability.remainingSeats < partySize}
                className="w-full sm:w-auto px-10 py-4 rounded-xl bg-gradient-to-r from-pub-yellow to-pub-amber text-zinc-950 font-extrabold text-base shadow-xl shadow-pub-yellow/10 hover:shadow-pub-yellow/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Verifying Capacity & Booking...</span>
                  </span>
                ) : (
                  <span>Confirm Reservation ({partySize} Guests)</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};
