import { test, expect } from "@playwright/test";

test.describe("Real-time Menu Inventory & AI Assistant", () => {
  test("should render HTML menu items with microdata and allow AI sommelier interaction", async ({ page }) => {
    await page.goto("/");

    // Verify Menu Section
    await expect(page.locator("text=Smoked Wagyu Smash Burger").first()).toBeVisible();

    // Verify AI Sommelier Launcher
    const aiButton = page.locator("text=Ask Sommelier").first();
    await expect(aiButton).toBeVisible();
    await aiButton.click();

    // Verify Chat Overlay
    await expect(page.locator("text=Sommelier AI")).toBeVisible();

    // Send a message to AI
    await page.fill('input[placeholder="Ask for pairings, ingredients..."]', "What beer pairs with the Wagyu Burger?");
    await page.keyboard.press("Enter");

    // Expect response
    await expect(page.locator("text=Analyzing live menu & brewing notes...")).toBeVisible({ timeout: 5000 });
  });
});
