/// <reference types="cypress" />
// 1. TYPE DEFINITION
declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to log in via UI
     * @example cy.login('myUser', 'myPassword')
     */
    login(username: string, password: string): Chainable<void>;
  }
}

// 2. IMPLEMENT THE COMMAND
Cypress.Commands.add('login', (username, password) => {
  // CHANGE THIS: Visit '/login' directly instead of '/'
  cy.visit('/login'); 

  // Now the input exists, so this will work!
  cy.get('input[placeholder="Username"]').type(username);
  cy.get('input[placeholder="Password"]').type(password);
  cy.get('button[type="submit"]').click();

  // Wait until we are on the Home page
  cy.url().should('include', '/home');
});