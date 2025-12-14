/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

// Base URL for the backend API
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
     // window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  async login(username: string, password: string) {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  async register(username: string, password: string, email: string) {
    const response = await api.post('/users', { username, password, email });
    return response.data;
  },

  logout() {
    localStorage.removeItem('authToken');
  },
};

// Devices API - GET /devices/{deviceId}/status, POST /devices/{deviceId}/action
export const devicesAPI = {
  async getDeviceStatus(deviceId: string) {
    const response = await api.get(`/devices/${deviceId}/status`);
    return response.data;
  },

  async controlDevice(deviceId: string, action: any) {
    const response = await api.post(`/devices/${deviceId}/action`, action);
    return response.data;
  },

  async updateDevice(deviceId: string, data: any) {
    const response = await api.put(`/devices/${deviceId}`, data);
    return response.data;
  },

  async deleteDevice(deviceId: string) {
    const response = await api.delete(`/devices/${deviceId}`);
    return response.data;
  },

  async addDeviceToRoom(roomId: string, deviceData: any) {
    const response = await api.post(`/rooms/${roomId}/devices`, deviceData);
    return response.data;
  },
};

// Rooms API - PUT /rooms/{roomId}/temperature, PUT /rooms/{roomId}/lighting
export const roomsAPI = {
  async setRoomTemperature(roomId: string, temperature: number) {
    const response = await api.put(`/rooms/${roomId}/temperature`, { temperature });
    return response.data;
  },

  async setRoomLighting(roomId: string, brightness: number) {
    const response = await api.put(`/rooms/${roomId}/lighting`, { brightness });
    return response.data;
  },

  async deleteRoom(roomId: string) {
    const response = await api.delete(`/rooms/${roomId}`);
    return response.data;
  },
};

// Houses API - POST /houses, DELETE /houses/{houseId}, POST /houses/{houseId}/rooms
export const housesAPI = {
  async createHouse(name: string) {
    const response = await api.post('/houses', { name });
    return response.data;
  },

  async deleteHouse(houseId: string) {
    const response = await api.delete(`/houses/${houseId}`);
    return response.data;
  },

  async addRoomToHouse(houseId: string, roomData: any) {
    const response = await api.post(`/houses/${houseId}/rooms`, roomData);
    return response.data;
  },
};

// Scenarios API - POST /scenarios
export const scenariosAPI = {
  async createScenario(name: string, actions: any[]) {
    const response = await api.post('/scenarios', { name, actions });
    return response.data;
  },
};

// Automations API
export const automationsAPI = {
  // Get all rules
  async getAutomations() {
    const response = await api.get('/automations');
    return response.data;
  },

  // Create a new rule
  // We changed arguments to 'data' to match the form structure better
  async createAutomation(data: any) {
    const response = await api.post('/automations', data);
    return response.data;
  },

  // Update an existing rule
  async updateAutomation(id: string, data: any) {
    const response = await api.put(`/automations/${id}`, data);
    return response.data;
  },

  // Delete a rule
  async deleteAutomation(id: string) {
    const response = await api.delete(`/automations/${id}`);
    return response.data;
  },
};

// Security API - PUT /security/{deviceId}/state
export const securityAPI = {
  async setSecurityState(deviceId: string, state: any) {
    const response = await api.put(`/security/${deviceId}/state`, state);
    return response.data;
  },
};

// User API - GET /users/{userId}/statistics, POST /users/{userId}/notifications, PUT /users/{userId}/home
export const userAPI = {
  async getStatistics(userId: string) {
    const response = await api.get(`/users/${userId}/statistics`);
    return response.data;
  },

  async sendNotification(userId: string, notification: any) {
    const response = await api.post(`/users/${userId}/notifications`, notification);
    return response.data;
  },

  async customizeHome(userId: string, homeData: any) {
    const response = await api.put(`/users/${userId}/home`, homeData);
    return response.data;
  },

  async addWidget(userId: string, widgetData: any) {
    const response = await api.post(`/users/${userId}/widgets`, widgetData);
    return response.data;
  },
};

// Shortcuts API
export const shortcutsAPI = {
  async getShortcuts() {
    const response = await api.get('/shortcuts');
    return response.data;
  },

  async saveShortcuts(shortcuts: any[]) {
    const response = await api.post('/shortcuts', shortcuts);
    return response.data;
  },
};

export default api;
