const supabase = require('../config/supabaseClient');

// Register a new user
const register = async (req, res) => {
    const { email, password } = req.body;

    const { user, error } = await supabase.auth.signUp({ email, password });

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: 'User registered', user });
};

// Log a user in
const login = async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return res.status(401).json({ error: 'Invalid credentials' });

    res.json({ 
        message: 'User logged in', 
        user: data.user, 
        token: data.session.access_token // Use Supabase's JWT
    });
};

module.exports = {
    register,
    login
};