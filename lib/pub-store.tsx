"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_MENU_ITEMS } from "@/convex/menuItems";

export interface MenuItem {
  _id: string;
  name: string;
  category: "food" | "cocktail" | "draft-beer";
  price: number;
  isAvailable: boolean;
  description: string;
  allergens: string[];
  imageUrl?: string;
  abv?: string;
  pairing?: string;
}

export interface Reservation {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  date: string;
  timeSlot: string;
  partySize: number;
  specialRequests?: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: number;
}

interface PubContextType {
  menuItems: MenuItem[];
  reservations: Reservation[];
  toggleMenuItem: (id: string) => void;
  addReservation: (data: Omit<Reservation, "_id" | "createdAt" | "status">) => Promise<{ success: boolean; reservationId: string }>;
  updateReservationStatus: (id: string, status: "pending" | "confirmed" | "cancelled") => void;
  getSlotAvailability: (date: string, timeSlot: string) => { bookedGuests: number; remainingSeats: number; maxCapacity: number; isAvailable: boolean };
}

const PubContext = createContext<PubContextType | undefined>(undefined);

const STORAGE_MENU_KEY = "xpub_menu_items_v1";
const STORAGE_RESERVATIONS_KEY = "xpub_reservations_v1";
const SYNC_EVENT_NAME = "xpub_state_sync";

export const PubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize data
  useEffect(() => {
    try {
      const savedMenu = localStorage.getItem(STORAGE_MENU_KEY);
      if (savedMenu) {
        setMenuItems(JSON.parse(savedMenu));
      } else {
        const initial = INITIAL_MENU_ITEMS.map((item, index) => ({
          ...item,
          _id: `menu_${index + 1}`,
        }));
        setMenuItems(initial);
        localStorage.setItem(STORAGE_MENU_KEY, JSON.stringify(initial));
      }

      const savedRes = localStorage.getItem(STORAGE_RESERVATIONS_KEY);
      if (savedRes) {
        setReservations(JSON.parse(savedRes));
      } else {
        const initialRes: Reservation[] = [
          {
            _id: "res_1",
            fullName: "Alexander Wright",
            email: "alex.wright@example.com",
            phone: "+1 555-0192",
            date: new Date().toISOString().split("T")[0],
            timeSlot: "19:00",
            partySize: 4,
            specialRequests: "Window table preferred",
            status: "confirmed",
            createdAt: Date.now() - 3600000,
          },
          {
            _id: "res_2",
            fullName: "Sophia Martinez",
            email: "sophia.m@example.com",
            phone: "+1 555-0148",
            date: new Date().toISOString().split("T")[0],
            timeSlot: "20:00",
            partySize: 2,
            specialRequests: "Anniversary celebration",
            status: "confirmed",
            createdAt: Date.now() - 7200000,
          }
        ];
        setReservations(initialRes);
        localStorage.setItem(STORAGE_RESERVATIONS_KEY, JSON.stringify(initialRes));
      }
    } catch (e) {
      console.warn("Storage access failed, using memory state", e);
    }
    setIsLoaded(true);
  }, []);

  // Broadcast state changes across tabs in real-time
  const broadcastSync = () => {
    try {
      window.dispatchEvent(new Event(SYNC_EVENT_NAME));
    } catch (_) {}
  };

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedMenu = localStorage.getItem(STORAGE_MENU_KEY);
        if (savedMenu) setMenuItems(JSON.parse(savedMenu));
        const savedRes = localStorage.getItem(STORAGE_RESERVATIONS_KEY);
        if (savedRes) setReservations(JSON.parse(savedRes));
      } catch (_) {}
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(SYNC_EVENT_NAME, handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(SYNC_EVENT_NAME, handleStorageChange);
    };
  }, []);

  const toggleMenuItem = (id: string) => {
    setMenuItems((prev) => {
      const updated = prev.map((item) =>
        item._id === id ? { ...item, isAvailable: !item.isAvailable } : item
      );
      try {
        localStorage.setItem(STORAGE_MENU_KEY, JSON.stringify(updated));
        broadcastSync();
      } catch (_) {}
      return updated;
    });
  };

  const getSlotAvailability = (date: string, timeSlot: string) => {
    const MAX_CAPACITY = 20;
    const slotBookings = reservations.filter(
      (r) => r.date === date && r.timeSlot === timeSlot && r.status !== "cancelled"
    );
    const bookedGuests = slotBookings.reduce((sum, r) => sum + r.partySize, 0);
    const remainingSeats = Math.max(0, MAX_CAPACITY - bookedGuests);
    return {
      bookedGuests,
      remainingSeats,
      maxCapacity: MAX_CAPACITY,
      isAvailable: remainingSeats > 0,
    };
  };

  const addReservation = async (
    data: Omit<Reservation, "_id" | "createdAt" | "status">
  ) => {
    const availability = getSlotAvailability(data.date, data.timeSlot);
    if (availability.bookedGuests + data.partySize > availability.maxCapacity) {
      throw new Error(
        `Capacity exceeded for ${data.timeSlot} on ${data.date}. Only ${availability.remainingSeats} seat(s) remaining.`
      );
    }

    const newReservation: Reservation = {
      ...data,
      _id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: "confirmed",
      createdAt: Date.now(),
    };

    setReservations((prev) => {
      const updated = [newReservation, ...prev];
      try {
        localStorage.setItem(STORAGE_RESERVATIONS_KEY, JSON.stringify(updated));
        broadcastSync();
      } catch (_) {}
      return updated;
    });

    return { success: true, reservationId: newReservation._id };
  };

  const updateReservationStatus = (id: string, status: "pending" | "confirmed" | "cancelled") => {
    setReservations((prev) => {
      const updated = prev.map((r) => (r._id === id ? { ...r, status } : r));
      try {
        localStorage.setItem(STORAGE_RESERVATIONS_KEY, JSON.stringify(updated));
        broadcastSync();
      } catch (_) {}
      return updated;
    });
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <PubContext.Provider
      value={{
        menuItems,
        reservations,
        toggleMenuItem,
        addReservation,
        updateReservationStatus,
        getSlotAvailability,
      }}
    >
      {children}
    </PubContext.Provider>
  );
};

export const usePub = () => {
  const context = useContext(PubContext);
  if (!context) {
    throw new Error("usePub must be used within a PubProvider");
  }
  return context;
};
