# Curiosity Report: Cypress Testing

## Why Cypress

Cypress is a modern front-end testing framework designed to make testing web applications fast, easy, and reliable. It differs from other traditional testing frameworks like Playwright or Jest since Cypress runs directly in the browser, allowing developers to write tests that act how real users will interact with your application.
I have written tests in Jest, and have never been a big fan. Looking into Cypress, it was something that really caught my eye.
What I found was a low entry level, making it easy and quick to learn.

## What Makes Cypress Unique

What makes Cypress unique:

- **Runs inside the browser**: Cypress executes the test code in a way that gives it access to the DOM in a browser, meaning you are not looking at the DOM in a console/terminal.
- **Automatic waiting**: It automatically waits for commands and assertions before moving on. This eliminates the need for manual `wait` logic.
- **Time travel**: Cypress takes snapshots as your tests run. You can hover over each step in the UI to see exactly what happened at any point in time. This makes debugging a breeze.
- **Network control**: You can stub network requests, inspect outgoing requests, and simulate server responses easily.

## Cypress Example

Here’s a basic Cypress test for a login form:

```js
describe('Login Page', () => {
  it('should log in a user', () => {
    cy.visit('/login');
    cy.get('input[name=email]').type('user@example.com');
    cy.get('input[name=password]').type('password123');
    cy.get('button[type=submit]').click();
    cy.url().should('include', '/dashboard');
  });
});
