describe('User Authentication: Successful and Unsuccessful Login', () => {

    // === HAPPY PATH: Successful Login ===
    it('should successfully log in and navigate to the /home page (Happy Path)', () => {

        // 1. Visit the root (Welcome Page)
        cy.visit('/');

        // Verify we are on Welcome page
        cy.contains('h1', 'HOMIEASE').should('be.visible');

        // 2. Action: Click "Log in" button
        // We target the button text "Log in" which is inside the Link in Welcome.tsx
        cy.contains('button', 'Log in').click();

        // 3. Verify: We are on the Login page
        cy.url().should('include', '/login');
        cy.contains('h1', 'Welcome Back').should('be.visible');

        // 4. Action: Enter Credentials
        // Using placeholder selectors matching Login.tsx
        cy.get('input[placeholder="Username"]').type('elefkapo');
        cy.get('input[placeholder="Password"]').type('omada3');

        // 5. Action: Submit
        cy.get('button[type="submit"]').click();

        // 6. Verify: Redirect to Home
        cy.url().should('include', '/home');

        // Extra check: Verify the Greeting on Home matches the username
        // Note: Home.tsx capitalizes the username
        cy.contains('h2 span', 'Elefkapo', { matchCase: false }).should('be.visible');
    });

    // === UNHAPPY PATH: Failed Login ===
    it('should fail to log in with invalid credentials and display an error (Unhappy Path)', () => {

        // 1. Start directly at login or navigate from home
        cy.visit('/login');

        // 2. Action: Enter INVALID Credentials
        cy.get('input[placeholder="Username"]').type('invaliduser');
        cy.get('input[placeholder="Password"]').type('wrongpassword');

        // 3. Action: Submit
        cy.get('button[type="submit"]').click();

        // 4. Verify Failure:
        // a) URL should still be /login
        cy.url().should('include', '/login');
        cy.url().should('not.include', '/home');

        // b) Verify Error Message (Toast)
        // Matches the toast.error call in Login.tsx: "Login failed. Please check your credentials."
        // We look for the text inside the Sonner toaster
        cy.contains('Login failed. Please check your credentials.').should('be.visible');
    });

});