import { NextResponse } from "next/server";
import { INITIAL_MENU_ITEMS } from "@/convex/menuItems";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastUserMessage = messages[messages.length - 1]?.content || "";

    // Build context of currently available menu items
    const availableBeers = INITIAL_MENU_ITEMS
      .filter((i) => i.category === "draft-beer" && i.isAvailable)
      .map((b) => `${b.name} (${b.abv}) - ${b.description}. Pairing: ${b.pairing}`)
      .join("\n");

    const availableFood = INITIAL_MENU_ITEMS
      .filter((i) => i.category === "food" && i.isAvailable)
      .map((f) => `${f.name} ($${f.price.toFixed(2)}) - ${f.description}. Allergens: ${f.allergens.join(", ")}`)
      .join("\n");

    const availableCocktails = INITIAL_MENU_ITEMS
      .filter((i) => i.category === "cocktail" && i.isAvailable)
      .map((c) => `${c.name} (${c.abv}) - ${c.description}`)
      .join("\n");

    const systemPrompt = `You are the Master Sommelier & Cicerone at The Obsidian XPub, a luxury dark-themed modern gastropub.
Your job is to provide recommendations for food, craft draft beer, and artisanal cocktail pairings, explain allergens, and assist guests with reservation questions.
Always keep a warm, refined, knowledgeable, and engaging tone.

CURRENT LIVE ON-TAP CRAFT BEERS:
${availableBeers}

CURRENT GASTROPUB FOOD MENU:
${availableFood}

ARTISANAL COCKTAILS:
${availableCocktails}

Provide concise, enticing answers grounded ONLY in our active menu options.`;

    const openAiApiKey = process.env.OPENAI_API_KEY;

    if (openAiApiKey) {
      // Call OpenAI / Vercel AI SDK API if configured
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.choices[0]?.message?.content || "I recommend trying our Neon Citrus Double Hazy IPA with the Korean Pork Belly Bites!";
        return NextResponse.json({ message: reply });
      }
    }

    // Intelligent Sommelier Fallback Engine grounded in live menu context
    let reply = "";
    const query = lastUserMessage.toLowerCase();

    if (query.includes("beer") || query.includes("tap") || query.includes("ipa") || query.includes("stout") || query.includes("pilsner") || query.includes("cider")) {
      reply = "🍻 **On Tap Right Now:** I highly recommend our **Neon Citrus Double Hazy IPA (8.2% ABV)** for a juicy tropical hop profile, or our decadent **Obsidian Velvet Imperial Stout (10.5% ABV)** with notes of dark chocolate and vanilla. If you prefer crisp and clean, our **Hyperion German Pilsner (4.9% ABV)** is cold-conditioned to perfection!";
    } else if (query.includes("burger") || query.includes("wagyu") || query.includes("meat")) {
      reply = "🍔 **Sommelier Pairing Choice:** For the **Smoked Wagyu Smash Burger** ($19.50), nothing compares to our **Obsidian Velvet Imperial Stout**. The roasted malt notes slice through the rich 45-day dry-aged wagyu fat and bacon jam effortlessly!";
    } else if (query.includes("fries") || query.includes("truffle") || query.includes("side")) {
      reply = "🍟 **Side Recommendation:** Our **Truffle & Duck Fat Fries** ($11.00) are hand-cut and triple-cooked. Pair them with a cold glass of **Hyperion German Pilsner** for the ultimate gastropub experience.";
    } else if (query.includes("cocktail") || query.includes("drink") || query.includes("bourbon") || query.includes("gin")) {
      reply = "🍸 **Artisanal Cocktails:** Try our signature **Smoked Barrel Old Fashioned** ($16.00) crafted with small-batch bourbon smoked over hickory chips, or the refreshing **Yuzu & Rosemary Botanical Sour** ($15.00) with Japanese gin and aquafaba foam.";
    } else if (query.includes("gluten") || query.includes("allergen") || query.includes("vegan")) {
      reply = "🌱 **Dietary & Allergen Guide:** Our **Wild Orchard Heirloom Dry Cider** (6.5% ABV) is 100% Gluten-Free on tap. For dining, our **Truffle & Duck Fat Fries** and **Wild Mushroom Risotto** are gluten-free friendly!";
    } else if (query.includes("reserve") || query.includes("book") || query.includes("table")) {
      reply = "📅 **Table Reservations:** You can book directly using our live booking widget on this page! We offer 20 seats per 24h arrival slot (17:00 to 22:00). Instant confirmation is sent via email.";
    } else {
      reply = "Welcome to **The Obsidian XPub**! I'm your digital Sommelier. Are you looking for a draft beer pairing for your meal, cocktail suggestions, or details on our live table availability?";
    }

    return NextResponse.json({ message: reply });
  } catch (error) {
    console.error("AI Sommelier Route Error:", error);
    return NextResponse.json(
      { message: "Apologies, I encountered a temporary network hiccup. How may I assist you with our craft beer & menu selections?" },
      { status: 500 }
    );
  }
}
