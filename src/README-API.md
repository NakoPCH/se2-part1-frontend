# Backend API Integration

## Backend Endpoints Being Called

This frontend is now connected to the backend and calls the following endpoints:

### 1. **POST /auth/login** - User Authentication
- **Used in:** `src/pages/Login.tsx`
- **Purpose:** Authenticate user and receive JWT token
- **Request:** `{ username, password }`

### 2. **POST /users** - User Registration  
- **Used in:** `src/pages/Signup.tsx`
- **Purpose:** Create new user account
- **Request:** `{ username, email, password }`

### 3. **POST /devices/{deviceId}/action** - Control Device
- **Used in:** `src/pages/Lighting.tsx`
- **Purpose:** Toggle lights on/off, control device actions
- **Request:** `{ status: true/false }`

### 4. **GET /devices/{deviceId}/status** - Get Device Status
- **Used in:** `src/services/api.ts`
- **Purpose:** Fetch current status of a device
- **Available for use in any component**

### 5. **PUT /rooms/{roomId}/temperature** - Set Room Temperature
- **Used in:** `src/services/api.ts` 
- **Purpose:** Control thermostat and room temperature
- **Request:** `{ temperature: number }`
- **Available for Temperature page**

### 6. **PUT /rooms/{roomId}/lighting** - Control Room Lighting
- **Used in:** `src/services/api.ts`
- **Purpose:** Set brightness for all lights in a room
- **Request:** `{ brightness: number }`

### 7. **POST /houses** - Create House
- **Used in:** `src/services/api.ts`
- **Purpose:** Add new house to the system
- **Request:** `{ name: string }`

### 8. **POST /scenarios** - Create Scenario
- **Used in:** `src/services/api.ts`
- **Purpose:** Create automation scenarios
- **Request:** `{ name: string, actions: array }`

## Setup Instructions

1. **Start Backend Server:**
   ```bash
   cd smart-home-backend-full
   npm install
   npm start
   ```

2. **Configure Frontend:**
   - Create `.env` file in frontend root:
     ```
     VITE_API_URL=http://localhost:5050/api
     ```

3. **Start Frontend:**
   ```bash
   npm install
   npm run dev
   ```

## Authentication Flow

1. User signs up via `/signup` → POST /users
2. User logs in via `/login` → POST /auth/login
3. JWT token is stored in localStorage
4. Token is automatically added to all subsequent API requests
5. If token expires (401), user is redirected to login

## API Service Structure

All backend calls are centralized in `src/services/api.ts` with organized modules:
- `authAPI` - Authentication endpoints
- `devicesAPI` - Device control and management  
- `roomsAPI` - Room-level controls
- `housesAPI` - House management
- `scenariosAPI` - Automation scenarios
- `automationsAPI` - Automation rules
- `securityAPI` - Security system controls
- `userAPI` - User preferences and statistics
