import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("loads and shows main content", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/DevScan|devscan/i);
  });

  test("has a link to pricing page", async ({ page }) => {
    await page.goto("/");
    const pricingLink = page.getByRole("link", { name: /pricing/i });
    await expect(pricingLink).toBeVisible();
  });
});
