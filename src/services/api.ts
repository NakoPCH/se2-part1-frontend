import axios from 'axios';
import { API_BASE_URL } from '@/config';

// --- 1. DEFINING INTERFACES ---

export interface Device {
  id: string;
  name: string;
  category: string;
  location: string;
  status: boolean | string;
  brightness: number;
}

// Χρησιμοποιούμε Partial όταν κάνουμε update γιατί μπορεί να στείλουμε μόνο ένα πεδίο
export type DeviceUpdateData = Partial<Device>;

export interface AutomationData {
  id?: string;
  name?: string;
  time?: string;
  action?: string;
  isActive?: boolean;
  selectedDevices?: string[];
}

export interface Shortcut {
  id: string;
  type: 'device' | 'automation';
}

// Γενικοί τύποι για τα υπόλοιπα API calls
export interface RoomData {
  name: string;
  type?: string;
}

export interface ScenarioAction {
  deviceId: string;
  action: string;
  value?: unknown;
}

export interface NotificationData {
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error';
}

export interface WidgetData {
  type: string;
  config: Record<string, unknown>;
}


// --- 2. AXIOS CONFIGURATION ---

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
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

// --- 3. API MODULES ---

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

// Devices API
export const devicesAPI = {
  async getDeviceStatus(deviceId: string) {
    const response = await api.get(`/devices/${deviceId}/status`);
    return response.data;
  },

  // Αντικατάσταση 'action: any' με 'Record<string, unknown>' (γενικό αντικείμενο JSON)
  async controlDevice(deviceId: string, action: Record<string, unknown>) {
    const response = await api.post(`/devices/${deviceId}/action`, action);
    return response.data;
  },

  // Αντικατάσταση 'data: any' με 'DeviceUpdateData'
  async updateDevice(deviceId: string, data: DeviceUpdateData) {
    const response = await api.put(`/devices/${deviceId}`, data);
    return response.data;
  },

  async deleteDevice(deviceId: string) {
    const response = await api.delete(`/devices/${deviceId}`);
    return response.data;
  },

  // Αντικατάσταση 'deviceData: any' με 'Partial<Device>'
  async addDeviceToRoom(roomId: string, deviceData: Partial<Device>) {
    const response = await api.post(`/rooms/${roomId}/devices`, deviceData);
    return response.data;
  },
};

// Rooms API
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

// Houses API
export const housesAPI = {
  async createHouse(name: string) {
    const response = await api.post('/houses', { name });
    return response.data;
  },

  async deleteHouse(houseId: string) {
    const response = await api.delete(`/houses/${houseId}`);
    return response.data;
  },

  // Αντικατάσταση 'roomData: any' με 'RoomData'
  async addRoomToHouse(houseId: string, roomData: RoomData) {
    const response = await api.post(`/houses/${houseId}/rooms`, roomData);
    return response.data;
  },
};

// Scenarios API
export const scenariosAPI = {
  // Αντικατάσταση 'actions: any[]' με 'ScenarioAction[]'
  async createScenario(name: string, actions: ScenarioAction[]) {
    const response = await api.post('/scenarios', { name, actions });
    return response.data;
  },
};

// Automations API
export const automationsAPI = {
  async getAutomations() {
    const response = await api.get('/automations');
    return response.data;
  },

  // Αντικατάσταση 'data: any' με 'AutomationData'
  async createAutomation(data: AutomationData) {
    const response = await api.post('/automations', data);
    return response.data;
  },

  // Αντικατάσταση 'data: any' με 'AutomationData' (ή Partial γιατί μπορεί να είναι update)
  async updateAutomation(id: string, data: Partial<AutomationData>) {
    const response = await api.put(`/automations/${id}`, data);
    return response.data;
  },

  async deleteAutomation(id: string) {
    const response = await api.delete(`/automations/${id}`);
    return response.data;
  },
};

// Security API
export const securityAPI = {
  // Αντικατάσταση 'state: any' με 'Record<string, unknown>'
  async setSecurityState(deviceId: string, state: Record<string, unknown>) {
    const response = await api.put(`/security/${deviceId}/state`, state);
    return response.data;
  },
};

// User API
export const userAPI = {
  async getStatistics(userId: string) {
    const response = await api.get(`/users/${userId}/statistics`);
    return response.data;
  },

  // Αντικατάσταση 'notification: any' με 'NotificationData'
  async sendNotification(userId: string, notification: NotificationData) {
    const response = await api.post(`/users/${userId}/notifications`, notification);
    return response.data;
  },

  // Αντικατάσταση 'homeData: any' με 'Record<string, unknown>'
  async customizeHome(userId: string, homeData: Record<string, unknown>) {
    const response = await api.put(`/users/${userId}/home`, homeData);
    return response.data;
  },

  // Αντικατάσταση 'widgetData: any' με 'WidgetData'
  async addWidget(userId: string, widgetData: WidgetData) {
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

  // Αντικατάσταση 'shortcuts: any[]' με 'Shortcut[]'
  async saveShortcuts(shortcuts: Shortcut[]) {
    const response = await api.post('/shortcuts', shortcuts);
    return response.data;
  },
};

export default api;