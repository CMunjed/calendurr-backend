const supabase = require('../config/supabaseClient');

// Register a new user
const register = async (req, res) => {
    const { email, password } = req.body;

    try {
        // First, sign up the user
        const { user, error } = await supabase.auth.signUp({ 
            email, 
            password //,
            //options: {
            //    emailRedirectTo: 'http://localhost:3000/login'
            //}
        });

        if (error) throw error;

        // Commented out confirmation email logic for now.
        // In development, we'll use a service role key to confirm the email
        /*if (process.env.NODE_ENV === 'development') {
            const serviceRoleClient = require('@supabase/supabase-js').createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_SERVICE_ROLE_KEY
            );

            const { error: confirmError } = await serviceRoleClient.auth.admin.updateUserById(
                user.id,
                { email_confirm: true }
            );
            
            if (confirmError) {
                console.error('Error confirming email:', confirmError);
                throw new Error('Registration successful but email confirmation failed');
            }
        }*/

        res.json({ message: 'User registered', user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Log a user in
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ 
            email, 
            password 
        });
        
        if (error) throw error;
        
        // Get session from supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        // Set session cookie in the response
        res.cookie('sb-access-token', session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        });

        res.json({ 
            message: 'User logged in', 
            user: data.user,
            //session: session      // Returning the session data in the json response poses security risks.
        });
    } catch (error) {
        console.error('Login error: ', error);
        res.status(401).json({ error: error.message });
    }
};

// Get current user
const me = async (req, res) => {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        if (!user) throw new Error('No user found');

        res.json({ user });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

module.exports = {
    register,
    login,
    me
};