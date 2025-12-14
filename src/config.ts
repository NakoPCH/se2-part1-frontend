// src/config.ts
// This automatically selects the correct URL:
// 1. On your computer, it uses what's in .env (localhost:5050)
// 2. On Render, it uses the environment variable you set in the dashboard
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";