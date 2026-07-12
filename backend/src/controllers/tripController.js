import { supabaseAdmin } from '../config/supabase.js';

export const getTrips = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('trips')
      .select('*, vehicle:vehicles(registration_number, name), driver:drivers(name, license_number)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
};

export const createTrip = async (req, res) => {
  try {
    const { source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, revenue } = req.body;

    // 1. Validate Vehicle
    const { data: vehicle, error: vehicleError } = await supabaseAdmin
      .from('vehicles')
      .select('status, max_load_capacity')
      .eq('id', vehicle_id)
      .single();

    if (vehicleError || !vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    if (vehicle.status !== 'Available') return res.status(400).json({ error: 'Vehicle is not available' });
    if (cargo_weight > vehicle.max_load_capacity) return res.status(400).json({ error: 'Cargo weight exceeds vehicle maximum capacity' });

    // 2. Validate Driver
    const { data: driver, error: driverError } = await supabaseAdmin
      .from('drivers')
      .select('status, license_expiry_date')
      .eq('id', driver_id)
      .single();

    if (driverError || !driver) return res.status(404).json({ error: 'Driver not found' });
    if (driver.status !== 'Available') return res.status(400).json({ error: 'Driver is not available' });
    
    if (new Date(driver.license_expiry_date) < new Date()) {
      return res.status(400).json({ error: 'Driver license is expired' });
    }

    // 3. Create Trip (Status defaults to 'Draft')
    const { data: trip, error: tripError } = await supabaseAdmin
      .from('trips')
      .insert([{
        source,
        destination,
        vehicle_id,
        driver_id,
        cargo_weight,
        planned_distance,
        revenue: revenue || 0,
        status: 'Draft'
      }])
      .select()
      .single();

    if (tripError) throw tripError;

    res.status(201).json({ message: 'Trip created successfully', trip });
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ error: 'Failed to create trip' });
  }
};

export const dispatchTrip = async (req, res) => {
  try {
    const { id } = req.params;

    // We need to fetch the trip first to get vehicle_id and driver_id
    const { data: trip, error: fetchError } = await supabaseAdmin
      .from('trips')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !trip) return res.status(404).json({ error: 'Trip not found' });
    if (trip.status !== 'Draft') return res.status(400).json({ error: 'Only Draft trips can be dispatched' });

    // Update Trip to Dispatched
    const { error: tripError } = await supabaseAdmin.from('trips').update({ status: 'Dispatched' }).eq('id', id);
    if (tripError) throw tripError;

    // Update Vehicle and Driver status to 'On Trip'
    await supabaseAdmin.from('vehicles').update({ status: 'On Trip' }).eq('id', trip.vehicle_id);
    await supabaseAdmin.from('drivers').update({ status: 'On Trip' }).eq('id', trip.driver_id);

    res.status(200).json({ message: 'Trip dispatched successfully' });
  } catch (error) {
    console.error('Error dispatching trip:', error);
    res.status(500).json({ error: 'Failed to dispatch trip' });
  }
};

export const completeTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const { final_odometer, fuel_consumed } = req.body;

    const { data: trip, error: fetchError } = await supabaseAdmin
      .from('trips')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !trip) return res.status(404).json({ error: 'Trip not found' });
    if (trip.status !== 'Dispatched') return res.status(400).json({ error: 'Only Dispatched trips can be completed' });

    // Update Trip to Completed
    const { error: tripError } = await supabaseAdmin.from('trips').update({ status: 'Completed' }).eq('id', id);
    if (tripError) throw tripError;

    // Update Vehicle to Available and set new odometer
    let vehicleUpdate = { status: 'Available' };
    if (final_odometer) {
      vehicleUpdate.odometer = final_odometer;
    }
    await supabaseAdmin.from('vehicles').update(vehicleUpdate).eq('id', trip.vehicle_id);

    // Update Driver to Available
    await supabaseAdmin.from('drivers').update({ status: 'Available' }).eq('id', trip.driver_id);

    res.status(200).json({ message: 'Trip completed successfully' });
  } catch (error) {
    console.error('Error completing trip:', error);
    res.status(500).json({ error: 'Failed to complete trip' });
  }
};

export const cancelTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: trip, error: fetchError } = await supabaseAdmin
      .from('trips')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !trip) return res.status(404).json({ error: 'Trip not found' });
    
    // Update Trip to Cancelled
    const { error: tripError } = await supabaseAdmin.from('trips').update({ status: 'Cancelled' }).eq('id', id);
    if (tripError) throw tripError;

    // Only restore statuses if it was already dispatched
    if (trip.status === 'Dispatched') {
      await supabaseAdmin.from('vehicles').update({ status: 'Available' }).eq('id', trip.vehicle_id);
      await supabaseAdmin.from('drivers').update({ status: 'Available' }).eq('id', trip.driver_id);
    }

    res.status(200).json({ message: 'Trip cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling trip:', error);
    res.status(500).json({ error: 'Failed to cancel trip' });
  }
};
