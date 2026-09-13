import { test, expect } from "@playwright/test";

test.describe("Gastropub Table Reservation Journey", () => {
  test("should successfully complete table reservation and display confirmation code", async ({ page }) => {
    await page.goto("/");

    // Verify Hero elements
    await expect(page.locator("h1")).toContainText("THE OBSIDIAN");

    // Scroll to reservation section
    await page.locator("text=Reserve a Table").first().click();

    // Fill guest details
    await page.fill('input[placeholder="Jane Doe"]', "Test User");
    await page.fill('input[placeholder="jane@example.com"]', "test.user@example.com");
    await page.fill('input[placeholder="+1 (555) 019-2834"]', "+1 555-9999");

    // Click confirm reservation
    await page.click('button:has-text("Confirm Reservation")');

    // Expect Confirmation screen
    await expect(page.locator("text=Booking Confirmed")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Test User")).toBeVisible();
    await expect(page.locator("text=test.user@example.com")).toBeVisible();
  });
});
