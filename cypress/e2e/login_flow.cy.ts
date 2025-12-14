// cypress/e2e/login_flow.cy.js

describe('User Authentication: Successful and Unsuccessful Login', () => {
    

    // === HAPPY PATH: Επιτυχής Σύνδεση ===
    it('should successfully log in and navigate to the /home page (Happy Path)', () => {
        
       
        cy.visit('/'); 
        
        // 1. Ενέργεια: Πηγαίνουμε στο Login
        cy.get('[data-cy="welcome-login-btn"]').click();
        
        // 2. Επαλήθευση: Είμαστε στη σελίδα Login
        cy.url().should('include', '/login');
        
        // ... (Συνέχεια με εισαγωγή credentials)
        cy.get('[data-cy="login-username-input"]').type('elefkapo'); 
        cy.get('[data-cy="login-password-input"]').type('omada3'); 
        
        cy.get('[data-cy="login-submit-btn"]').click();
        
        cy.url().should('include', '/home');
    });

    // === UNHAPPY PATH: Αποτυχημένη Σύνδεση ===
    it('should fail to log in with invalid credentials and display an error (Unhappy Path)', () => {
        
        // 💡 Απλά cy.visit()
        cy.visit('/');

        cy.get('[data-cy="welcome-login-btn"]').click();
        
        cy.url().should('include', '/login');
        
        // 2. Ενέργεια: Εισαγωγή ΜΗ Έγκυρων Στοιχείων
        // Χρησιμοποιούμε username/password που είναι σίγουρο ότι δεν υπάρχουν
        cy.get('[data-cy="login-username-input"]').type('invaliduser'); 
        cy.get('[data-cy="login-password-input"]').type('wrongpassword'); 
        
        // 3. Ενέργεια: Υποβολή
        cy.get('[data-cy="login-submit-btn"]').click();

        // 4. Επαλήθευση Αποτυχίας:
        // α) Ο χρήστης πρέπει να παραμείνει στη σελίδα /login
        cy.url().should('include', '/login');
        cy.url().should('not.include', '/home');

        // β) Επαλήθευση Μηνύματος Σφάλματος (πρέπει να το προσαρμόσετε)
        // 💡 ΠΡΟΣΟΧΗ: Αντικαταστήστε το κείμενο 'Invalid credentials' και τον selector 
        // με αυτά που χρησιμοποιεί η εφαρμογή σας για να εμφανίσει το σφάλμα.
        cy.contains('Login failed. Please check your credentials.').should('be.visible'); 
        
        // Ή, αν χρησιμοποιείτε data-cy για το μήνυμα σφάλματος:
        // cy.get('[data-cy="login-error-message"]').should('be.visible').and('contain', 'Invalid credentials');
    });
});