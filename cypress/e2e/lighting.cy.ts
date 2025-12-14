// cypress/e2e/lighting_full_flow.cy.ts

// --- 1. TYPE DEFINITIONS & CUSTOM COMMAND ---
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    login(username: string, password: string): Chainable<void>;
  }
}

Cypress.Commands.add('login', (username, password) => {
  cy.visit('/login'); 
  cy.get('input[placeholder="Username"]').type(username);
  cy.get('input[placeholder="Password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/home');
});

// --- 2. THE TEST SUITE ---
describe('End-to-End Flow: Login to Lighting Control', () => {

  const uniqueId = Cypress._.random(1000, 9999);
  const TEST_DEVICE_NAME = `Cypress Lamp ${uniqueId}`;

  beforeEach(() => {
    cy.intercept('PUT', '**/api/lighting/devices/**').as('updateLight');
    cy.intercept('DELETE', '**/api/lighting/devices/**').as('deleteDevice');
    cy.intercept('POST', '**/api/lighting/devices').as('createDevice');
    cy.intercept('GET', '**/api/lighting/devices').as('getLights');
  });

  it('starts at Welcome, logs in, navigates to Lighting, and manages a device', () => {
    
    // 1. START AT WELCOME PAGE
    cy.visit('/');
    cy.contains('h1', 'HOMIEASE').should('be.visible');

    // 2. LOGIN
    cy.login('elefkapo', 'omada3');

    // 3. CREATE TEST DEVICE (via API)
    cy.log(`Creating device: ${TEST_DEVICE_NAME}`);
    cy.request({
      method: 'POST',
      url: 'http://localhost:5050/api/lighting/devices',
      body: {
        name: TEST_DEVICE_NAME,
        category: 'lamps',
        status: false,
        brightness: 0,
        location: 'Living Room'
      }
    });

    // 4. NAVIGATE TO LIGHTING PAGE
    cy.get('[data-testid="menu-trigger"]').click();
    cy.get('[data-testid="menu-item-lighting"]').should('be.visible').click();
    
    cy.url().should('include', '/lighting');
    cy.contains(TEST_DEVICE_NAME).should('be.visible');

    // --- 5. TOGGLE DEVICE ON (CORRECTED) ---
    cy.log('Toggling device ON');
    
    // Click the switch
    cy.contains('.bg-white', TEST_DEVICE_NAME)
      .find('button[role="switch"]')
      .click();

    // Wait for API call
    cy.wait('@updateLight'); 
    
    // FIX: Removed toast check. Instead, check if the switch is actually ON.
    // Shadcn/Radix UI switches use 'data-state' or 'aria-checked'
    cy.contains('.bg-white', TEST_DEVICE_NAME)
      .find('button[role="switch"]')
      .should('have.attr', 'data-state', 'checked');

    // --- 6. CHANGE BRIGHTNESS (CORRECTED) ---
    const newBrightness = 75;
    cy.log(`Setting brightness to ${newBrightness}%`);
    
    cy.contains('.bg-white', TEST_DEVICE_NAME)
      .find('input[type="range"]')
      .invoke('val', newBrightness)
      .trigger('change')
      .trigger('mouseup', { force: true });

    cy.wait('@updateLight');
    // Again, no toast check here as per your Lighting.tsx logic

    // --- 7. TOGGLE DEVICE OFF ---
    cy.log('Toggling device OFF');
    cy.contains('.bg-white', TEST_DEVICE_NAME)
      .find('button[role="switch"]')
      .click();
      
    cy.wait('@updateLight');
    
    // Verify it is OFF
    cy.contains('.bg-white', TEST_DEVICE_NAME)
      .find('button[role="switch"]')
      .should('have.attr', 'data-state', 'unchecked');

    // --- 8. DELETE DEVICE ---
    cy.log('Deleting device');
    
    cy.contains('.bg-white', TEST_DEVICE_NAME)
      .find('button')
      .filter((index, button) => Cypress.$(button).find('svg').length > 0) // Find button with icon
      .last() // The trash button is usually last
      .click();

    cy.on('window:confirm', () => true);

    cy.wait('@deleteDevice');
    
    // NOTE: Your code DOES have a toast for delete, so we keep this check!
    cy.contains('Device deleted successfully').should('be.visible');
    cy.contains(TEST_DEVICE_NAME).should('not.exist');
  });
});