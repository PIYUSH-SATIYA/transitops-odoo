import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { supabase, supabaseAdmin } from './config/supabase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Basic Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'TransitOps API is running' });
});

// Check Supabase connection
app.get('/api/supabase-status', async (req, res) => {
  try {
    // Attempting a simple query using the admin client to check connection
    const { data, error } = await supabaseAdmin.from('user_roles').select('count', { count: 'exact', head: true });
    
    if (error) {
      throw error;
    }

    res.status(200).json({ status: 'connected', message: 'Successfully connected to Supabase' });
  } catch (error) {
    console.error('Supabase connection error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to connect to Supabase', details: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
