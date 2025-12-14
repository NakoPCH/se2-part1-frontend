// cypress.config.js

import { defineConfig } from 'cypress';

export default defineConfig({
  
  // 1. ΟΡΙΣΜΟΣ BACKEND URL ΣΤΟ ENV
  // Χρησιμοποιούμε τη μεταβλητή env για να αποθηκεύσουμε το URL του API
  env: {
    API_URL: 'http://localhost:5050', // 💡 ΑΛΛΑΞΤΕ ΑΝ ΤΟ BACKEND ΤΡΕΧΕΙ ΣΕ ΑΛΛΗ ΘΥΡΑ
  },

  e2e: {
    // 2. ΟΡΙΣΜΟΣ FRONTEND URL ΣΤΟ baseUrl
    // Το cy.visit('/home') θα γίνει http://localhost:8081/home
    baseUrl: 'http://localhost:8081', // 💡 ΑΛΛΑΞΤΕ ΑΝ ΤΟ FRONTEND ΤΡΕΧΕΙ ΣΕ ΑΛΛΗ ΘΥΡΑ
    
    defaultCommandTimeout: 10000, 
    setupNodeEvents(on, config) {
      // ...
    },
  },
});