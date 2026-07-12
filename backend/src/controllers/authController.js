import { supabase, supabaseAdmin } from '../config/supabase.js';

export const register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    const validRoles = ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // 1. Create the user using the Admin API (bypassing email confirmation for this demo)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true 
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const userId = authData.user.id;

    // 2. Assign the role in the user_roles table
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert([{ id: userId, role }]);

    if (roleError) {
      // If role insertion fails, we should ideally rollback user creation, but for simplicity we log it
      console.error('Role insertion failed:', roleError);
      return res.status(500).json({ error: 'Failed to assign role to user' });
    }

    // 3. Automatically sign them in to return a session token
    const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (loginError) {
      return res.status(201).json({ 
        message: 'User created successfully, but auto-login failed. Please log in manually.',
        user: authData.user 
      });
    }

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: sessionData.user.id,
        email: sessionData.user.email,
        role
      },
      session: sessionData.session
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (loginError) {
      return res.status(401).json({ error: loginError.message });
    }

    // Fetch the user's role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('id', sessionData.user.id)
      .single();

    if (roleError) {
      return res.status(500).json({ error: 'Could not fetch user role' });
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: sessionData.user.id,
        email: sessionData.user.email,
        role: roleData.role
      },
      session: sessionData.session
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
