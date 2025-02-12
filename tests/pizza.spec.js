import { test, expect } from 'playwright-test-coverage';

test('home page', async ({ page }) => {
  await page.goto('/');
  expect(await page.title()).toBe('JWT Pizza');
});

test('purchase with login', async ({ page }) => {
    await page.route('*/**/api/order/menu', async (route) => {
      const menuRes = [
        { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
        { id: 2, title: 'Pepperoni', image: 'pizza2.png', price: 0.0042, description: 'Spicy treat' },
      ];
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: menuRes });
    });
  
    await page.route('*/**/api/franchise', async (route) => {
      const franchiseRes = [{ id: 2, name: 'LotaPizza', stores: [{ id: 4, name: 'Lehi' }] }];
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: franchiseRes });
    });
  
    await page.route('*/**/api/auth', async (route) => {
      const loginReq = { email: 'd@jwt.com', password: 'a' };
      const loginRes = { user: { id: 3, name: 'Kai Chen', email: 'd@jwt.com', roles: [{ role: 'diner' }] }, token: 'abcdef' };
      expect(route.request().method()).toBe('PUT');
      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });
    });
  
    await page.goto('/');
  
    // Order process
    await page.getByRole('button', { name: 'Order now' }).click();
    await page.getByRole('combobox').selectOption('4');
    await page.getByRole('link', { name: 'Veggie' }).click();
    await page.getByRole('link', { name: 'Pepperoni' }).click();
    await page.getByRole('button', { name: 'Checkout' }).click();
  
    // Login
    await page.getByPlaceholder('Email address').fill('d@jwt.com');
    await page.getByPlaceholder('Password').fill('a');
    await page.getByRole('button', { name: 'Login' }).click();
  
    // Pay
    await page.getByRole('button', { name: 'Pay now' }).click();
  });
  
  test('diner dashboard', async ({ page }) => {
    await page.route('*/**/api/auth', async (route) => {
      const loginReq = { email: 'd@jwt.com', password: 'a' };
      const loginRes = { user: { id: 3, name: 'Kai Chen', email: 'd@jwt.com', roles: [{ role: 'diner' }] }, token: 'abcdef' };
      expect(route.request().method()).toBe('PUT');
      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });
    });
  
    await page.goto('/');
    await page.getByRole('link', { name: 'Login' }).click();
    await expect(page.getByText('Welcome back')).toBeVisible();
    await page.getByPlaceholder('Email address').fill('d@jwt.com');
    await page.getByPlaceholder('Password').fill('a');
    await page.getByRole('button', { name: 'Login' }).click();
    // diner dashboard
    await page.getByRole('link', { name: 'kc' }).click();
    await page.getByText('Kai Chen').click();
    await expect(page.getByRole('heading', { name: 'Your pizza kitchen' })).toBeVisible();
  
    // Verify that user information
    await expect(page.getByText('Kai Chen')).toBeVisible();
    await expect(page.getByText('d@jwt.com')).toBeVisible();
    await expect(page.getByRole('main')).toContainText('role:');
    await expect(page.getByText('How have you lived this long without having a pizza? Buy one now!')).toBeVisible();
  });
  