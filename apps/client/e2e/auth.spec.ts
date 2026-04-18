import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("redirects unauthenticated user away from dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    // Should redirect to login or landing page
    await expect(page).not.toHaveURL(/dashboard/);
  });

  test("GitHub login button is visible on landing page", async ({ page }) => {
    await page.goto("/");
    const githubBtn = page.getByRole("link", { name: /github/i });
    await expect(githubBtn).toBeVisible();
  });
});
