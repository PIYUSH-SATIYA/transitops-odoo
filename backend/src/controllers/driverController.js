import { supabaseAdmin } from '../config/supabase.js';

export const getDrivers = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('drivers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ error: 'Failed to fetch drivers' });
  }
};

export const createDriver = async (req, res) => {
  try {
    const { name, license_number, license_category, license_expiry_date, contact_number, safety_score, status } = req.body;

    const { data, error } = await supabaseAdmin
      .from('drivers')
      .insert([{
        name,
        license_number,
        license_category,
        license_expiry_date,
        contact_number,
        safety_score: safety_score || 100.0,
        status: status || 'Available'
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({ error: 'License number already exists' });
      }
      throw error;
    }

    res.status(201).json({ message: 'Driver created successfully', driver: data });
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({ error: 'Failed to create driver' });
  }
};

export const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabaseAdmin
      .from('drivers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.status(200).json({ message: 'Driver updated successfully', driver: data });
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({ error: 'Failed to update driver' });
  }
};
