import { expect, test } from "@playwright/test";

test("navigue du catalogue filtré à une fiche titre", async ({ page }) => {
  await page.goto("/catalogue");
  await page.getByRole("searchbox", { name: "Recherche" }).fill("Dune");
  await expect(page.getByText("1 titre disponible")).toBeVisible();
  await page.getByRole("link", { name: /Dune : Deuxième partie/ }).click();
  await expect(page).toHaveURL(/\/titre\/dune-deuxieme-partie$/);
  await expect(page.getByRole("heading", { name: /Dune/ })).toBeVisible();
  await expect(page.getByText(/Fiche éditoriale de démonstration/)).toBeVisible();
});

test("présente les parcours principaux depuis l’accueil", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("header.site-header").getByRole("link", { name: "STREAMFLIX" })).toBeVisible();
  await expect(page.getByRole("link", { name: "En direct" })).toHaveAttribute("href", "/direct");
  await expect(page.getByRole("link", { name: "Mon compte" })).toHaveAttribute("href", "/compte");
});