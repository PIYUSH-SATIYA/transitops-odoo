import { supabaseAdmin } from '../config/supabase.js';

export const getFuelLogs = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('fuel_logs')
      .select('*, vehicle:vehicles(registration_number, name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching fuel logs:', error);
    res.status(500).json({ error: 'Failed to fetch fuel logs' });
  }
};

export const createFuelLog = async (req, res) => {
  try {
    const { vehicle_id, liters, cost, date } = req.body;

    const { data, error } = await supabaseAdmin
      .from('fuel_logs')
      .insert([{
        vehicle_id,
        liters,
        cost,
        date: date || new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Fuel log created successfully', log: data });
  } catch (error) {
    console.error('Error creating fuel log:', error);
    res.status(500).json({ error: 'Failed to create fuel log' });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('expenses')
      .select('*, vehicle:vehicles(registration_number)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

export const createExpense = async (req, res) => {
  try {
    const { vehicle_id, trip_id, description, cost, date } = req.body;

    const { data, error } = await supabaseAdmin
      .from('expenses')
      .insert([{
        vehicle_id,
        trip_id: trip_id || null,
        description,
        cost,
        date: date || new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Expense created successfully', expense: data });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
};
