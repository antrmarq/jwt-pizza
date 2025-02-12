import { test, expect } from 'playwright-test-coverage';


test('home page', async ({page}) => {
    await page.goto('/');

    await expect(await page.title()).toBe('JWT Pizza');
    await expect(page.getByRole('list')).toContainText('home');
    await expect(page.getByRole('main')).toContainText('Pizza is an absolute delight that brings joy to people of all ages. The perfect combination of crispy crust, savory sauce, and gooey cheese makes pizza an irresistible treat. At JWT Pizza, we take pride in serving the web\'s best pizza, crafted with love and passion. Our skilled chefs use only the finest ingredients to create mouthwatering pizzas that will leave you craving for more. Whether you prefer classic flavors or adventurous toppings, our diverse menu has something for everyone. So why wait? Indulge in the pizza experience of a lifetime and visit JWT Pizza today!');
    await expect(page.getByRole('contentinfo')).toContainText('FranchiseAboutHistory');
    await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Franchise' })).toBeVisible();
  
    await page.getByRole('contentinfo').getByRole('link', { name: 'Franchise' }).click();
    await page.getByRole('link', { name: 'home' }).click();
    await expect(page.getByText('The web\'s best pizza', { exact: true })).toBeVisible();
  
    await page.getByRole('button', { name: 'Order now' }).click();
    await expect(page.getByText('Awesome is a click away')).toBeVisible();
  });

test('register', async ({ page }) => {
    await page.route('*/**/api/auth', async (route) => {
        const loginReq = { email: 'k@jwt.com', password: '123' };
        const loginRes = { user: { id: 3, name: 'kenseyT', email: 'k@jwt.com', roles: [{ role: 'diner' }] }, token: 'abcdef' };
        expect(route.request().method()).toBe('POST');
        expect(route.request().postDataJSON()).toMatchObject(loginReq);
        await route.fulfill({ json: loginRes });
    });
    await page.goto('/');
    await page.getByRole('link', { name: 'Register', exact: true }).click();
    await page.getByRole('textbox', { name: 'Full name' }).click();
    await page.getByRole('textbox', { name: 'Full name' }).fill('kenseyT');
    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('k@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('123');
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page.getByText('The web\'s best pizza', { exact: true })).toBeVisible();
    await expect(page.locator('.w-screen')).toBeVisible();
    });

test('admin page', async ({ page }) => {
    await page.route('*/**/api/auth', async (route) => {
        const loginReq = { email: 'k@jwt.com', password: '123' };
        const loginRes = { user: { id: 3, name: 'kenseyT', email: 'k@jwt.com', roles: [{ role: 'admin' }] }, token: 'abcdef' };
        expect(route.request().method()).toBe('PUT');
        expect(route.request().postDataJSON()).toMatchObject(loginReq);
        await route.fulfill({ json: loginRes });
    });
    
    await page.goto('/');
    // Login
    await page.getByRole('link', { name: 'Login' }).click();
    await expect(page.getByText('Welcome back')).toBeVisible();
    await page.getByRole('textbox', { name: 'Email address' }).fill('k@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('heading', { name: /The web's best pizza/ })).toBeVisible();
    await page.getByRole('link', { name: 'Admin' }).click();
    await expect(page.getByText('Mama Ricci\'s kitchen')).toBeVisible();
    await expect(page.getByText('Keep the dough rolling and the franchises signing up.')).toBeVisible();
    await expect(page.locator('thead')).toContainText('Franchise');
});

test('create a new franchise', async ({ page }) => {
    //the POST request 
    await page.route('**/api/franchise', async (route) => {
      if (route.request().method() === 'POST') {
        const postData = route.request().postDataJSON();
        expect(postData).toMatchObject({
          name: 'pizzaPocket',
          admins: [{ email: 'f@jwt.com' }],
        });
        await route.fulfill({
          json: {
            name: 'pizzaPocket',
            admins: [
              { email: 'f@jwt.com', id: 4, name: 'pizza franchisee' }
            ],
            id: 1
          }
        });
      } else {
        await route.continue();
      }
    });
  
    // create a franchise
    await page.goto('/create-franchise');
    await expect(page.getByRole('heading', { name: 'Create franchise' })).toBeVisible();
    await page.getByPlaceholder('franchise name').fill('pizzaPocket');
    await page.getByPlaceholder('franchisee admin email').fill('f@jwt.com');
    await page.getByRole('button', { name: 'Create' }).click();
  
});

test('franchise store management', async ({ page }) => {
    // login franchise
    await page.route('**/api/auth', async (route) => {
      const loginReq = { email: 'f@jwt.com', password: 'franchisee' };
      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      const loginRes = {
        user: { id: 1, name: 'Franchise User', email: 'f@jwt.com', roles: [{ role: 'franchise' }] },
        token: 'fake-token'
      };
      await route.fulfill({ json: loginRes });
    });
  
    // mock franchise data
    await page.route('**/api/franchise/*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          json: [
            { id: 1, name: 'pizzaPocket', stores: [{ id: 100, name: 'Existing Store' }] }
          ]
        });
      }else if (route.request().method() === 'POST') {
        const postData = route.request().postDataJSON();
        expect(postData).toMatchObject({ name: 'kenz', franchiseId: 1 });
        await route.fulfill({ json: { id: 101, name: 'kenz' } });
      }
    });
  
    await page.goto('/');
    // Login
    await page.getByRole('link', { name: 'Login' }).click();
    await expect(page.getByText('Welcome back')).toBeVisible();
    await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('franchisee');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('heading', { name: /The web's best pizza/ })).toBeVisible();
  
    // franchise list and make franchise
    await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
    await expect(page.getByText('pizzaPocket')).toBeVisible();
    await page.getByRole('button', { name: 'Create store' }).click();
    await page.getByRole('textbox', { name: 'store name' }).click();
    await page.getByRole('textbox', { name: 'store name' }).fill('kenz');
    await page.getByRole('button', { name: 'Create' }).click();
});
  

test('history page', async ({page}) => {
    await page.goto('/history');
    await expect(page.getByText('Mama Rucci, my my')).toBeVisible();
    await expect(page.getByText('It all started in Mama Ricci\'')).toBeVisible();
    await expect(page.getByRole('main').getByRole('img')).toBeVisible();
    await expect(page.getByText('FranchiseAboutHistory')).toBeVisible();
});

test('franchise public', async ({page}) => {
    await page.goto('/franchise-dashboard');
    await expect(page.getByText('So you want a piece of the pie?')).toBeVisible();
});

test('menu page', async ({page}) => {
    await page.goto('/menu');
    await expect(page.getByText('Awesome is a click away')).toBeVisible();
    await expect(page.getByText('Pick your store and pizzas from below. Remember to order extra for a midnight party.')).toBeVisible();
    await expect(page.getByText('What are you waiting for? Pick a store and then add some pizzas!')).toBeVisible();
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
test('about page', async ({page}) => {
    await page.goto('/about');
    await expect(page.getByText('The secret sauce')).toBeVisible();
    await expect(page.getByText('At JWT Pizza, our amazing')).toBeVisible();
    await expect(page.getByText('FranchiseAboutHistory')).toBeVisible();
});

test('logout', async ({ page }) => {
    await page.route('**/api/auth', async (route) => {
        const method = route.request().method();

        if (method === 'PUT') {
        // login
        const loginReq = { email: 'a@jwt.com', password: 'admin' };
        expect(route.request().postDataJSON()).toMatchObject(loginReq);
        const loginRes = {
            user: { id: 1, name: 'Admin User', email: 'a@jwt.com', roles: [{ role: 'admin' }] },
            token: 'fake-token'
        };
        await route.fulfill({ json: loginRes });
        } else if (method === 'DELETE') {
        // logout
        await route.fulfill({ json: { message: 'logout successful' } });
        }
        
    });

    // login
    await page.goto('/');
    await page.getByRole('link', { name: 'Login' }).click();
    await expect(page.getByText('Welcome back')).toBeVisible();
    await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('heading', { name: /The web's best pizza/ })).toBeVisible();

    // logout
    await page.getByRole('link', { name: 'Logout' }).click();

    // try to order
    await page.getByRole('link', { name: 'Order' }).click();
});

test('not found page', async ({page}) => {
    await page.goto('/abc');
    await expect(page.getByText('Oops')).toBeVisible();
    await expect(page.getByText('It looks like we have dropped a pizza on the floor. Please try another page.')).toBeVisible();
});

test('login error', async ({ page }) => {
    await page.route('*/**/api/auth', async (route) => {
        const loginReq = { email: 'invalid@jwt.com', password: 'wrongpassword' };
        expect(route.request().method()).toBe('PUT');
        expect(route.request().postDataJSON()).toMatchObject(loginReq);
        await route.fulfill({ status: 404, json: { message: 'User not found' } });
    });

    await page.goto('/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('invalid@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();
});