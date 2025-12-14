import { defineConfig } from "cypress";
import dotenv from "dotenv"; 

// Load the .env file (where VITE_API_BASE_URL=http://localhost:6060 is defined)
dotenv.config();

export default defineConfig({
  e2e: {
    // 1. FRONTEND:
    baseUrl: "http://localhost:5173", 

    setupNodeEvents(on, config) {
      // 2. BACKEND: Pass the variable from .env to Cypress
      // Now Cypress tests can use Cypress.env('VITE_API_BASE_URL')
      config.env.VITE_API_BASE_URL = process.env.VITE_API_BASE_URL;
      
      return config;
    },
  },
});