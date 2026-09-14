import { AdminInventoryToggle } from "@/components/admin-inventory-toggle";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Inventory & Bookings | The Obsidian XPub",
  description: "Real-time stock management and table reservation dashboard.",
};

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-pub-dark text-white pt-10 pb-24">
      <AdminInventoryToggle />
    </main>
  );
}
