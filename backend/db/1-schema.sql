-- ==========================================
-- TransitOps Database Schema
-- ==========================================

-- ------------------------------------------
-- 1. Custom Types (Enums)
-- ------------------------------------------

-- We previously created user_role:
-- CREATE TYPE user_role AS ENUM ('Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst');

CREATE TYPE vehicle_status AS ENUM ('Available', 'On Trip', 'In Shop', 'Retired');
CREATE TYPE driver_status AS ENUM ('Available', 'On Trip', 'Off Duty', 'Suspended');
CREATE TYPE trip_status AS ENUM ('Draft', 'Dispatched', 'Completed', 'Cancelled');
CREATE TYPE maintenance_status AS ENUM ('Active', 'Closed');

-- ------------------------------------------
-- 2. Tables
-- ------------------------------------------

-- Note: user_roles table was created in the previous step.
-- CREATE TABLE public.user_roles (
--     id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
--     role user_role NOT NULL
-- );

-- Vehicles Table
CREATE TABLE public.vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL, -- e.g., Model Name
    type VARCHAR(50) NOT NULL, -- e.g., Van, Truck
    max_load_capacity NUMERIC(10, 2) NOT NULL, -- In kg
    odometer NUMERIC(12, 2) DEFAULT 0,
    acquisition_cost NUMERIC(12, 2) NOT NULL,
    status vehicle_status DEFAULT 'Available' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drivers Table
CREATE TABLE public.drivers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_category VARCHAR(20) NOT NULL,
    license_expiry_date DATE NOT NULL,
    contact_number VARCHAR(20),
    safety_score NUMERIC(5, 2) DEFAULT 100.0,
    status driver_status DEFAULT 'Available' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trips Table
CREATE TABLE public.trips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE RESTRICT,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE RESTRICT,
    source VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    cargo_weight NUMERIC(10, 2) NOT NULL,
    planned_distance NUMERIC(10, 2) NOT NULL,
    status trip_status DEFAULT 'Draft' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance Logs Table
CREATE TABLE public.maintenance_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    cost NUMERIC(12, 2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status maintenance_status DEFAULT 'Active' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fuel Logs Table
CREATE TABLE public.fuel_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
    liters NUMERIC(10, 2) NOT NULL,
    cost NUMERIC(12, 2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- General Expenses Table (e.g., Tolls)
CREATE TABLE public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    cost NUMERIC(12, 2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------
-- 3. Row Level Security (RLS)
-- ------------------------------------------

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------
-- 4. Triggers for updated_at timestamps
-- ------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vehicles_modtime
    BEFORE UPDATE ON public.vehicles
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_drivers_modtime
    BEFORE UPDATE ON public.drivers
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_trips_modtime
    BEFORE UPDATE ON public.trips
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_maintenance_logs_modtime
    BEFORE UPDATE ON public.maintenance_logs
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
