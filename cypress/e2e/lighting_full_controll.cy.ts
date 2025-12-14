// cypress/e2e/3_device_full_flow.cy.js

describe('Flow 3: Lighting Full CRUD & Control Flow (Autosufficient)', () => {
    
    // 💡 ΟΡΙΣΜΟΣ ΣΥΣΚΕΥΗΣ: Δυναμικό όνομα για Idempotency
    const uniqueId = Cypress._.random(1000, 9999);
    const TEST_DEVICE_NAME = `AutoTest Lamp ${uniqueId}`; 
    // Χρησιμοποιούμε το όνομα της συσκευής για τον selector, αλλά πρέπει να είναι σωστός ο κώδικας του Frontend
    const DEVICE_TOGGLE_SELECTOR = `[data-cy="device-toggle-${TEST_DEVICE_NAME.replace(/\s/g, '-')}" ]`;
    
    // Επειδή ο αρχικός κώδικας χρησιμοποιούσε σταθερό όνομα ('testlamp')
    // Θα χρησιμοποιήσουμε το όνομα του κουμπιού για να βρούμε το card, το οποίο είναι πιο αξιόπιστο.

    beforeEach(() => {
        const username = 'elefkapo'; 
        const password = 'omada3'; 
        const API_BASE = Cypress.env('API_URL');

        // --- 0. INTERCEPTS (Για συγχρονισμό) ---
        // Ορίζουμε τα mocks πριν κάνουμε το visit
        cy.intercept('PUT', '**/api/lighting/devices/**').as('updateLight');
        cy.intercept('DELETE', '**/api/lighting/devices/**').as('deleteDevice');
        cy.intercept('POST', '**/api/lighting/devices').as('createDevice'); // Για τη δημιουργία
        cy.intercept('GET', '**/api/lighting/devices').as('getRefresh'); // Το refresh

        // 1. Programmatic Login
        cy.request('POST', `${API_BASE}/api/auth/login`, {
            username: username,
            password: password
        })
        .then((response) => {
            localStorage.setItem('authToken', response.body.token); 
            localStorage.setItem('username', username);
        });

        // 2. Απευθείας επίσκεψη στη σελίδα Home
        cy.visit('/home'); 
        cy.get('header button').first().should('be.visible'); 
    });

    it('should create, navigate to Lighting, toggle, change brightness, and delete the device', () => {
        
        // --- 1. CREATE DEVICE (SETUP VIA API) ---
        cy.log(`1. CREATING DEVICE: ${TEST_DEVICE_NAME} via API`);
        
        // Καλούμε το API για να δημιουργήσουμε τη λάμπα
        cy.request({
            method: 'POST',
            url: `${Cypress.env('API_URL')}/api/lighting/devices`, 
            body: {
                name: TEST_DEVICE_NAME,
                category: 'lamps', // Πρέπει να ταιριάζει με το filter του Lighting.tsx
                status: false,
                brightness: 0,
                location: 'Living Room' // Ή οποιοδήποτε έγκυρο δωμάτιο
            }
        });

        // Επειδή οριστήκαμε στο /home, πλοηγούμαστε στο lighting
        // --- 2. ΠΛΟΗΓΗΣΗ ΣΤΟ LIGHTING ---
        cy.get('header button').first().click(); 
        cy.get('[data-cy="nav-lighting-btn"]').click();
        cy.url().should('include', '/lighting'); 
        
        // Επαλήθευση ότι η συσκευή εμφανίζεται
        cy.contains('.bg-white h3', TEST_DEVICE_NAME).should('be.visible');

        
        // --- 3. TOGGLE ON/OFF (ΑΛΛΑΓΗ ΚΑΤΑΣΤΑΣΗΣ) ---
        
        // 3a. Εύρεση του διακόπτη μέσω του ονόματος της συσκευής
        cy.log('3. Toggling device ON');
       
        cy.contains('.bg-white h3', TEST_DEVICE_NAME)
            .parents('.bg-white')
            .find('button[role="switch"]') // Ο Switch component είναι συνήθως button με role="switch"
            .click();

        // (Περιμένουμε το API call) και ελέγχουμε το Toast
         cy.wait('@updateLight'); 
        cy.contains('[data-sonner-toaster]', 'Device updated successfully', { timeout: 10000 }).should('be.visible');
        
        // 3b. Επαλήθευση νέας κατάστασης (ON)
        cy.contains('.bg-white h3', TEST_DEVICE_NAME)
            .parents('.bg-white')
            .find('button[role="switch"]')
            .should('have.attr', 'aria-checked', 'true');
        

        // --- 4. CHANGE BRIGHTNESS (ΑΛΛΑΓΗ ΦΩΤΕΙΝΟΤΗΤΑΣ) ---
        const newBrightnessValue = 65;
        cy.log(`4. Setting brightness to ${newBrightnessValue}`);
        

        // Εύρεση του slider
        cy.contains('.bg-white h3', TEST_DEVICE_NAME)
            .parents('.bg-white') 
            .find('input[type="range"]') 
            .should('be.visible')
            .invoke('val', newBrightnessValue) 
            .trigger('mouseup', { force: true }); 

        cy.wait('@updateLight'); 
        cy.contains('[data-sonner-toaster]', 'Device updated successfully').should('be.visible');

        // --- 5. TOGGLE OFF (ΑΠΕΝΕΡΓΟΠΟΙΗΣΗ) ---
        // ----------------------------------------------------------------------------------
        cy.log('5. Toggling device OFF');
        cy.contains('.bg-white h3', TEST_DEVICE_NAME)
            .parents('.bg-white')
            .find('button[role="switch"]') 
            .click();

        // Συγχρονισμός: Περιμένουμε το Toast
        cy.wait('@updateLight'); 
        cy.contains('[data-sonner-toaster]', 'Device updated successfully', { timeout: 10000 }).should('be.visible');
        
        // Επαλήθευση κατάστασης (OFF)
        cy.contains('.bg-white h3', TEST_DEVICE_NAME)
            .parents('.bg-white')
            .find('button[role="switch"]')
            .should('have.attr', 'aria-checked', 'false');

        
        // --- 6. DELETE DEVICE (CLEANUP) ---
        cy.log(`6. Deleting device: ${TEST_DEVICE_NAME}`);
        
        // 5a. Βρίσκουμε το κουμπί διαγραφής
        cy.contains('.bg-white h3', TEST_DEVICE_NAME) 
            .parents('.bg-white') 
            .find('button') 
            .last() 
            .click(); 

        // 5b. Mock του παραθύρου επιβεβαίωσης
        cy.on('window:confirm', (str) => {
            expect(str).to.include('delete'); 
            return true; 
        });

        // 5c. Επαλήθευση Toast διαγραφής και απουσίας συσκευής
        cy.wait('@getRefresh');
        cy.contains('[data-sonner-toaster]', 'Device deleted successfully').should('be.visible');
        cy.contains(TEST_DEVICE_NAME).should('not.exist');
    });
});