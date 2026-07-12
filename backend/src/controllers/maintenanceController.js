import { supabaseAdmin } from '../config/supabase.js';

export const getMaintenanceLogs = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('maintenance_logs')
      .select('*, vehicle:vehicles(registration_number, name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching maintenance logs:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance logs' });
  }
};

export const createMaintenanceLog = async (req, res) => {
  try {
    const { vehicle_id, description, cost, date } = req.body;

    // 1. Verify vehicle exists and is not already retired or in shop
    const { data: vehicle, error: vehicleError } = await supabaseAdmin
      .from('vehicles')
      .select('status')
      .eq('id', vehicle_id)
      .single();

    if (vehicleError || !vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    if (vehicle.status === 'Retired') return res.status(400).json({ error: 'Cannot maintain a retired vehicle' });
    if (vehicle.status === 'On Trip') return res.status(400).json({ error: 'Cannot maintain a vehicle currently on a trip' });

    // 2. Insert Maintenance Log
    const { data: log, error: logError } = await supabaseAdmin
      .from('maintenance_logs')
      .insert([{
        vehicle_id,
        description,
        cost,
        date: date || new Date().toISOString().split('T')[0],
        status: 'Active'
      }])
      .select()
      .single();

    if (logError) throw logError;

    // 3. Update Vehicle Status to 'In Shop'
    await supabaseAdmin.from('vehicles').update({ status: 'In Shop' }).eq('id', vehicle_id);

    res.status(201).json({ message: 'Maintenance record created and vehicle moved to In Shop', log });
  } catch (error) {
    console.error('Error creating maintenance log:', error);
    res.status(500).json({ error: 'Failed to create maintenance log' });
  }
};

export const closeMaintenanceLog = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: log, error: fetchError } = await supabaseAdmin
      .from('maintenance_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !log) return res.status(404).json({ error: 'Maintenance log not found' });
    if (log.status === 'Closed') return res.status(400).json({ error: 'Maintenance log is already closed' });

    // 1. Update Log Status
    const { error: logError } = await supabaseAdmin
      .from('maintenance_logs')
      .update({ status: 'Closed' })
      .eq('id', id);

    if (logError) throw logError;

    // 2. Restore Vehicle Status to 'Available' (only if it wasn't retired)
    const { data: vehicle } = await supabaseAdmin.from('vehicles').select('status').eq('id', log.vehicle_id).single();
    if (vehicle && vehicle.status !== 'Retired') {
      await supabaseAdmin.from('vehicles').update({ status: 'Available' }).eq('id', log.vehicle_id);
    }

    res.status(200).json({ message: 'Maintenance closed and vehicle restored to Available' });
  } catch (error) {
    console.error('Error closing maintenance log:', error);
    res.status(500).json({ error: 'Failed to close maintenance log' });
  }
};
