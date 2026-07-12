import { supabaseAdmin } from '../config/supabase.js';

export const getVehicles = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
};

export const createVehicle = async (req, res) => {
  try {
    const { registration_number, name, type, max_load_capacity, odometer, acquisition_cost, status } = req.body;

    const { data, error } = await supabaseAdmin
      .from('vehicles')
      .insert([{
        registration_number,
        name,
        type,
        max_load_capacity,
        odometer: odometer || 0,
        acquisition_cost,
        status: status || 'Available'
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({ error: 'Registration number already exists' });
      }
      throw error;
    }

    res.status(201).json({ message: 'Vehicle created successfully', vehicle: data });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabaseAdmin
      .from('vehicles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.status(200).json({ message: 'Vehicle updated successfully', vehicle: data });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
};
