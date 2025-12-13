// cypress/e2e/login_success.cy.js

describe('User Authentication: Successful Login', () => {
    
    // Το URL όπου βρίσκεται η σελίδα σας (μπορεί να είναι μόνο '/')
    const LOGIN_PAGE_URL = 'http://localhost:8081/'; 

    it('should successfully log in and navigate to the /home page (Happy Path)', () => {
        
        cy.visit(LOGIN_PAGE_URL);
        
        // 1. Ενέργεια: Εισαγωγή Έγκυρων Στοιχείων (χρησιμοποιώντας τα data-cy)
        // 2**. Πατάμε το κουμπί Log in για να πάμε στην οθόνη Login
        cy.get('[data-cy="welcome-login-btn"]').click();
        
        // 3**. Επαλήθευση: Είμαστε στη σελίδα Login
        cy.url().should('include', '/login');

        // [data-cy="login-username-input"]
        cy.get('[data-cy="login-username-input"]').type('elefkapo'); 
        // [data-cy="login-password-input"]
        cy.get('[data-cy="login-password-input"]').type('omada3'); 
        
        // 2. Ενέργεια: Υποβολή
        // [data-cy="login-submit-btn"]
        cy.get('[data-cy="login-submit-btn"]').click();
        
        
        // 4. Επαλήθευση πλοήγησης: Ο κώδικάς σας πλοηγείται στο "/home"
        cy.url().should('include', '/home');
    });
});