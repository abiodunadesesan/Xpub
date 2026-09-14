"use client";

import React, { useState } from "react";
import { usePub, MenuItem } from "@/lib/pub-store";
import { Beer, UtensilsCrossed, Wine, Filter, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { trackEvent } from "./analytics-provider";

export const MenuSystem: React.FC = () => {
  const { menuItems } = usePub();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedAllergen, setSelectedAllergen] = useState<string>("all");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState<boolean>(false);

  const categories = [
    { id: "all", label: "Full Gastropub Menu", icon: UtensilsCrossed },
    { id: "draft-beer", label: "Craft Taps", icon: Beer },
    { id: "food", label: "Kitchen Dining", icon: UtensilsCrossed },
    { id: "cocktail", label: "Artisanal Cocktails", icon: Wine },
  ];

  const allergens = ["Gluten", "Dairy", "Nuts", "Sesame", "Soy", "Egg", "Shellfish"];

  const filteredItems = menuItems.filter((item) => {
    if (activeCategory !== "all" && item.category !== activeCategory) return false;
    if (showOnlyAvailable && !item.isAvailable) return false;
    if (selectedAllergen !== "all" && item.allergens.includes(selectedAllergen)) {
      return false; // Filter out items containing selected allergen
    }
    return true;
  });

  return (
    <section id="menu-section" className="py-20 px-4 max-w-7xl mx-auto">
      {/* Schema.org Restaurant Microdata */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Restaurant",
            "name": "The Obsidian XPub",
            "description": "Modern Gastropub featuring real-time craft beer tap sync and dry-aged dining.",
            "servesCuisine": ["Gastropub", "American", "Craft Beer"],
            "hasMenu": {
              "@type": "Menu",
              "name": "Obsidian Live Menu",
              "hasMenuItemGroup": categories.map((cat) => ({
                "@type": "MenuItemGroup",
                "name": cat.label,
              })),
            },
          }),
        }}
      />

      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-pub-gold/10 border border-pub-gold/30 text-pub-yellow text-xs font-mono uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-Time Inventory Synced</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-sans">
          CRAFT TAPS & <span className="text-pub-yellow">GASTRO KITCHEN</span>
        </h2>
        <p className="mt-3 text-zinc-400 max-w-xl mx-auto text-base">
          All items rendered in semantic HTML microdata for search indexers. Tap availability updates live via Convex WebSocket events.
        </p>
      </div>

      {/* Category Tab Selector */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                trackEvent("filter_menu_category", { category: cat.id });
                setActiveCategory(cat.id);
              }}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                isActive
                  ? "bg-pub-yellow text-zinc-950 shadow-lg shadow-pub-yellow/20"
                  : "bg-pub-card text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-zinc-950" : "text-pub-yellow"}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Bar (Allergens & Availability Toggle) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-pub-card/80 border border-zinc-800 mb-10">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-pub-yellow" />
          <span className="text-xs uppercase font-mono text-zinc-400 font-semibold">Exclude Allergen:</span>
          <select
            value={selectedAllergen}
            onChange={(e) => setSelectedAllergen(e.target.value)}
            className="bg-zinc-900 text-white text-xs border border-zinc-700 rounded-lg px-3 py-1.5 focus:border-pub-yellow focus:outline-none"
          >
            <option value="all">None (Show All)</option>
            {allergens.map((a) => (
              <option key={a} value={a}>
                Free of {a}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-300">
            <input
              type="checkbox"
              checked={showOnlyAvailable}
              onChange={(e) => setShowOnlyAvailable(e.target.checked)}
              className="w-4 h-4 accent-pub-yellow bg-zinc-900 border-zinc-700 rounded"
            />
            <span>Show Available Only</span>
          </label>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <MenuItemCard key={item._id} item={item} />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16 bg-pub-card/50 rounded-2xl border border-zinc-800">
          <AlertCircle className="w-10 h-10 text-pub-yellow mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white">No menu items match your filter</h3>
          <p className="text-zinc-400 text-sm mt-1">Try resetting your category or allergen filters above.</p>
        </div>
      )}
    </section>
  );
};

const MenuItemCard: React.FC<{ item: MenuItem }> = ({ item }) => {
  return (
    <div
      itemScope
      itemType="https://schema.org/MenuItem"
      className={`group relative flex flex-col justify-between rounded-2xl bg-pub-card border transition-all duration-300 overflow-hidden ${
        item.isAvailable
          ? "border-zinc-800/80 hover:border-pub-gold/50 hover:shadow-xl hover:shadow-pub-amber/5"
          : "border-zinc-800/40 opacity-60 grayscale-[40%]"
      }`}
    >
      {/* Microdata Metadata */}
      <meta itemProp="name" content={item.name} />
      <meta itemProp="description" content={item.description} />

      {/* Item Header Image */}
      {item.imageUrl && (
        <div className="relative h-48 w-full overflow-hidden bg-zinc-900">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-pub-card via-transparent to-transparent" />

          {/* Availability Status Badge */}
          <div className="absolute top-3 right-3">
            {item.isAvailable ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-semibold backdrop-blur-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>In Stock</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950/90 border border-red-500/40 text-red-400 text-xs font-semibold backdrop-blur-md">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Tapped Out</span>
              </span>
            )}
          </div>

          {/* Category & ABV Badge */}
          <div className="absolute bottom-3 left-3 flex gap-2">
            <span className="px-2.5 py-0.5 rounded bg-pub-gold/90 text-zinc-950 text-[11px] font-bold uppercase">
              {item.category.replace("-", " ")}
            </span>
            {item.abv && (
              <span className="px-2.5 py-0.5 rounded bg-zinc-900/90 text-pub-yellow text-[11px] font-mono font-bold">
                {item.abv}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Item Body */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-2 mb-2">
            <h3 className="text-xl font-bold text-white group-hover:text-pub-yellow transition-colors font-sans">
              {item.name}
            </h3>
            <div itemProp="offers" itemScope itemType="https://schema.org/Offer" className="text-right">
              <meta itemProp="priceCurrency" content="USD" />
              <meta itemProp="price" content={item.price.toFixed(2)} />
              <span className="text-xl font-extrabold text-pub-yellow font-mono">
                ${item.price.toFixed(2)}
              </span>
            </div>
          </div>

          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            {item.description}
          </p>

          {item.pairing && (
            <div className="p-2.5 rounded-lg bg-pub-surface/60 border border-pub-amber/20 mb-4 text-xs text-pub-yellow/90 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-pub-gold shrink-0" />
              <span>{item.pairing}</span>
            </div>
          )}
        </div>

        {/* Item Footer Allergens */}
        {item.allergens.length > 0 && (
          <div className="pt-3 border-t border-zinc-800/60 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono text-zinc-500">Contains:</span>
            {item.allergens.map((allergen) => (
              <span
                key={allergen}
                className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 text-[10px] font-medium border border-zinc-800"
              >
                {allergen}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
