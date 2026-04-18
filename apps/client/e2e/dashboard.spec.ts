import { test, expect } from "@playwright/test";

test.describe("Dashboard (unauthenticated)", () => {
  test("redirects to home when not logged in", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL((url) => !url.pathname.startsWith("/dashboard"), {
      timeout: 5000,
    }).catch(() => {});
    const url = page.url();
    expect(url).not.toContain("/dashboard");
  });

  test("analytics page redirects when not logged in", async ({ page }) => {
    await page.goto("/dashboard/analytics");
    await page.waitForURL((url) => !url.pathname.startsWith("/dashboard"), {
      timeout: 5000,
    }).catch(() => {});
    expect(page.url()).not.toContain("/dashboard/analytics");
  });
});
