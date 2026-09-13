"use client";

import React, { useState } from "react";
import { usePub } from "@/lib/pub-store";
import { ToggleLeft, ToggleRight, Beer, Utensils, Wine, CheckCircle, Clock, XCircle, Search, Sparkles } from "lucide-react";

export const AdminInventoryToggle: React.FC = () => {
  const { menuItems, toggleMenuItem, reservations, updateReservationStatus } = usePub();
  const [activeTab, setActiveTab] = useState<"inventory" | "reservations">("inventory");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredMenuItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-pub-yellow/10 border border-pub-yellow/30 text-pub-yellow text-xs font-mono font-bold uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Manager Portal • WebSocket Real-Time Sync</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">THE OBSIDIAN XPUB ADMIN</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Toggle inventory status or manage table bookings. Changes reflect instantly across all live user viewports.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "inventory"
                ? "bg-pub-yellow text-zinc-950 shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Inventory & Taps ({menuItems.length})
          </button>
          <button
            onClick={() => setActiveTab("reservations")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "reservations"
                ? "bg-pub-yellow text-zinc-950 shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Bookings ({reservations.length})
          </button>
        </div>
      </div>

      {activeTab === "inventory" ? (
        /* Inventory Management */
        <div>
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search draft beer or menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-pub-card border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-pub-yellow"
              />
            </div>
            <div className="text-xs font-mono text-zinc-400">
              In Stock: <span className="text-emerald-400 font-bold">{menuItems.filter((i) => i.isAvailable).length}</span> | Out of Stock: <span className="text-red-400 font-bold">{menuItems.filter((i) => !i.isAvailable).length}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMenuItems.map((item) => (
              <div
                key={item._id}
                className={`p-5 rounded-2xl bg-pub-card border transition-all ${
                  item.isAvailable
                    ? "border-zinc-800"
                    : "border-red-900/50 bg-red-950/10"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-pub-yellow text-[10px] font-mono uppercase font-bold">
                      {item.category}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">{item.name}</h3>
                    <div className="text-xs font-mono text-pub-yellow font-bold mt-0.5">
                      ${item.price.toFixed(2)} {item.abv && `• ${item.abv}`}
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <button
                    onClick={() => toggleMenuItem(item._id)}
                    className="flex flex-col items-center gap-1 group"
                    title="Click to toggle real-time stock availability"
                  >
                    {item.isAvailable ? (
                      <ToggleRight className="w-9 h-9 text-emerald-400 group-hover:scale-110 transition-transform" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-zinc-600 group-hover:scale-110 transition-transform" />
                    )}
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        item.isAvailable ? "text-emerald-400" : "text-zinc-500"
                      }`}
                    >
                      {item.isAvailable ? "IN STOCK" : "TAPPED OUT"}
                    </span>
                  </button>
                </div>

                <p className="text-zinc-400 text-xs mt-3 line-clamp-2">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Reservations Management */
        <div>
          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-pub-card">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-xs font-mono uppercase text-zinc-400 bg-zinc-900/80">
                  <th className="p-4">Guest</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Party Size</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-sm">
                {reservations.map((r) => (
                  <tr key={r._id} className="hover:bg-zinc-900/40">
                    <td className="p-4 font-semibold text-white">
                      {r.fullName}
                      {r.specialRequests && (
                        <div className="text-xs text-pub-yellow font-normal mt-0.5">
                          Note: "{r.specialRequests}"
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-mono text-zinc-300">
                      {r.date} @ {r.timeSlot}
                    </td>
                    <td className="p-4 font-bold text-pub-yellow">{r.partySize} Guests</td>
                    <td className="p-4 text-xs text-zinc-400">
                      <div>{r.email}</div>
                      <div>{r.phone}</div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          r.status === "confirmed"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                            : r.status === "pending"
                            ? "bg-amber-950 text-amber-400 border border-amber-500/30"
                            : "bg-red-950 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {r.status === "confirmed" && <CheckCircle className="w-3.5 h-3.5" />}
                        {r.status === "pending" && <Clock className="w-3.5 h-3.5" />}
                        {r.status === "cancelled" && <XCircle className="w-3.5 h-3.5" />}
                        <span className="capitalize">{r.status}</span>
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {r.status !== "confirmed" && (
                          <button
                            onClick={() => updateReservationStatus(r._id, "confirmed")}
                            className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 hover:bg-emerald-900 text-xs border border-emerald-800"
                          >
                            Confirm
                          </button>
                        )}
                        {r.status !== "cancelled" && (
                          <button
                            onClick={() => updateReservationStatus(r._id, "cancelled")}
                            className="px-2.5 py-1 rounded bg-red-950 text-red-300 hover:bg-red-900 text-xs border border-red-800"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
