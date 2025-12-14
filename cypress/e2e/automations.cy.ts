describe('Automations Page User Flows', () => {

  // 1. SETUP
  beforeEach(() => {
    cy.login('okanpala', 'omada3');
    cy.get('button').find('svg.lucide-menu').parent().click();
    cy.contains('Automations').click();
    cy.url().should('include', '/automations');
  });

  // --- FLOW 1: ROBUST CREATE & DELETE ---
  it('should create a unique rule and then delete it', () => {
    // GENERATE UNIQUE NAME: e.g., "Sleep Mode 1734205566"
    const uniqueRuleName = `Sleep Mode ${Date.now()}`;

    // === PART A: CREATE ===
    cy.get('[data-testid="add-automation-btn"]').click();

    // Fill Name with UNIQUE value
    cy.get('[data-testid="rule-name-input"]')
      .clear()
      .type(uniqueRuleName);

    cy.get('[data-testid="rule-time-input"]').type('23:00');
    cy.get('[data-testid="rule-action-select"]').select('turn_off');

    // Select Lamps
    cy.get('[data-testid^="device-item-"]').each(($el) => {
      if ($el.text().includes('💡')) {
        cy.wrap($el).click();
      }
    });

    cy.get('[data-testid="submit-rule-btn"]').click();

    // Verify Creation (Look for specific unique name)
    cy.contains('New rule created').should('be.visible');
    cy.contains(uniqueRuleName).should('be.visible');

    // === PART B: DELETE (Cleanup) ===
    // Find the SPECIFIC card with our unique name
    cy.contains('div', uniqueRuleName)
      .parents('[data-testid^="automation-card-"]')
      .find('[data-testid^="delete-automation-"]')
      .click();

    // Verify Deletion
    // Only checks if OUR rule is gone. Old "Sleep Mode" rules won't fail this test.
    cy.contains('Automation rule deleted').should('be.visible');
    cy.contains(uniqueRuleName).should('not.exist');
  });

  // --- FLOW 2: TOGGLE ---
  it('should toggle an existing automation rule', () => {
    cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="automation-toggle-"]').length > 0) {
            cy.get('[data-testid^="automation-toggle-"]').first().click();
        } else {
            cy.log('Skipping toggle test: No automations found');
        }
    });
  });

  // --- FLOW 3: VALIDATION ERROR ---
  it('should fail to create a rule without a name', () => {
    cy.get('[data-testid="add-automation-btn"]').click();
    cy.get('[data-testid="rule-name-input"]').clear();
    cy.get('[data-testid="rule-time-input"]').type('10:00');
    cy.get('[data-testid="submit-rule-btn"]').click();

    cy.get('[data-testid="rule-name-input"]')
      .invoke('prop', 'validity')
      .should('deep.include', { valid: false });
      
    cy.get('[data-testid="submit-rule-btn"]').should('be.visible');
  });
});