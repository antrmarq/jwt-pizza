import { test, expect } from "playwright-test-coverage";

async function mockApiRoutes(page) {
  await page.route("*/**/api/order/menu", async (route) => {
    await route.fulfill({
      json: [
        { id: 1, title: "Veggie", image: "pizza1.png", price: 0.0038, description: "A garden of delight" },
        { id: 2, title: "Pepperoni", image: "pizza2.png", price: 0.0042, description: "Spicy treat" }
      ]
    });
  });

  await page.route("*/**/api/franchise", async (route) => {
    await route.fulfill({
      json: [
        { id: 2, name: "LotaPizza", stores: [{ id: 4, name: "Lehi" }, { id: 5, name: "Springville" }, { id: 6, name: "American Fork" }] },
        { id: 3, name: "PizzaCorp", stores: [{ id: 7, name: "Spanish Fork" }] },
        { id: 4, name: "topSpot", stores: [] }
      ]
    });
  });
}

async function mockLogin(page) {
  await page.route("*/**/api/auth", async (route) => {
    if (route.request().method() === "PUT") {
      expect(route.request().postDataJSON()).toMatchObject({ email: "d@jwt.com", password: "a" });
      await route.fulfill({
        json: {
          user: { id: 3, name: "Kai Chen", email: "d@jwt.com", roles: [{ role: "diner" }] },
          token: "abcdef"
        }
      });
    }
  });
}

async function mockOrder(page) {
  await page.route("*/**/api/order", async (route) => {
    if (route.request().method() === "POST") {
      expect(route.request().postDataJSON()).toMatchObject({
        items: [
          { menuId: 1, description: "Veggie", price: 0.0038 },
          { menuId: 2, description: "Pepperoni", price: 0.0042 }
        ],
        storeId: "4",
        franchiseId: 2
      });
      await route.fulfill({
        json: {
          order: {
            id: 23,
            items: [
              { menuId: 1, description: "Veggie", price: 0.0038 },
              { menuId: 2, description: "Pepperoni", price: 0.0042 }
            ],
            storeId: "4",
            franchiseId: 2
          },
          jwt: "eyJpYXQ"
        }
      });
    }
  });
}

test("home page", async ({ page }) => {
  await page.goto("/");
  expect(await page.title()).toBe("JWT Pizza");
});

test("purchase with login", async ({ page }) => {
  await mockApiRoutes(page);
  await mockLogin(page);
  await mockOrder(page);

  await page.goto("/");
  await page.getByRole("button", { name: "Order now" }).click();
  await expect(page.locator("h2")).toContainText("Awesome is a click away");
  await page.getByRole("combobox").selectOption("4");
  await page.getByRole("link", { name: "Image Description Veggie" }).click();
  await page.getByRole("link", { name: "Image Description Pepperoni" }).click();
  await expect(page.locator("form")).toContainText("Selected pizzas: 2");
  await page.getByRole("button", { name: "Checkout" }).click();

  await page.getByPlaceholder("Email address").fill("d@jwt.com");
  await page.getByPlaceholder("Password").fill("a");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByRole("main")).toContainText("Send me those 2 pizzas right now!");
  await expect(page.locator("tbody")).toContainText("Veggie");
  await expect(page.locator("tbody")).toContainText("Pepperoni");
  await expect(page.locator("tfoot")).toContainText("0.008 ₿");
  await page.getByRole("button", { name: "Pay now" }).click();

  await expect(page.getByText("0.008")).toBeVisible();
});

test("create franchise", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("a@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).fill("admin");
  await page.getByRole("button", { name: "Login" }).click();

  await page.getByRole("link", { name: "Admin" }).click();
  await page.getByRole("button", { name: "Add Franchise" }).click();
  await page.getByRole("textbox", { name: "franchise name" }).fill("Funky Town");
  await page.getByRole("textbox", { name: "franchisee admin email" }).fill("bob@email.com");
  await page.getByRole("button", { name: "Create" }).click();
});

test("register and logout", async ({ page }) => {
  await page.route("*/**/api/auth", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        json: { user: { id: 5, name: "joe fullmer", email: "jf@m.com", roles: [{ role: "diner" }] }, token: "qwertyu" }
      });
    } else if (route.request().method() === "DELETE") {
      await route.fulfill({ json: { message: "logout successful" } });
    }
  });

  await page.goto("/");
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByRole("textbox", { name: "Full name" }).fill("joe fullmer");
  await page.getByRole("textbox", { name: "Email address" }).fill("jf@m.com");
  await page.getByRole("textbox", { name: "Password" }).fill("ilikedk");
  await page.getByRole("button", { name: "Register" }).click();
  await page.getByRole("link", { name: "Logout" }).click();
});
