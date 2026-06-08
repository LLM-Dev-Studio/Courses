import { expect, test } from "@playwright/test";

test("root and catalog navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "AI Learning Hub" })).toBeVisible();

  await page.getByRole("link", { name: "Course Catalog" }).click();
  await expect(page).toHaveURL(/\/courses$/);
  await expect(page.getByRole("heading", { name: "Available Courses" })).toBeVisible();

  await page.getByRole("link", { name: "Home" }).click();
  await expect(page).toHaveURL(/\/$/);
});
