import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const INITIAL_MENU_ITEMS = [
  {
    name: "Smoked Wagyu Smash Burger",
    category: "food" as const,
    price: 19.5,
    isAvailable: true,
    description: "Double 45-day dry-aged wagyu beef patties, smoked cheddar, bacon jam, pickled jalapeno, truffle aioli on toasted brioche.",
    allergens: ["Gluten", "Dairy", "Egg"],
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600",
    pairing: "Pairs with Obsidian Stout or Hazy IPA",
  },
  {
    name: "Truffle & Duck Fat Fries",
    category: "food" as const,
    price: 11.0,
    isAvailable: true,
    description: "Hand-cut triple-cooked potatoes tossed in duck fat, white truffle oil, shaved 24-month parmesan, and fresh rosemary.",
    allergens: ["Dairy"],
    imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=600",
    pairing: "Pairs with Crisp Pilsner",
  },
  {
    name: "Wild Mushroom & Bone Marrow Risotto",
    category: "food" as const,
    price: 24.0,
    isAvailable: true,
    description: "Acquerello carnaroli rice, roasted chanterelles, roasted bone marrow butter, aged pecorino romano, crispy sage.",
    allergens: ["Dairy"],
    imageUrl: "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&q=80&w=600",
    pairing: "Pairs with Smoked Porter or Aged Pinot Noir",
  },
  {
    name: "Crispy Korean Pork Belly Bites",
    category: "food" as const,
    price: 14.5,
    isAvailable: true,
    description: "Slow-braised Heritage pork belly glazed in gochujang, toasted sesame seeds, crushed peanuts, pickled cucumber.",
    allergens: ["Nuts", "Sesame", "Soy"],
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600",
    pairing: "Pairs with Double Dry-Hopped IPA",
  },
  {
    name: "Wood-Fired Octopus & Chorizo",
    category: "food" as const,
    price: 22.0,
    isAvailable: false,
    description: "Charred Spanish octopus, crispy Iberico chorizo crumble, saffron potato mousse, smoked paprika oil.",
    allergens: ["Shellfish"],
    imageUrl: "https://images.unsplash.com/photo-1535400255456-984241443b29?auto=format&fit=crop&q=80&w=600",
    pairing: "Pairs with Session Pale Ale or Dry Cider",
  },

  // DRAFT BEERS
  {
    name: "Obsidian Velvet Imperial Stout",
    category: "draft-beer" as const,
    price: 9.5,
    isAvailable: true,
    description: "Rich black imperial stout with notes of dark chocolate, Madagascar vanilla bean, and espresso. 10.5% ABV.",
    allergens: ["Gluten"],
    abv: "10.5%",
    imageUrl: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&q=80&w=600",
    pairing: "Pairs with Smoked Wagyu Burger",
  },
  {
    name: "Neon Citrus Double Hazy IPA",
    category: "draft-beer" as const,
    price: 8.5,
    isAvailable: true,
    description: "Unfiltered double IPA bursting with Citra, Mosaic, and Galaxy hops. Juicy notes of mango, passionfruit, and pink grapefruit. 8.2% ABV.",
    allergens: ["Gluten"],
    abv: "8.2%",
    imageUrl: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=600",
    pairing: "Pairs with Korean Pork Belly Bites",
  },
  {
    name: "Hyperion Crisp German Pilsner",
    category: "draft-beer" as const,
    price: 7.0,
    isAvailable: true,
    description: "Traditional cold-conditioned Bavarian lager. Ultra-crisp finish with Noble hop bitterness and bready malt profile. 4.9% ABV.",
    allergens: ["Gluten"],
    abv: "4.9%",
    imageUrl: "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?auto=format&fit=crop&q=80&w=600",
    pairing: "Pairs with Truffle Fries",
  },
  {
    name: "Wild Orchard Heirloom Dry Cider",
    category: "draft-beer" as const,
    price: 8.0,
    isAvailable: true,
    description: "Naturally fermented from local organic Kingston Black apples. Bone dry, tart tannins, sparkling finish. Gluten-Free. 6.5% ABV.",
    allergens: [],
    abv: "6.5%",
    imageUrl: "https://images.unsplash.com/photo-1566633806327-68e1de22112e?auto=format&fit=crop&q=80&w=600",
    pairing: "Pairs with Wood-Fired Octopus",
  },

  // ARTISANAL COCKTAILS
  {
    name: "Smoked Barrel Old Fashioned",
    category: "cocktail" as const,
    price: 16.0,
    isAvailable: true,
    description: "Small-batch Kentucky bourbon, smoked hickory wood chips, Demerara sugar syrup, Angostura & orange bitters, torched orange peel.",
    allergens: [],
    abv: "28%",
    imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=600",
    pairing: "Pairs with Wagyu Smash Burger or Chocolate Tart",
  },
  {
    name: "Yuzu & Rosemary Botanical Sour",
    category: "cocktail" as const,
    price: 15.0,
    isAvailable: true,
    description: "Japanese craft gin, fresh Japanese yuzu juice, homemade rosemary honey syrup, aquafaba foam, charred rosemary sprig.",
    allergens: [],
    abv: "18%",
    imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=600",
    pairing: "Pairs with Wild Mushroom Risotto",
  },
  {
    name: "Blackberry Velvet Espresso Martini",
    category: "cocktail" as const,
    price: 16.5,
    isAvailable: true,
    description: "Single-origin espresso, artisanal vodka, Mr Black coffee liqueur, wild blackberry syrup, grated dark cacao.",
    allergens: [],
    abv: "20%",
    imageUrl: "https://images.unsplash.com/photo-1545438102-799c3991ffb2?auto=format&fit=crop&q=80&w=600",
    pairing: "Dessert cocktail",
  }
];

export const list = query({
  args: {},
  handler: async (ctx: any) => {
    return await ctx.db.query("menuItems").collect();
  },
});

export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx: any, args: { category: string }) => {
    return await ctx.db
      .query("menuItems")
      .filter((q: any) => q.eq(q.field("category"), args.category))
      .collect();
  },
});

export const toggleAvailability = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx: any, args: { id: any }) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Menu item not found");
    await ctx.db.patch(args.id, {
      isAvailable: !item.isAvailable,
    });
    return !item.isAvailable;
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx: any) => {
    const existing = await ctx.db.query("menuItems").first();
    if (!existing) {
      for (const item of INITIAL_MENU_ITEMS) {
        await ctx.db.insert("menuItems", item);
      }
      return { success: true, count: INITIAL_MENU_ITEMS.length };
    }
    return { success: true, count: 0, message: "Already seeded" };
  },
});
