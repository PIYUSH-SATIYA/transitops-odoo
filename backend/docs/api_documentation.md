# TransitOps Backend API Reference

This document serves as the complete index and reference for the TransitOps backend. You should not need to look at the backend source code unless you are debugging specific implementation issues. 

**Base URL:** `http://localhost:3000`
**Authentication:** All routes (except `/api/auth/register` and `/api/auth/login`) require an `Authorization: Bearer <token>` header.

---

## Endpoint Index

### 1. Authentication
- `POST /api/auth/register` - Register a new user and assign a role.
- `POST /api/auth/login` - Authenticate and retrieve session token.

### 2. Vehicles
- `GET /api/vehicles` - List all vehicles.
- `POST /api/vehicles` - Register a new vehicle to the fleet.
- `PUT /api/vehicles/:id` - Update vehicle details.

### 3. Drivers
- `GET /api/drivers` - List all drivers.
- `POST /api/drivers` - Register a new driver.
- `PUT /api/drivers/:id` - Update driver details (e.g., safety score, suspension).

### 4. Trips
- `GET /api/trips` - List all trips.
- `POST /api/trips` - Create a new trip (Draft).
- `PUT /api/trips/:id/dispatch` - Dispatch a trip (transitions statuses).
- `PUT /api/trips/:id/complete` - Complete a trip (restores statuses, logs odometer).
- `PUT /api/trips/:id/cancel` - Cancel a trip.

### 5. Maintenance
- `GET /api/maintenance` - List all maintenance records.
- `POST /api/maintenance` - Log maintenance (sends vehicle to shop).
- `PUT /api/maintenance/:id/close` - Close maintenance (restores vehicle).

### 6. Fuel & Expenses
- `GET /api/expenses/fuel` - List all fuel logs.
- `POST /api/expenses/fuel` - Record a fuel purchase.
- `GET /api/expenses/general` - List all general expenses (tolls, etc.).
- `POST /api/expenses/general` - Record a general expense.

### 7. Dashboard
- `GET /api/dashboard/kpis` - Fetch aggregate KPIs for analytics.

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/register`
*   **Purpose:** Creates a Supabase user, bypassing email confirmation, and inserts their chosen role into the `user_roles` table. Automatically logs them in upon success.
*   **Roles:** Public
*   **Body:** `{ "email": "string", "password": "string", "role": "Fleet Manager" | "Driver" | "Safety Officer" | "Financial Analyst" }`
*   **Response (201):** `{ message, user: { id, email, role }, session }`

### `POST /api/auth/login`
*   **Purpose:** Authenticates the user and fetches their role from the `user_roles` database table.
*   **Roles:** Public
*   **Body:** `{ "email": "string", "password": "string" }`
*   **Response (200):** `{ message, user: { id, email, role }, session }`

---

## 2. Vehicles (`/api/vehicles`)

### `GET /api/vehicles`
*   **Purpose:** Returns a list of all vehicles, ordered by creation date descending.
*   **Roles:** All Authenticated Users

### `POST /api/vehicles`
*   **Purpose:** Registers a new vehicle. Fails with 400 if `registration_number` is a duplicate.
*   **Roles:** Fleet Manager Only
*   **Body:** 
    ```json
    {
      "registration_number": "string (unique, required)",
      "name": "string (required)",
      "type": "string (required)",
      "max_load_capacity": "number (required, kg)",
      "odometer": "number (optional, defaults to 0)",
      "acquisition_cost": "number (required)",
      "region": "string (optional)",
      "status": "Available | On Trip | In Shop | Retired (optional, defaults to Available)"
    }
    ```

### `PUT /api/vehicles/:id`
*   **Purpose:** Updates an existing vehicle.
*   **Roles:** Fleet Manager Only
*   **Body:** Any partial fields from the POST payload.

---

## 3. Drivers (`/api/drivers`)

### `GET /api/drivers`
*   **Purpose:** Returns a list of all drivers, ordered by creation date descending.
*   **Roles:** All Authenticated Users

### `POST /api/drivers`
*   **Purpose:** Registers a new driver. Fails with 400 if `license_number` is a duplicate.
*   **Roles:** Fleet Manager Only
*   **Body:**
    ```json
    {
      "name": "string (required)",
      "license_number": "string (unique, required)",
      "license_category": "string (required)",
      "license_expiry_date": "YYYY-MM-DD (required)",
      "contact_number": "string (optional)",
      "safety_score": "number (optional, defaults to 100.0)",
      "status": "Available | On Trip | Off Duty | Suspended (optional, defaults to Available)"
    }
    ```

### `PUT /api/drivers/:id`
*   **Purpose:** Updates driver details. Often used by Safety Officers to suspend drivers or update safety scores.
*   **Roles:** Fleet Manager, Safety Officer
*   **Body:** Any partial fields from the POST payload.

---

## 4. Trips (`/api/trips`)

### `GET /api/trips`
*   **Purpose:** Lists all trips. Automatically joins basic `vehicle` (registration, name) and `driver` (name, license) data.
*   **Roles:** All Authenticated Users

### `POST /api/trips`
*   **Purpose:** Creates a Draft trip. 
*   **Business Rules Enforced:** 
    1. Rejects if Vehicle or Driver is not `Available`.
    2. Rejects if Driver's `license_expiry_date` is passed.
    3. Rejects if `cargo_weight` exceeds vehicle's `max_load_capacity`.
*   **Roles:** Fleet Manager, Driver
*   **Body:**
    ```json
    {
      "source": "string (required)",
      "destination": "string (required)",
      "vehicle_id": "uuid (required)",
      "driver_id": "uuid (required)",
      "cargo_weight": "number (required)",
      "planned_distance": "number (required)",
      "revenue": "number (optional, for ROI calculation)"
    }
    ```
*   **Response (201):** Trip object with status set to `Draft`.

### `PUT /api/trips/:id/dispatch`
*   **Purpose:** Commences a trip.
*   **Business Rules Enforced:** Changes the Trip status to `Dispatched`. Automatically changes both the assigned Vehicle and Driver statuses to `On Trip`.
*   **Roles:** Fleet Manager, Driver

### `PUT /api/trips/:id/complete`
*   **Purpose:** Finishes a trip.
*   **Business Rules Enforced:** Changes Trip status to `Completed`. Automatically restores the assigned Vehicle and Driver statuses back to `Available`. Optionally updates the vehicle's master odometer reading.
*   **Roles:** Fleet Manager, Driver
*   **Body (Optional):** `{ "final_odometer": "number" }`

### `PUT /api/trips/:id/cancel`
*   **Purpose:** Aborts a trip.
*   **Business Rules Enforced:** Changes Trip status to `Cancelled`. If the trip was currently `Dispatched`, it automatically restores the assigned Vehicle and Driver statuses back to `Available`.
*   **Roles:** Fleet Manager, Driver

---

## 5. Maintenance (`/api/maintenance`)

### `GET /api/maintenance`
*   **Purpose:** Lists all maintenance records, joined with basic vehicle details.
*   **Roles:** All Authenticated Users (specifically Financial Analyst)

### `POST /api/maintenance`
*   **Purpose:** Opens a maintenance record.
*   **Business Rules Enforced:** Creates the log as `Active`. Automatically changes the target Vehicle's status to `In Shop` (preventing it from being dispatched). Rejects if vehicle is `On Trip` or `Retired`.
*   **Roles:** Fleet Manager Only
*   **Body:**
    ```json
    {
      "vehicle_id": "uuid (required)",
      "description": "string (required)",
      "cost": "number (required)",
      "date": "YYYY-MM-DD (optional, defaults to today)"
    }
    ```

### `PUT /api/maintenance/:id/close`
*   **Purpose:** Concludes a maintenance cycle.
*   **Business Rules Enforced:** Changes the log status to `Closed`. Automatically restores the target Vehicle's status back to `Available` (unless the vehicle was marked as `Retired` while in the shop).
*   **Roles:** Fleet Manager Only

---

## 6. Expenses (`/api/expenses`)

### `GET /api/expenses/fuel`
*   **Purpose:** Lists all fuel records.
*   **Roles:** All Authenticated Users

### `POST /api/expenses/fuel`
*   **Purpose:** Records fuel consumed by a vehicle.
*   **Roles:** Fleet Manager, Driver
*   **Body:** `{ "vehicle_id": "uuid", "liters": "number", "cost": "number", "date": "YYYY-MM-DD" }`

### `GET /api/expenses/general`
*   **Purpose:** Lists all general expenses.
*   **Roles:** All Authenticated Users

### `POST /api/expenses/general`
*   **Purpose:** Records a general expense (like tolls).
*   **Roles:** Fleet Manager, Driver
*   **Body:** `{ "vehicle_id": "uuid", "trip_id": "uuid (optional)", "description": "string", "cost": "number", "date": "YYYY-MM-DD" }`

---

## 7. Dashboard (`/api/dashboard`)

### `GET /api/dashboard/kpis`
*   **Purpose:** Aggregates and returns all mandatory analytics for the dashboard view. No parameters required.
*   **Roles:** All Authenticated Users
*   **Response (200):**
    ```json
    {
      "vehicleMetrics": {
        "total": 10,
        "available": 8,
        "active": 1,
        "inMaintenance": 1,
        "fleetUtilizationPercentage": "10.00" // (active / total) * 100
      },
      "tripMetrics": {
        "active": 1,
        "pending": 2,
        "totalRevenue": 1500.00
      },
      "driverMetrics": {
        "onDuty": 1 // Count of drivers 'On Trip'
      },
      "financialMetrics": {
        "totalOperationalCost": 350.00, // Sum of Fuel + Maintenance + General Expenses
        "fuelEfficiencyKmPerLiter": "14.20", // Total Fleet Distance / Total Fuel Liters
        "fleetROI": "0.1500" // (Total Revenue - Total Operational Cost) / Total Acquisition Cost
      }
    }
    ```
